import type { MockHttpItem } from './httpConfig'
import type { MockWebsocketItem } from './wsConfig'

export * from './httpConfig'
export * from './wsConfig'

export type MockOptions = (MockHttpItem | MockWebsocketItem)[]
