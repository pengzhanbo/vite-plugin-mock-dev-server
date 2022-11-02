import type { MockOptions, MockOptionsItem } from './types'

/**
 * mock配置帮助函数
 * @param config
 * @example
 * ```ts
 * export default defineMock({
 *   url: '/api/example',
 *   body: { a: 1 },
 * })
 * ```
 */
export const defineMock = (
  config: MockOptionsItem | MockOptions
): MockOptionsItem | MockOptions => config

export default defineMock
