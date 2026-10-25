import type { Plugin, ResolvedConfig } from 'vite'
import type { MockServerPluginOptions } from '../types/index.js'
import type { ProxySetup } from '../utils/index.js'
import type { ResolvedMockServerPluginOptions } from './options.js'
import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import { generateMockServer } from '../build/index.js'
import { requestRecoverySetup } from '../mockHttp/index.js'
import { Recorder } from '../recorder/index.js'
import { MOCK_TEMP_FILE_RE, setupProxyConfigure } from '../utils/index.js'
import { initMockMiddlewares } from './init.js'
import { createMockLogger } from './logger.js'
import { resolvePluginOptions, resolveRecordOptions } from './options.js'

/**
 * Shared resolved options between the server plugin and the build plugin
 *
 * 服务端插件与构建插件之间共享的解析结果
 */
interface ResolvedOptionsHolder {
  /**
   * Resolved options keyed by the resolved Vite config
   *
   * 以解析后的 Vite 配置为键缓存解析结果
   *
   * 按配置实例隔离是必要的：同一个插件实例可能先后用于不同的配置
   * （如先 `vite dev` 再 `vite build`），复用上一次的结果会把开发配置带到构建中。
   *
   * Keying by the config instance is required: the same plugin instance may be reused
   * with different configs (such as `vite dev` followed by `vite build`), reusing the
   * previous result would leak the dev config into the build.
   */
  cache?: WeakMap<ResolvedConfig, ResolvedMockServerPluginOptions>
}

/**
 * Create mock dev server plugin
 *
 * 创建 Mock 开发服务器插件
 *
 * @param options - Plugin options / 插件配置项
 * @returns Array of Vite plugin objects / Vite 插件对象数组
 */
export function mockDevServerPlugin(options: MockServerPluginOptions = {}): Plugin[] {
  if (options.enabled === false) {
    return []
  }

  // 两个插件共享同一份解析结果：同一命令下若两者都执行 `configResolved`，
  // 选项只会解析一次，避免重复告警（如 "No proxy configured"）与重复创建 logger。
  const holder: ResolvedOptionsHolder = {}
  const plugins: Plugin[] = [serverPlugin(options, holder)]
  if (options.build) {
    plugins.push(buildPlugin(options, holder))
  }

  return plugins
}

/**
 * Create build plugin
 *
 * 创建构建插件
 *
 * @param options - Plugin options / 插件配置项
 * @param holder - Shared resolved options between plugins / 插件间共享的解析结果
 * @returns Vite plugin object / Vite 插件对象
 */
export function buildPlugin(
  options: MockServerPluginOptions,
  holder: ResolvedOptionsHolder = {},
): Plugin {
  let viteConfig = {} as ResolvedConfig
  let resolvedOptions!: ResolvedMockServerPluginOptions
  return {
    name: 'vite-plugin-mock-dev-server-generator',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      viteConfig = config
      resolvedOptions = resolveOptionsOnce(options, config, holder)
    },
    async buildEnd(error) {
      if (error || viteConfig.command !== 'build') {
        return
      }

      await generateMockServer(this, resolvedOptions)
    },
  }
}

/**
 * Create server plugin
 *
 * 创建服务器插件
 *
 * @param options - Plugin options / 插件配置项
 * @param holder - Shared resolved options between plugins / 插件间共享的解析结果
 * @returns Vite plugin object / Vite 插件对象
 */
export function serverPlugin(
  options: MockServerPluginOptions,
  holder: ResolvedOptionsHolder = {},
): Plugin {
  let resolvedOptions!: ResolvedMockServerPluginOptions
  return {
    name: 'vite-plugin-mock-dev-server',
    enforce: 'pre',
    apply: 'serve',

    config(config) {
      // mock 编译器会在 mock 文件旁写临时文件用于动态 import，必须让 Vite
      // watcher 忽略它们，否则首次加载 mock 会被当成大量项目文件变更。
      const watch = ((config.server ??= {}).watch ??= {})
      const ignored = watch.ignored
      watch.ignored = [
        ...(Array.isArray(ignored) ? ignored : ignored ? [ignored] : []),
        MOCK_TEMP_FILE_RE,
      ]

      // 如果启用了 websocket mock，根据 wsPrefix 重新配置 server.proxy，
      // 可以避免 wss 初始化时的冲突，带来潜在的影响是，可能存在指定了 `wsPrefix`，
      // 但在实际的 mock 中没有对该规则进行配置，从而导致默认的 websocket 代理失效。
      // 这时候就需要用户自行在 wsPrefix 中注释掉对应的规则。
      const wsPrefix = toArray(options.wsPrefix)
      if (wsPrefix.length && config.server?.proxy) {
        const proxy: ResolvedConfig['server']['proxy'] = {}
        Object.keys(config.server.proxy).forEach((key) => {
          if (!wsPrefix.includes(key)) {
            proxy[key] = config.server!.proxy![key]!
          }
        })
        config.server.proxy = proxy
      }
      // 统一在同一处包装 http-proxy 的 configure，避免多次独立改写 config.server.proxy
      // 导致的顺序敏感与 `this` 语义不一致
      const setups: ProxySetup[] = [
        // #52 由于请求流被消费，vite http-proxy 无法获取已消费的请求，导致请求流无法继续
        // 通过 http-proxy 的 proxyReq 事件，重新写入请求流
        requestRecoverySetup,
      ]

      // 初始化请求录制
      const { cwd, dir } = options
      const recordOptions = resolveRecordOptions(
        cwd ?? process.cwd(),
        dir ?? 'mock',
        options.record,
      )
      if (recordOptions.enabled) {
        // `configure` 只能在 `config` 阶段挂载，此时插件选项尚未在 `configResolved`
        // 中解析；录制存储错误同样需要走插件日志通道，因此按同一套规则创建 logger
        const recorder = new Recorder(recordOptions, createMockLogger(options.log))
        setups.push(recorder.createProxySetup())
        // 仅在存在 server 配置时添加 .gitignore 文件
        if (config.server) {
          void recorder.addGitignore()
        }
      }

      setupProxyConfigure(config, setups)
    },

    configResolved(config) {
      resolvedOptions = resolveOptionsOnce(options, config, holder)
    },

    async configureServer({ middlewares, httpServer, ws }) {
      const { middlewares: middlewareList, ready } = initMockMiddlewares(
        resolvedOptions,
        httpServer,
        ws,
      )
      middlewareList.forEach((middleware) => middlewares.use(middleware))
      // `awaitInitialLoad` 关闭时 `ready` 立即 resolve，不会影响启动速度
      await ready
    },

    async configurePreviewServer({ middlewares, httpServer }) {
      // feat: use preview server parameter in preview server hook #11647
      // https://github.com/vitejs/vite/pull/11647
      const { middlewares: middlewareList, ready } = initMockMiddlewares(
        resolvedOptions,
        httpServer,
      )
      middlewareList.forEach((middleware) => middlewares.use(middleware))
      await ready
    },
  }
}

/**
 * 每个配置只解析一次插件选项
 *
 * 解析时会产生告警（如未配置 proxy）并创建 logger，重复解析会让同一告警输出多次，
 * 因此服务端插件与构建插件共享同一个配置实例的解析结果。
 * 缓存以 `ResolvedConfig` 实例为键：同一个插件实例用于新的配置时必须重新解析，
 * 避免把上一次（如开发）配置的解析结果复用到当前（如构建）流程。
 *
 * @param options - Plugin options / 插件配置项
 * @param config - Resolved Vite config / 解析后的 Vite 配置
 * @param holder - Shared holder / 共享容器
 * @returns Resolved plugin options / 解析后的插件配置
 */
function resolveOptionsOnce(
  options: MockServerPluginOptions,
  config: ResolvedConfig,
  holder: ResolvedOptionsHolder,
): ResolvedMockServerPluginOptions {
  const cache = (holder.cache ??= new WeakMap())
  const cached = cache.get(config)
  if (cached) {
    return cached
  }
  const resolved = resolvePluginOptions(options, config)
  cache.set(config, resolved)
  return resolved
}
