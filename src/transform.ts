import {
  isArray,
  isEmptyObject,
  isFunction,
  isObject,
  sortBy,
} from '@pengzhanbo/utils'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from './types'
import { urlParse } from './utils'
import { isObjectSubset } from './validator'

export function transformMockData(
  mockList:
    | Map<string, MockHttpItem | MockWebsocketItem | MockOptions>
    | (MockHttpItem | MockWebsocketItem | MockOptions)[],
) {
  const list: MockOptions = []
  for (const [, handle] of mockList.entries()) {
    if (handle)
      isArray(handle) ? list.push(...handle) : list.push(handle)
  }

  const mocks: Record<string, MockOptions> = {}

  list
    .filter(mock => isObject(mock) && mock.enabled !== false && mock.url)
    .forEach((mock) => {
      const { pathname, query } = urlParse(mock.url)
      const list = (mocks[pathname!] ??= [])

      const current = { ...mock, url: pathname! }
      if (current.ws !== true) {
        const validator = current.validator
        if (!isEmptyObject(query)) {
          if (isFunction(validator)) {
            current.validator = function (request) {
              return isObjectSubset(request.query, query) && validator(request)
            }
          }
          else if (validator) {
            current.validator = { ...validator }
            current.validator.query = current.validator.query
              ? { ...query, ...current.validator.query }
              : query
          }
          else {
            current.validator = { query }
          }
        }
      }
      list.push(current)
    })

  // 对具有相同路径匹配规则的配置项进行排序。
  // 由于允许同时配置多条相同路径匹配规则，具体应用哪一条规则，需要根据 `validator` 做判断
  // 默认 函数形式的 `validator` 具有最高的优先级，应该优先被匹配，
  // 而没有配置 `validator` 的，则优先级最低，作为 该规则下的 fallback
  // 对象形式的 `validator` ，则需要比对 query、body、params 等对象
  // 优先级计算方式为该对象下的 key 越多，则认为是越优先被匹配。
  // 在一般的场景中，一个接口常接受的请求方法只会是一种，所以即使 累计 query + body 的 key 之和，
  // 也不会影响优先级判断。但如果是真存在同个路径匹配规则中，存在多条配置下各都配置了 query + body，
  // 可能 优先级计算 并不符合预期，导致潜在的问题。是否会出现该问题，且该问题出现的频率为几何，
  // 还需要观察，看看是否有必要处理。
  // 如果有插件使用者在实际使用中反馈了该问题，再做处理。
  Object.keys(mocks).forEach((key) => {
    mocks[key] = sortByValidator(mocks[key])
  })
  return mocks
}

export function sortByValidator(mocks: MockOptions) {
  return sortBy(mocks, (item) => {
    if (item.ws === true)
      return 0
    const { validator } = item
    // fix: #28
    if (!validator || isEmptyObject(validator))
      return 2
    if (isFunction(validator))
      return 0
    const count = Object.keys(validator).reduce(
      (prev, key) => prev + keysCount(validator[key as keyof typeof validator]),
      0,
    )
    return 1 / count
  })
}

function keysCount(obj?: object): number {
  if (!obj)
    return 0
  return Object.keys(obj).length
}
