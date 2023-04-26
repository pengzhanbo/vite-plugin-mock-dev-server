import { parse as urlParse } from 'node:url'
import sortBy from 'lodash.sortby'
import type { MockOptions, MockOptionsItem } from './types'
import { isArray, isEmptyObj, isFunction } from './utils'
import { equalObj } from './validator'

export function transformMockData(
  mockList:
    | Map<string, MockOptionsItem | MockOptions>
    | (MockOptionsItem | MockOptions)[],
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
      list.push(current)
    })
  Object.keys(mocks).forEach((key) => {
    mocks[key] = sortBy(mocks[key], ({ validator }) => {
      if (!validator) return 2
      if (isFunction(validator)) return 0
      const { query, params, headers, body, refererQuery } = validator
      const count =
        keysCount(query) +
        keysCount(params) +
        keysCount(headers) +
        keysCount(body) +
        keysCount(refererQuery)
      return 1 / count
    })
  })
  return mocks
}

function keysCount(obj?: object): number {
  if (!obj) return 0
  return Object.keys(obj).length
}
