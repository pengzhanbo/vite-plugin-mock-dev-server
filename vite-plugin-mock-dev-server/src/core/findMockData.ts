import type { ExtraRequest, Method, MockHttpItem, MockOptions } from '../types'
import type { Logger } from '../utils'
import { isArray, isFunction } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { isPathMatch } from '../utils'
import { parseRequestParams, requestValidate } from './request'

interface FindMockDataOptions {
  pathname: string
  method: string
  request: Omit<ExtraRequest, 'params'>
}

/**
 * 查找匹配的 mock data
 */
export function fineMockData(
  mockList: MockOptions,
  logger: Logger,
  { pathname, method, request }: FindMockDataOptions,
): MockHttpItem | undefined {
  return mockList.find((mock) => {
    if (!pathname || !mock || !mock.url || mock.ws === true)
      return false
    const methods: Method[] = mock.method
      ? isArray(mock.method)
        ? mock.method
        : [mock.method]
      : ['GET', 'POST']
    // 判断发起的请求方法是否符合当前 mock 允许的方法
    if (!methods.includes(method as Method))
      return false

    const hasMock = isPathMatch(mock.url, pathname)

    if (hasMock && mock.validator) {
      const params = parseRequestParams(mock.url, pathname)
      if (isFunction(mock.validator)) {
        return mock.validator({ params, ...request })
      }
      else {
        try {
          return requestValidate({ params, ...request }, mock.validator)
        }
        catch (e) {
          const file = (mock as any).__filepath__
          logger.error(
            `${ansis.red(
              `mock error at ${pathname}`,
            )}\n${e}\n  at validator (${ansis.underline(file)})`,
            mock.log,
          )
          return false
        }
      }
    }
    return hasMock
  }) as MockHttpItem | undefined
}
