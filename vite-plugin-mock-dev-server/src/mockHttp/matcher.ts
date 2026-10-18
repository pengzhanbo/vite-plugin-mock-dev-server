import type { Logger } from '../core/index.js'
import type { ExtraRequest, Method, MockHttpItem, MockOptions } from '../types/index.js'
import { attempt, isFunction, toArray } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { isPathMatch, matchScene } from '../utils/index.js'
import { parseRequestParams, requestValidate } from './request.js'

interface FindMockDataOptions {
  pathname: string
  method: string
  request: Omit<ExtraRequest, 'params'>
  activeScene: string[]
}

/**
 * Check whether the mock rules support the given HTTP method in the active scene
 *
 * 判断 Mock 规则在当前场景下是否支持指定的请求方法
 *
 * 预检请求不会经过请求体与校验器的匹配流程，只需确认该路径下存在支持目标方法、
 * 且场景匹配的规则。未显式声明 `method` 的规则与 `findMockData` 保持一致，
 * 默认为 `GET`、`POST`；场景判断复用 `matchScene`，与正常 mock 匹配一致。
 *
 * A preflight request does not go through the request body / validator matching, so it
 * only needs to know whether the path has a rule that supports the target method and
 * matches the active scene. Rules without an explicit `method` default to `GET` and
 * `POST`, consistent with `findMockData`; the scene check reuses `matchScene`, the same
 * as the normal mock matching.
 *
 * @param mockList - Mock options list / Mock 配置列表
 * @param method - HTTP method to check / 需要检查的 HTTP 方法
 * @param activeScene - Active scene / 当前激活的场景
 * @returns Whether the method is supported / 是否支持该方法
 */
export function hasMockMethod(
  mockList: MockOptions,
  method: string,
  activeScene: string[] = [],
): boolean {
  const target = method.toUpperCase()
  return mockList.some((mock) => {
    if (!mock || mock.ws || !matchScene(activeScene, mock.scene)) {
      return false
    }
    return toArray<Method>(mock.method ?? ['GET', 'POST'])
      .map((item) => item.toUpperCase())
      .includes(target)
  })
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
    if (!pathname || !mock || !mock.url || mock.ws) {
      return false
    }

    const methods = toArray<Method>(mock.method ?? ['GET', 'POST']).map((item) =>
      item.toUpperCase(),
    )
    // 判断发起的请求方法是否符合当前 mock 允许的方法
    if (!methods.includes(method)) {
      return false
    }

    // 判断发起的场景是否符合当前 mock 允许的场景
    if (!matchScene(activeScene, mock.scene)) {
      return false
    }

    const hasMock = isPathMatch(mock.url, pathname)

    if (hasMock && mock.validator) {
      const params = parseRequestParams(mock.url, pathname)
      const extraRequest = { params, ...request }
      const validator = mock.validator
      // 函数校验器与对象校验器语义一致：校验器抛出的异常只记录日志，
      // 并视为「不匹配」，继续尝试后续规则，而不是冒泡成 500
      //
      // Function and object validators share the same semantics: an exception thrown
      // by the validator is logged and treated as a mismatch, so that the following
      // rules are still tried, instead of bubbling up as a 500 response.
      const [error, validated] = attempt(() =>
        isFunction(validator) ? validator(extraRequest) : requestValidate(extraRequest, validator),
      )
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
    return hasMock
  }) as MockHttpItem | undefined
}
