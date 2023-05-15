import type { Plugin, ResolvedConfig } from 'vite'
import { generateMockServer } from './build'
import { mockServerMiddleware } from './mockMiddleware'
import type { MockServerPluginOptions } from './types'
import { ensureArray } from './utils'

export function mockDevServerPlugin({
  prefix = [],
  wsPrefix = [],
  include = ['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'],
  exclude = ['**/node_modules/**', '**/.vscode/**', '**/.git/**'],
  reload = false,
  formidableOptions = {},
  build = false,
  cookiesOptions = {},
}: MockServerPluginOptions = {}): Plugin[] {
  const pluginOptions: Required<MockServerPluginOptions> = {
    prefix,
    wsPrefix,
    include,
    exclude,
    reload,
    cookiesOptions,
    formidableOptions: {
      multiples: true,
      ...formidableOptions,
    },
    build: build
      ? Object.assign(
          {
            serverPort: 8080,
            dist: 'mockServer',
          },
          typeof build === 'object' ? build : {},
        )
      : false,
  }
  const plugins: Plugin[] = [serverPlugin(pluginOptions)]
  if (pluginOptions.build) {
    plugins.push(buildPlugin(pluginOptions))
  }
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
      if (error) return
      if (viteConfig.command !== 'build') return
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
      const wsPrefix = ensureArray(pluginOptions.wsPrefix)
      if (
        wsPrefix.length === 0 ||
        !config.server?.proxy ||
        Object.keys(config.server.proxy).length === 0
      )
        return

      const proxy: ResolvedConfig['server']['proxy'] = {}
      Object.keys(config.server.proxy).forEach((key) => {
        if (!wsPrefix.includes(key)) {
          proxy[key] = config.server!.proxy![key]
        }
      })
      config.server.proxy = proxy
    },

    configResolved(config) {
      viteConfig = config

      // This is a hack to prevent Vite from nuking useful logs,
      // pending https://github.com/vitejs/vite/issues/9378
      config.logger.warn('')
    },

    async configureServer({ middlewares, config, httpServer, ws }) {
      const middleware = await mockServerMiddleware(
        config,
        pluginOptions,
        httpServer,
        ws,
      )
      middlewares.use(middleware)
    },

    async configurePreviewServer({ middlewares, httpServer }) {
      // viteConfig to be made available as configurePreviewServer
      // pending...
      // feat: use preview server parameter in preview server hook #11647
      // https://github.com/vitejs/vite/pull/11647
      const middleware = await mockServerMiddleware(
        viteConfig,
        pluginOptions,
        httpServer,
      )
      middlewares.use(middleware)
    },
  }
}
