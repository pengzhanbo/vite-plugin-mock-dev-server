import type { MockOptions, MockOptionsItem } from './types'

/**
 * mock config helper
 *
 * mock配置帮助函数
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
export function defineMock(config: MockOptionsItem): MockOptionsItem
export function defineMock(config: MockOptions): MockOptions
export function defineMock(
  config: MockOptions | MockOptionsItem
): MockOptions | MockOptionsItem {
  return config
}

export default defineMock
