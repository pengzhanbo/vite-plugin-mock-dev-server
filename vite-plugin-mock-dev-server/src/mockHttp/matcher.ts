import type { Logger } from '../core'
import type { ExtraRequest, Method, MockHttpItem, MockOptions } from '../types'
import { attempt, isArray, isFunction } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { isPathMatch, matchScene } from '../utils'
import { parseRequestParams, requestValidate } from './request'

interface FindMockDataOptions {
  pathname: string
  method: string
  request: Omit<ExtraRequest, 'params'>
  activeScene: string[]
}

/**
 * Find matching mock data
 *
 * 查找匹配的 mock data
 *
 * @param mockList - Mock options list / Mock 配置列表
 * @param logger - Logger instance / 日志实例
 * @param options - Find options / 查找选项
 * @param options.pathname - Request pathname / 请求路径
 * @param options.method - HTTP method / HTTP 方法
 * @param options.request - Request object / 请求对象
 * @param options.activeScene - Active scene / 当前场景
 * @returns Matched mock HTTP item or undefined / 匹配的 Mock HTTP 项或未定义
 */
export function findMockData(
  mockList: MockOptions,
  logger: Logger,
  { pathname, method, request, activeScene }: FindMockDataOptions,
): MockHttpItem | undefined {
  return mockList.find((mock) => {
    // 避免用户编写 mock 文件时，在文件内容为空
    if (!pathname || !mock || !mock.url || mock.ws)
      return false

    const methods: Method[] = mock.method
      ? isArray(mock.method)
        ? mock.method
        : [mock.method]
      : ['GET', 'POST']
    // 判断发起的请求方法是否符合当前 mock 允许的方法
    if (!methods.includes(method as Method))
      return false

    // 判断发起的场景是否符合当前 mock 允许的场景
    if (!matchScene(activeScene, mock.scene))
      return false

    const hasMock = isPathMatch(mock.url, pathname)

    if (hasMock && mock.validator) {
      const params = parseRequestParams(mock.url, pathname)
      if (isFunction(mock.validator)) {
        return mock.validator({ params, ...request })
      }
      else {
        const [error, validated] = attempt(requestValidate, { params, ...request }, mock.validator)
        if (error) {
          const file = (mock as any).__filepath__
          logger.error(
            `${ansis.red(
              `mock error at ${pathname}`,
            )}\n${error}\n  at validator (${ansis.underline(file)})`,
            mock.log,
          )
          return false
        }
        return validated
      }
    }
    return hasMock
  }) as MockHttpItem | undefined
}
