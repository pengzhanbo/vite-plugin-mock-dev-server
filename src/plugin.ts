import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import type { Plugin, ResolvedConfig } from 'vite'
import { generateMockServer } from './build'
import { mockServerMiddleware } from './mockMiddleware'
import { recoverRequest } from './requestRecovery'
import type { MockServerPluginOptions } from './types'

export function mockDevServerPlugin({
  prefix = [],
  wsPrefix = [],
  cwd = process.cwd(),
  include = ['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'],
  exclude = ['**/node_modules/**', '**/.vscode/**', '**/.git/**'],
  reload = false,
  log = 'info',
  cors = true,
  formidableOptions = {},
  build = false,
  cookiesOptions = {},
  bodyParserOptions = {},
  priority = {},
}: MockServerPluginOptions = {}): Plugin[] {
  const pluginOptions: Required<MockServerPluginOptions> = {
    prefix,
    wsPrefix,
    cwd,
    include,
    exclude,
    reload,
    cors,
    cookiesOptions,
    log,
    formidableOptions: {
      multiples: true,
      ...formidableOptions,
    },
    bodyParserOptions,
    priority,
    build: build
      ? Object.assign(
        {
          serverPort: 8080,
          dist: 'mockServer',
          log: 'error',
        },
        typeof build === 'object' ? build : {},
      )
      : false,
  }
  const plugins: Plugin[] = [serverPlugin(pluginOptions)]
  if (pluginOptions.build)
    plugins.push(buildPlugin(pluginOptions))

  return plugins
}

export function buildPlugin(
  pluginOptions: Required<MockServerPluginOptions>,
): Plugin {
  let viteConfig = {} as ResolvedConfig
  return {
    name: 'vite-plugin-mock-dev-server-generator',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      viteConfig = config
      config.logger.warn('')
    },
    async buildEnd(error) {
      if (error)
        return
      if (viteConfig.command !== 'build')
        return
      await generateMockServer(this, viteConfig, pluginOptions)
    },
  }
}

export function serverPlugin(
  pluginOptions: Required<MockServerPluginOptions>,
): Plugin {
  let viteConfig = {} as ResolvedConfig
  return {
    name: 'vite-plugin-mock-dev-server',
    enforce: 'pre',
    apply: 'serve',

    config(config) {
      // 如果启用了 websocket mock，根据 wsPrefix 重新配置 server.proxy，
      // 可以避免 wss 初始化时的冲突，带来潜在的影响是，可能存在指定了 `wsPrefix`，
      // 但在实际的 mock 中没有对该规则进行配置，从而导致默认的 websocket 代理失效。
      // 这时候就需要用户自行在 wsPrefix 中注释掉对应的规则。
      const wsPrefix = toArray(pluginOptions.wsPrefix)
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
      viteConfig = config

      // This is a hack to prevent Vite from nuking useful logs,
      // pending https://github.com/vitejs/vite/issues/9378
      config.logger.warn('')
    },

    configureServer({ middlewares, config, httpServer, ws }) {
      const middlewareList = mockServerMiddleware(
        config,
        pluginOptions,
        httpServer,
        ws,
      )
      middlewareList.forEach(middleware => middlewares.use(middleware))
    },

    configurePreviewServer({ middlewares, httpServer }) {
      // viteConfig to be made available as configurePreviewServer
      // pending...
      // feat: use preview server parameter in preview server hook #11647
      // https://github.com/vitejs/vite/pull/11647
      const middlewareList = mockServerMiddleware(
        viteConfig,
        pluginOptions,
        httpServer,
      )
      middlewareList.forEach(middleware => middlewares.use(middleware))
    },
  }
}
