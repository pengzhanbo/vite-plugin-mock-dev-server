import type { Plugin, ResolvedConfig } from 'vite'
import { mockServerMiddleware } from './mockMiddleware'
import type { MockServerPluginOptions } from './types'

let viteConfig = {} as ResolvedConfig

export function mockDevServerPlugin({
  include = ['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'],
  exclude = [
    '**/node_modules/**',
    '**/test/**',
    'src/**',
    '**/.vscode/**',
    '**/.git/**',
    '**/dist/**',
  ],
  formidableOptions = {},
}: MockServerPluginOptions = {}): Plugin {
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

    async configureServer({ middlewares, config, httpServer }) {
      const middleware = await mockServerMiddleware(httpServer, config, {
        include,
        exclude,
        formidableOptions: {
          multiples: true,
          ...formidableOptions,
        },
      })
      middlewares.use(middleware)
    },

    async configurePreviewServer({ middlewares, httpServer }) {
      // viteConfig to be made available as configurePreviewServer
      // pending...
      // feat: use preview server parameter in preview server hook #11647
      // https://github.com/vitejs/vite/pull/11647
      const middleware = await mockServerMiddleware(httpServer, viteConfig, {
        include,
        exclude,
        formidableOptions: {
          multiples: true,
          ...formidableOptions,
        },
      })
      middlewares.use(middleware)
    },
  }
}
