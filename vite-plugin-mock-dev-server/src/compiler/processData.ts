import type { Logger } from '../core/logger.js'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from '../types/index.js'
import type { MockRawData } from './types.js'
import {
  isArray,
  isEmptyObject,
  isFunction,
  isPlainObject,
  LRUCache,
  objectKeys,
  sortBy,
  toArray,
} from '@pengzhanbo/utils'
import ansis from 'ansis'
import { pathToRegexp } from 'path-to-regexp'
import { isObjectSubset, urlParse } from '../utils/index.js'

export function processRawData(
  raw: MockRawData,
  __filepath__: string,
): MockOptions | MockHttpItem | MockWebsocketItem {
  if (!raw) {
    return []
  }

  let res: MockOptions | MockHttpItem | MockWebsocketItem
  if (isArray(raw)) {
    res = raw.map((item) => ({ ...item, __filepath__ }))
  } else if ('url' in raw) {
    res = { ...raw, __filepath__ } as unknown as MockHttpItem
  } else {
    res = []
    objectKeys(raw).forEach((key) => {
      const data = raw[key]
      if (isArray(data)) {
        ;(res as MockOptions).push(...data.map((item) => ({ ...item, __filepath__ })))
      } else {
        ;(res as MockOptions).push({ ...data, __filepath__ } as unknown as MockHttpItem)
      }
    })
  }
  return res
}

const patternErrorCache = new LRUCache<string, undefined | string>({ maxSize: 1000 })

/**
 * Validate the path pattern of a mock url
 *
 * 校验 mock url 的路径模式是否合法
 *
 * mock url 在请求匹配阶段（见 `isPathMatch` / `parseRequestParams`）由
 * `path-to-regexp` 编译，非法模式（如旧版本的 `:id?` / `:id*` 写法）会在请求期抛出异常，
 * 这类 mock 应该在编译阶段就被丢弃，而不是导致开发服务崩溃。
 *
 *
 * @param pattern - Path pattern to validate / 需要校验的路径模式
 * @returns Error message when the pattern is invalid, otherwise `undefined` / 模式非法时返回错误信息，否则返回 `undefined`
 */
function getPatternError(pattern: string): undefined | string {
  if (patternErrorCache.has(pattern)) {
    return patternErrorCache.get(pattern)
  }

  let error: undefined | string
  try {
    pathToRegexp(pattern)
  } catch (e) {
    error = (e as Error).message
  }
  patternErrorCache.set(pattern, error)
  return error
}

export function processMockData(
  mockList:
    | Map<string, MockHttpItem | MockWebsocketItem | MockOptions>
    | (MockHttpItem | MockWebsocketItem | MockOptions)[],
  logger?: Logger,
): Record<string, MockOptions> {
  const list: MockOptions = []
  for (const [, handle] of mockList.entries()) {
    if (handle) {
      list.push(...toArray(handle))
    }
  }

  const mocks: Record<string, MockOptions> = {}

  list
    .filter((mock) => isPlainObject(mock) && mock.enabled !== false && mock.url)
    .forEach((mock) => {
      const { pathname, query } = urlParse(mock.url)
      const patternError = getPatternError(pathname)
      // 跳过非法 url 模式的 mock，避免在请求匹配阶段抛出异常
      if (patternError) {
        logger?.error(
          `${ansis.red('Invalid mock url pattern')} ${ansis.yellow(mock.url)}\n  ${patternError}\n  at (${ansis.underline.gray((mock as any).__filepath__ ?? 'unknown')})`,
        )
        return
      }
      const res = (mocks[pathname] ??= [])

      const current = { ...mock, url: pathname }
      if (current.ws !== true) {
        const validator = current.validator
        if (!isEmptyObject(query)) {
          if (isFunction(validator)) {
            current.validator = function validate(request) {
              return isObjectSubset(request.query, query) && validator(request)
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
      res.push(current)
    })

  // 对具有相同路径匹配规则的配置项进行排序。
  // 由于允许同时配置多条相同路径匹配规则，具体应用哪一条规则，需要先根据 `scene` 做判断：
  // 配置了 `scene` 的 mock 优先级最高，意味着用户只希望命中该场景下的 mock 数据，
  // `validator` 的优先级不会跨越它；未命中当前场景的 mock 会在请求匹配时被过滤掉。
  // 同一场景下，再根据 `validator` 做判断：
  // 默认 函数形式的 `validator` 具有最高的优先级，应该优先被匹配，
  // 而没有配置 `validator` 的，则优先级最低，作为 该规则下的 fallback
  // 对象形式的 `validator` ，则需要比对 query、body、params 等对象
  // 优先级计算方式为该对象下的 key 越多，则认为是越优先被匹配。
  // 在一般的场景中，一个接口常接受的请求方法只会是一种，所以即使 累计 query + body 的 key 之和，
  // 也不会影响优先级判断。但如果是真存在同个路径匹配规则中，存在多条配置下各都配置了 query + body，
  // 可能 优先级计算 并不符合预期，导致潜在的问题。是否会出现该问题，且该问题出现的频率为几何，
  // 还需要观察，看看是否有必要处理。
  // 如果有插件使用者在实际使用中反馈了该问题，再做处理。
  objectKeys(mocks).forEach((key) => {
    mocks[key] = sortByValidator(mocks[key])
  })
  return mocks
}

export function sortByValidator(mocks: MockOptions): (MockHttpItem | MockWebsocketItem)[] {
  // 优先级排序，数字越小，优先级越高，越优先被匹配。
  // 依次比较以下条件：
  // 1. 配置了 `scene` 的 mock 优先于通用 mock。这是最高优先级，validator 不会跨越它。
  //    用户配置 `activeScene` 的意图是只命中该场景下的 mock 数据，
  //    因此带 `scene` 的 mock 必须优先被匹配；不匹配当前场景的 mock 会在请求匹配时
  //    被 `matchScene` 过滤掉，从而回退到通用 mock；
  // 2. websocket mock 优先，其次按 validator 的类型比较：函数形式 > 对象形式 > 无 validator；
  // 3. 对象形式的 validator，key 越多优先级越高。
  return sortBy(mocks, [
    (item) => (toArray(item.scene).length > 0 ? 0 : 1),
    getValidatorPriority,
    (item) => -countValidatorKeys(item),
  ])
}

/**
 * Get the match priority of a mock within the same scene
 *
 * 获取同一场景下 mock 的匹配优先级
 *
 * Websocket mocks come first, then mocks are compared by the validator type:
 * a function validator has the highest priority, an object validator is
 * compared by its key count, and a mock without validator is treated as
 * the fallback of the same url rule, which has the lowest priority.
 *
 * websocket mock 优先，其后按 validator 的类型比较：
 * 函数形式的 validator 优先级最高，对象形式的 validator 则依据其 key 数量比较，
 * 而没有配置 validator 的 mock 作为同一 url 规则下的兜底配置，优先级最低。
 *
 * @param mock - Mock config item / mock 配置项
 * @returns Priority, the smaller the value, the higher the priority / 优先级，数字越小优先级越高
 */
function getValidatorPriority(mock: MockHttpItem | MockWebsocketItem): number {
  if (mock.ws === true) {
    return 0
  }
  const { validator } = mock
  // fix: #28
  if (!validator || isEmptyObject(validator)) {
    return 3
  }
  return isFunction(validator) ? 1 : 2
}

/**
 * Count the keys of the object validator of a mock
 *
 * 统计 mock 的对象形式 validator 的 key 数量
 *
 * Only an object validator is counted, a function validator and a missing
 * validator both return `0`.
 *
 * 仅统计对象形式的 validator，函数形式的 validator 和未配置的 validator 都返回 `0`。
 *
 * @param mock - Mock config item / mock 配置项
 * @returns Key count / key 数量
 */
function countValidatorKeys(mock: MockHttpItem | MockWebsocketItem): number {
  if (mock.ws === true) {
    return 0
  }
  const { validator } = mock
  if (!validator || isFunction(validator)) {
    return 0
  }
  let count = 0
  for (const key of Object.keys(validator)) {
    count += keysCount(validator[key as keyof typeof validator])
  }
  return count
}

function keysCount(obj?: object): number {
  if (!obj) {
    return 0
  }
  return objectKeys(obj).length
}
