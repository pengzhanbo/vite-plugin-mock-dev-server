import type { MockHttpItem } from './httpConfig.js'
import type { MockWebsocketItem } from './wsConfig.js'

export type * from './httpConfig.js'
export type * from './wsConfig.js'

export type MockOptions = (MockHttpItem | MockWebsocketItem)[]
