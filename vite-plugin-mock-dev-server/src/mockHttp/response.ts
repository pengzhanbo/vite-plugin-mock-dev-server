import type { Logger } from '../core/index.js'
import type { MockHttpItem, MockRequest, MockResponse, ResponseBody } from '../types/index.js'
import { Buffer } from 'node:buffer'
import {
  attempt,
  attemptAsync,
  isArray,
  isFunction,
  objectKeys,
  random,
  sleep,
  timestamp,
} from '@pengzhanbo/utils'
import ansis from 'ansis'
import HTTP_STATUS from 'http-status'
import * as mime from 'mime-types'
import { isReadableStream } from '../utils/index.js'

/**
 * Get HTTP status text by status code
 *
 * 根据状态码获取状态文本
 *
 * @param status - HTTP status code / HTTP 状态码
 * @returns HTTP status text / HTTP 状态文本
 */
export function getHTTPStatusText(status: number): string {
  return (HTTP_STATUS[status as keyof typeof HTTP_STATUS] as string) || 'Unknown'
}

/**
 * Set response status
 *
 * 设置响应状态
 *
 * @param response - Response object / 响应对象
 * @param status - HTTP status code / HTTP 状态码
 * @param statusText - HTTP status text / HTTP 状态文本
 */
export function provideResponseStatus(
  response: MockResponse,
  status = 200,
  statusText?: string,
): void {
  response.statusCode = status
  response.statusMessage = statusText ?? getHTTPStatusText(status)
}

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
function isValidHttpToken(name: string): boolean {
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
  const filepath = (mock as any).__filepath__ as string
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

  res.setHeader('Cache-Control', 'no-cache,max-age=0')
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

  const filepath = (mock as any).__filepath__ as string
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

/**
 * Send response data
 *
 * 设置响应数据
 *
 * @param res - Response object / 响应对象
 * @param raw - Response body data / 响应体数据
 * @param type - Response data type / 响应数据类型
 */
export function sendResponseData(res: MockResponse, raw: ResponseBody, type: string): void {
  if (isReadableStream(raw)) {
    raw.pipe(res)
  } else if (Buffer.isBuffer(raw)) {
    res.end(type === 'text' || type === 'json' ? raw.toString('utf-8') : raw)
  } else {
    const content = typeof raw === 'string' ? raw : JSON.stringify(raw)
    res.end(type === 'buffer' ? Buffer.from(content) : content)
  }
}

/**
 * Apply real response delay
 *
 * 实际响应延迟
 *
 * @param startTime - Request start time / 请求开始时间
 * @param delay - Delay configuration / 延迟配置
 */
export async function responseRealDelay(
  startTime: number,
  delay?: MockHttpItem['delay'],
): Promise<void> {
  if (
    !delay ||
    (typeof delay === 'number' && delay <= 0) ||
    (isArray(delay) && delay.length !== 2)
  ) {
    return
  }
  let realDelay = 0
  if (isArray(delay)) {
    const [min, max] = delay
    realDelay = random(min, max)
  } else {
    realDelay = delay - (timestamp() - startTime)
  }
  if (realDelay > 0) {
    await sleep(realDelay)
  }
}
