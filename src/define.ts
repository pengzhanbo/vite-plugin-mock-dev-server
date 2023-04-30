import type { MockHttpItem, MockOptions, MockWebsocketItem } from './types'
import { isArray } from './utils'

/**
 * mock config helper
 *
 * mock配置辅助函数
 *
 * @param config
 * @example
 * ```ts
 * export default defineMock({
 *   url: '/api/example',
 *   method: ['GET', 'POST'],
 *   body: { a: 1 },
 * })
 * ```
 */
export function defineMock(config: MockHttpItem): MockHttpItem
export function defineMock(config: MockOptions): MockOptions
export function defineMock(config: MockWebsocketItem): MockWebsocketItem
export function defineMock(
  config: MockOptions | MockHttpItem | MockWebsocketItem,
): MockOptions | MockHttpItem | MockWebsocketItem {
  return config
}

/**
 * 返回一个自定义的 defineMock 函数，用于支持对 mock config 的预处理。
 *
 * Return a custom defineMock function to support preprocessing of mock config.
 *
 * @param transformer preprocessing function
 */
export function createDefineMock(
  transformer: (
    mock: MockHttpItem | MockWebsocketItem,
  ) => MockHttpItem | MockWebsocketItem | void,
): typeof defineMock {
  const define = (config: MockOptions | MockHttpItem | MockWebsocketItem) => {
    if (isArray(config)) {
      config = config.map((item) => transformer(item) || item)
    } else {
      config = transformer(config) || config
    }
    return config
  }
  return define as typeof defineMock
}
