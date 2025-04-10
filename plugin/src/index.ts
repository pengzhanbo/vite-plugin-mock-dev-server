import { mockDevServerPlugin } from './plugin'

export * from './helper'

export * from './server'
export type {
  FormidableFile,
  MockHttpItem,
  MockOptions,
  MockRequest,
  MockServerPluginOptions,
  MockWebsocketItem,
} from './types'

export { mockDevServerPlugin }

/**
 * @deprecated use named export `mockDevServerPlugin` instead
 */
export default mockDevServerPlugin
