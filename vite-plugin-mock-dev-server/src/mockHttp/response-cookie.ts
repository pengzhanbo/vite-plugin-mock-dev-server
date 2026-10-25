/**
 * Response cookie writing
 *
 * 响应 cookie 写入
 *
 * An invalid cookie name or a cookie rejected by the `cookies` library is logged
 * and skipped, so one broken cookie never prevents the others from being written.
 *
 * 非法的 cookie 名称或被 `cookies` 库拒绝的 cookie 只记录日志并跳过，
 * 使单个错误 cookie 不会影响其他 cookie 及本次响应。
 */

import type { Logger } from '../core/index.js'
import type { MockHttpItem, MockRequest, MockResponse } from '../types/index.js'
import { attempt, attemptAsync, isArray, isFunction, objectKeys } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { isValidHttpToken } from './response-header.js'

/**
 * Set response cookies
 *
 * 设置响应cookie
 *
 * @param req - Request object / 请求对象
 * @param res - Response object / 响应对象
 * @param mock - Mock HTTP item / Mock HTTP 配置项
 * @param logger - Logger instance / 日志实例
 */
export async function provideResponseCookies(
  req: MockRequest,
  res: MockResponse,
  mock: MockHttpItem,
  logger: Logger,
): Promise<void> {
  const { cookies } = mock
  if (!cookies) {
    return
  }

  const filepath = mock.__filepath__ as string
  const url = req.url!.split('?')[0]
  const [error, data] = await attemptAsync(async () =>
    isFunction(cookies) ? cookies(req) : cookies,
  )
  if (error) {
    logger.error(
      `${ansis.red(`mock error at ${url}`)}\n${error}\n  at cookies (${ansis.underline(filepath)})`,
      mock.log,
    )
    return
  }
  if (!data) {
    return
  }

  objectKeys(data).forEach((key) => {
    // 非法 token 的 cookie 名称会被浏览器丢弃，这里跳过该 cookie 并输出错误日志
    if (!isValidHttpToken(key)) {
      logger.error(
        `${ansis.red(`mock error at ${url}`)}
  Invalid response cookie name: ${ansis.yellow(key)}
  at cookies (${ansis.underline(filepath)})`,
        mock.log,
      )
      return
    }

    const cookie = data[key]
    const [value, options] = isArray(cookie) ? cookie : [cookie]
    // `res.setCookie` 会对 cookie 的值以及选项（path、domain、sameSite 等）做校验，
    // 非法的配置会抛出异常，这里跳过该 cookie 并输出错误日志，
    // 避免影响其他 cookie 的输出以及本次响应
    const [cookieError] = attempt(() => res.setCookie(key, value, options))
    if (cookieError) {
      logger.error(
        `${ansis.red(`mock error at ${url}`)}\n${cookieError}
  at cookies (${ansis.underline(filepath)})
  cookie: ${ansis.yellow(key)}`,
        mock.log,
      )
    }
  })
}
