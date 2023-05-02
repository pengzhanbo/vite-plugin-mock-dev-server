import { parse as urlParse } from 'node:url'
import sortBy from 'lodash.sortby'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from './types'
import { isArray, isEmptyObj, isFunction } from './utils'
import { equalObj } from './validator'

export function transformMockData(
  mockList:
    | Map<string, MockHttpItem | MockWebsocketItem | MockOptions>
    | (MockHttpItem | MockWebsocketItem | MockOptions)[],
) {
  const list: MockOptions = []
  for (const [, handle] of mockList.entries()) {
    if (handle) isArray(handle) ? list.push(...handle) : list.push(handle)
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

      const current = { ...mock, url: pathname! }
      if (current.ws !== true) {
        const validator = current.validator
        if (!isEmptyObj(query)) {
          if (isFunction(validator)) {
            current.validator = function (request) {
              return equalObj(request.query, query) && validator(request)
            }
          } else if (validator) {
            current.validator = { ...validator }
            current.validator.query = current.validator.query
              ? { ...query, ...current.validator.query }
              : query
          } else {
            current.validator = { query }
          }
        }
      }
      list.push(current)
    })
  Object.keys(mocks).forEach((key) => {
    mocks[key] = sortBy(mocks[key], (item) => {
      if (item.ws === true) return 0
      const { validator } = item
      if (!validator) return 1
      if (isFunction(validator)) return 0
      const count = Object.keys(validator).reduce(
        (prev, key) =>
          prev + keysCount(validator[key as keyof typeof validator]),
        0,
      )
      return 1 / count
    })
  })
  return mocks
}

function keysCount(obj?: object): number {
  if (!obj) return 0
  return Object.keys(obj).length
}
