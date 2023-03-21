import type { Plugin, ResolvedConfig } from 'vite'
import { generateMockServer } from './build'
import { mockServerMiddleware } from './mockMiddleware'
import type { MockServerPluginOptions } from './types'

export function mockDevServerPlugin({
  prefix = [],
  include = ['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'],
  exclude = ['**/node_modules/**', '**/.vscode/**', '**/.git/**'],
  reload = false,
  formidableOptions = {},
  build = false,
}: MockServerPluginOptions = {}): Plugin[] {
  const pluginOptions: Required<MockServerPluginOptions> = {
    prefix,
    include,
    exclude,
    reload,
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
