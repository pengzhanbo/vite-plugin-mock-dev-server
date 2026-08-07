import type { Alias } from 'vite'
import type { Logger } from '../core/index.js'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from '../types/index.js'

export interface CompilerOptions {
  isESM?: boolean
  define: Record<string, string>
  alias: Alias[]
  cwd?: string
  logger: Logger
}

export interface TransformResult {
  code: string
  externalDeps: string[]
  internalDeps: string[]
}

export interface CompilerResult {
  data: MockRawData
  externalDeps: string[]
  internalDeps: string[]
}

export type MockRawData =
  | MockOptions
  | MockHttpItem
  | MockWebsocketItem
  | Record<string, MockOptions | MockHttpItem | MockWebsocketItem>
