import type { Plugin, ResolvedConfig } from 'vite'
import type { ResolvedMockServerPluginOptions } from './core/resolvePluginOptions'
import type { MockServerPluginOptions } from './types'
import { toArray } from '@pengzhanbo/utils'
import { generateMockServer } from './core/build'
import { mockServerMiddleware } from './core/mockMiddleware'
import { recoverRequest } from './core/requestRecovery'
import { resolvePluginOptions } from './core/resolvePluginOptions'

export function mockDevServerPlugin(options: MockServerPluginOptions = {}): Plugin[] {
  const plugins: Plugin[] = [serverPlugin(options)]
  if (options.build)
    plugins.push(buildPlugin(options))

  return plugins
}

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
    },

    configResolved(config) {
      resolvedOptions = resolvePluginOptions(options, config)
      // This is a hack to prevent Vite from nuking useful logs,
      // pending https://github.com/vitejs/vite/issues/9378
      config.logger.warn('')
    },

    configureServer({ middlewares, httpServer, ws }) {
      const middlewareList = mockServerMiddleware(resolvedOptions, httpServer, ws)
      middlewareList.forEach(middleware => middlewares.use(middleware))
    },

    configurePreviewServer({ middlewares, httpServer }) {
      // viteConfig to be made available as configurePreviewServer
      // pending...
      // feat: use preview server parameter in preview server hook #11647
      // https://github.com/vitejs/vite/pull/11647
      const middlewareList = mockServerMiddleware(resolvedOptions, httpServer)
      middlewareList.forEach(middleware => middlewares.use(middleware))
    },
  }
}
