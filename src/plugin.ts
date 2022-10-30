import type { Plugin } from 'vite'
import { mockServerMiddleware } from './mockMiddleware'
import type { MockServerPluginOptions } from './types'

export function mockDevServerPlugin(
  options: MockServerPluginOptions = { include: ['mock/**/*.mock.*'] }
): Plugin {
  return {
    name: 'vite-plugin-mock-dev-server',

    async configureServer({ middlewares, config, httpServer }) {
      const middleware = await mockServerMiddleware(httpServer, config, options)
      middlewares.use(middleware)
    },
  }
}
