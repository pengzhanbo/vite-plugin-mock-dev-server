import type { Plugin } from 'vite'
import { mockServerMiddleware } from './mockMiddleware'
import type { MockServerPluginOptions } from './types'

export function mockDevServerPlugin({
  include = ['mock/**/*.mock.*'],
  exclude = [
    '**/node_modules/**',
    '**/test/**',
    '**/cypress/**',
    'src/**',
    '**/.vscode/**',
    '**/.git/**',
    '**/dist/**',
  ],
}: MockServerPluginOptions = {}): Plugin {
  return {
    name: 'vite-plugin-mock-dev-server',

    async configureServer({ middlewares, config, httpServer }) {
      const middleware = await mockServerMiddleware(httpServer, config, {
        include,
        exclude,
      })
      middlewares.use(middleware)
    },
  }
}
