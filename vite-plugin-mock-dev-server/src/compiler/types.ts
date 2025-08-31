import type { Alias } from 'vite'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from '../types'

export interface CompilerOptions {
  isESM?: boolean
  define: Record<string, string>
  alias: Alias[]
  cwd?: string
}

export interface TransformResult {
  code: string
  deps: string[]
}

export interface CompilerResult {
  data: MockRawData
  deps: string[]
}

export type MockRawData = MockOptions | MockHttpItem | MockWebsocketItem | Record<string, MockOptions | MockHttpItem | MockWebsocketItem>
