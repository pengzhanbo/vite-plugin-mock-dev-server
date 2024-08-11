import { mockDevServerPlugin } from './plugin'

export type {
  FormidableFile,
  MockOptions,
  MockHttpItem,
  MockWebsocketItem,
  MockServerPluginOptions,
  MockRequest,
} from './types'

export * from './helper'
export * from './server'

export { mockDevServerPlugin }

/** @deprecated use named export `mockDevServerPlugin` instead */
export default mockDevServerPlugin
