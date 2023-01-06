import type { Plugin } from 'vite'
import { mockServerMiddleware } from './mockMiddleware'
import type { MockServerPluginOptions } from './types'

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
  }
}
