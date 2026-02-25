import type { MockHttpItem, MockRequest, MockResponse, ResponseBody } from '../types'
import { Buffer } from 'node:buffer'
import { attemptAsync, isArray, isFunction, objectKeys, random, sleep, timestamp } from '@pengzhanbo/utils'
import ansis from 'ansis'
import HTTP_STATUS from 'http-status'
import * as mime from 'mime-types'
import { isReadableStream, type Logger } from '../utils'

/**
 * Get HTTP status text by status code
 *
 * 根据状态码获取状态文本
 *
 * @param status - HTTP status code / HTTP 状态码
 * @returns HTTP status text / HTTP 状态文本
 */
export function getHTTPStatusText(status: number): string {
  return HTTP_STATUS[status as keyof typeof HTTP_STATUS] as string || 'Unknown'
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
  response.statusMessage = statusText || getHTTPStatusText(status)
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
  const contentType
    = mime.contentType(type) || mime.contentType(mime.lookup(type) || '')

  if (contentType)
    res.setHeader('Content-Type', contentType)

  res.setHeader('Cache-Control', 'no-cache,max-age=0')
  res.setHeader('X-Mock-Power-By', 'vite-plugin-mock-dev-server')

  if (filepath)
    res.setHeader('X-File-Path', filepath)

  if (!headers)
    return

  const [error, data] = await attemptAsync(async () =>
    isFunction(headers) ? await headers(req) : headers,
  )
  if (error) {
    logger.error(
      `${ansis.red(`mock error at ${req.url!.split('?')[0]}`)}\n${error}\n  at headers (${ansis.underline(filepath)})`,
      mock.log,
    )
    return
  }
  objectKeys(data).forEach(key => res.setHeader(key, data[key]!))
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
  if (!cookies)
    return

  const [error, data] = await attemptAsync(async () =>
    isFunction(cookies) ? await cookies(req) : cookies,
  )
  if (error) {
    const filepath = (mock as any).__filepath__ as string
    logger.error(
      `${ansis.red(`mock error at ${req.url!.split('?')[0]}`)}\n${error}\n  at cookies (${ansis.underline(filepath)})`,
      mock.log,
    )
    return
  }
  objectKeys(data).forEach((key) => {
    const cookie = data[key]
    const [value, options] = isArray(cookie) ? cookie : [cookie]
    res.setCookie(key, value, options)
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
  }
  else if (Buffer.isBuffer(raw)) {
    res.end(type === 'text' || type === 'json' ? raw.toString('utf-8') : raw)
  }
  else {
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
export async function responseRealDelay(startTime: number, delay?: MockHttpItem['delay']): Promise<void> {
  if (
    !delay
    || (typeof delay === 'number' && delay <= 0)
    || (isArray(delay) && delay.length !== 2)
  ) {
    return
  }
  let realDelay = 0
  if (isArray(delay)) {
    const [min, max] = delay
    realDelay = random(min, max)
  }
  else {
    realDelay = delay - (timestamp() - startTime)
  }
  if (realDelay > 0)
    await sleep(realDelay)
}
