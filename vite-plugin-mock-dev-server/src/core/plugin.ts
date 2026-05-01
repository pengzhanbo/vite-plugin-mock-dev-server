import type { Plugin, ResolvedConfig } from 'vite'
import type { MockServerPluginOptions } from '../types'
import type { ResolvedMockServerPluginOptions } from './options'
import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import { generateMockServer } from '../build'
import { recoverRequest } from '../mockHttp'
import { Recorder } from '../recorder'
import { initMockMiddlewares } from './init'
import { resolvePluginOptions, resolveRecordOptions } from './options'

/**
 * Create mock dev server plugin
 *
 * 创建 Mock 开发服务器插件
 *
 * @param options - Plugin options / 插件配置项
 * @returns Array of Vite plugin objects / Vite 插件对象数组
 */
export function mockDevServerPlugin(options: MockServerPluginOptions = {}): Plugin[] {
  if (options.enabled === false)
    return []

  const plugins: Plugin[] = [serverPlugin(options)]
  if (options.build)
    plugins.push(buildPlugin(options))

  return plugins
}

/**
 * Create build plugin
 *
 * 创建构建插件
 *
 * @param options - Plugin options / 插件配置项
 * @returns Vite plugin object / Vite 插件对象
 */
export function buildPlugin(
  options: MockServerPluginOptions,
): Plugin {
  let viteConfig = {} as ResolvedConfig
  let resolvedOptions!: ResolvedMockServerPluginOptions
  return {
    name: 'vite-plugin-mock-dev-server-generator',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      viteConfig = config
      resolvedOptions = resolvePluginOptions(options, config)
      config.logger.warn('')
    },
    async buildEnd(error) {
      if (error || viteConfig.command !== 'build')
        return

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
 * @returns Vite plugin object / Vite 插件对象
 */
export function serverPlugin(
  options: MockServerPluginOptions,
): Plugin {
  let resolvedOptions!: ResolvedMockServerPluginOptions
  return {
    name: 'vite-plugin-mock-dev-server',
    enforce: 'pre',
    apply: 'serve',

    config(config) {
      // 如果启用了 websocket mock，根据 wsPrefix 重新配置 server.proxy，
      // 可以避免 wss 初始化时的冲突，带来潜在的影响是，可能存在指定了 `wsPrefix`，
      // 但在实际的 mock 中没有对该规则进行配置，从而导致默认的 websocket 代理失效。
      // 这时候就需要用户自行在 wsPrefix 中注释掉对应的规则。
      const wsPrefix = toArray(options.wsPrefix)
      if (wsPrefix.length && config.server?.proxy) {
        const proxy: ResolvedConfig['server']['proxy'] = {}
        Object.keys(config.server.proxy).forEach((key) => {
          if (!wsPrefix.includes(key))
            proxy[key] = config.server!.proxy![key]!
        })
        config.server.proxy = proxy
      }
      // #52 由于请求流被消费，vite http-proxy 无法获取已消费的请求，导致请求流无法继续
      // 通过 http-proxy 的 proxyReq 事件，重新写入请求流
      recoverRequest(config)

      // 初始化请求录制
      const { cwd, dir } = options
      const recordOptions = resolveRecordOptions(cwd || process.cwd(), dir || 'mock', options.record)
      if (recordOptions.enabled) {
        const recorder = new Recorder(recordOptions)
        recorder.setup(config)
      }
    },

    configResolved(config) {
      resolvedOptions = resolvePluginOptions(options, config)
      // This is a hack to prevent Vite from nuking useful logs,
      // pending https://github.com/vitejs/vite/issues/9378
      config.logger.warn('')
    },

    configureServer({ middlewares, httpServer, ws }) {
      const middlewareList = initMockMiddlewares(resolvedOptions, httpServer, ws)
      middlewareList.forEach(middleware => middlewares.use(middleware))
    },

    configurePreviewServer({ middlewares, httpServer }) {
      // feat: use preview server parameter in preview server hook #11647
      // https://github.com/vitejs/vite/pull/11647
      const middlewareList = initMockMiddlewares(resolvedOptions, httpServer)
      middlewareList.forEach(middleware => middlewares.use(middleware))
    },
  }
}
