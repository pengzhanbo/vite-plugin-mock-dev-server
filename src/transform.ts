import { parse as urlParse } from 'node:url'
import type { MockOptions, MockOptionsItem } from './types'
import { isArray, isFunction } from './utils'

export function transformMockData(
  mockList:
    | Map<string, MockOptionsItem | MockOptions>
    | (MockOptionsItem | MockOptions)[],
) {
  const list: MockOptions = []
  for (const [, handle] of mockList.entries()) {
    if (handle) {
      isArray(handle) ? list.push(...handle) : list.push(handle)
    }
  }
  const mocks: Record<string, MockOptions> = {}

  list
    .filter(
      (mock) =>
        (mock.enabled || typeof mock.enabled === 'undefined') && mock.url,
    )
    .forEach((mock) => {
      const { pathname, query } = urlParse(mock.url, true)
      const list = (mocks[pathname!] ??= [])

      const current = Object.assign({}, mock, { url: pathname! })

      if (query && !isFunction(current.validator)) {
        current.validator = Object.assign({}, current.validator || {})
        current.validator.query = Object.assign(
          query,
          current.validator.query || {},
        )
      }
      current.validator ? list.unshift(current) : list.push(current)
    })
  return mocks
}
