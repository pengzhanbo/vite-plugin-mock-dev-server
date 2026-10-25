/**
 * Response header writing
 *
 * 响应头写入
 *
 * Every header set by a mock is validated before it reaches `res.setHeader`:
 * an invalid name or value is logged and skipped instead of breaking the response.
 *
 * mock 配置的每个 header 在写入 `res.setHeader` 之前都会先校验：
 * 非法的名称或值只记录日志并跳过，避免导致本次响应异常。
 */

import type { Logger } from '../core/index.js'
import type { MockHttpItem, MockRequest, MockResponse } from '../types/index.js'
import { attempt, attemptAsync, isFunction, objectKeys } from '@pengzhanbo/utils'
import ansis from 'ansis'
import * as mime from 'mime-types'

const HTTP_TOKEN_REGEX = /^[\w`!#$%&'*+.|~^-]+$/
const HTTP_VALUE_REGEX = /^[\t\x20-\x7E\x80-\xFF]*$/

/**
 * Check whether the name is a valid HTTP token
 *
 * 校验名称是否为合法的 HTTP token
 *
 * @see https://nodejs.org/api/http.html#responsesetheadername-value
 * @param name - Name to validate / 需要校验的名称
 * @returns Whether the name is valid / 名称是否合法
 */
export function isValidHttpToken(name: string): boolean {
  return HTTP_TOKEN_REGEX.test(name)
}

/**
 * Normalize the header value created by the plugin itself
 *
 * 归一化由插件自身创建的 header 值
 *
 * @param value - Header value / header 值
 * @returns Valid header value / 合法的 header 值
 */
function toHeaderValue(value: string): string {
  return HTTP_VALUE_REGEX.test(value) ? value : encodeURI(value)
}

/**
 * Context of a header write
 *
 * 写入响应头时的上下文
 */
interface HeaderContext {
  res: MockResponse
  logger: Logger
  url: string
  filepath: string
  level?: MockHttpItem['log']
}

/**
 * Set a response header safely
 *
 * 安全地设置响应头
 *
 * `res.setHeader` throws when the header name is not a valid HTTP token, or the
 * value contains invalid characters (such as non-latin1 characters or newlines).
 * Such headers are skipped with an error log instead of breaking the response.
 *
 * 当 header 名称不是合法的 HTTP token，或 header 值包含非法字符
 * （如非 latin1 字符、换行符）时，`res.setHeader` 会抛出异常。
 * 此时跳过该 header 并输出错误日志，而不是导致响应异常。
 *
 * @param context - Header context / header 上下文
 * @param name - Header name / header 名称
 * @param value - Header value / header 值
 */
function setResponseHeader(context: HeaderContext, name: string, value: string | string[]): void {
  const { res, logger, url, filepath, level } = context

  if (!isValidHttpToken(name)) {
    logger.error(
      `${ansis.red(`mock error at ${url}`)}
  Invalid response header name: ${ansis.yellow(name)}
  at headers (${ansis.underline(filepath)})`,
      level,
    )
    return
  }

  const [error] = attempt(() => res.setHeader(name, value))
  if (error) {
    logger.error(
      `${ansis.red(`mock error at ${url}`)}\n${error}\n  at headers (${ansis.underline(filepath)})`,
      level,
    )
  }
}

/**
 * Set response headers
 *
 * 设置响应头
 *
 * @param req - Request object / 请求对象
 * @param res - Response object / 响应对象
 * @param mock - Mock HTTP item / Mock HTTP 配置项
 * @param logger - Logger instance / 日志实例
 */
export async function provideResponseHeaders(
  req: MockRequest,
  res: MockResponse,
  mock: MockHttpItem,
  logger: Logger,
): Promise<void> {
  const { headers, type = 'json' } = mock
  const filepath = mock.__filepath__ as string
  const contentType = mime.contentType(type) || mime.contentType(mime.lookup(type) || '')
  const context: HeaderContext = {
    res,
    logger,
    url: req.url!.split('?')[0],
    filepath,
    level: mock.log,
  }

  if (contentType) {
    res.setHeader('Content-Type', contentType)
  }

  res.setHeader('Cache-Control', 'no-cache, max-age=0')
  res.setHeader('X-Mock-Power-By', 'vite-plugin-mock-dev-server')

  if (filepath) {
    res.setHeader('X-File-Path', toHeaderValue(filepath))
  }

  if (!headers) {
    return
  }

  const [error, data] = await attemptAsync(async () =>
    isFunction(headers) ? headers(req) : headers,
  )
  if (error) {
    logger.error(
      `${ansis.red(`mock error at ${context.url}`)}\n${error}
  at headers (${ansis.underline(filepath)})`,
      mock.log,
    )
    return
  }
  data && objectKeys(data).forEach((key) => setResponseHeader(context, `${key}`, data[key]!))
}
