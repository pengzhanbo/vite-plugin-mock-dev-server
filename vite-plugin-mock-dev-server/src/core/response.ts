import type { MockHttpItem, MockRequest, MockResponse, ResponseBody } from '../types'
import { Buffer } from 'node:buffer'
import { isArray, isFunction, random, sleep, timestamp } from '@pengzhanbo/utils'
import ansis from 'ansis'
import HTTP_STATUS from 'http-status'
import * as mime from 'mime-types'
import { isReadableStream, type Logger } from '../utils'

/**
 * 根据状态码获取状态文本
 */
export function getHTTPStatusText(status: number): string {
  return HTTP_STATUS[status as keyof typeof HTTP_STATUS] as string || 'Unknown'
}

/**
 * 设置响应状态
 */
export function provideResponseStatus(
  response: MockResponse,
  status = 200,
  statusText?: string,
) {
  response.statusCode = status
  response.statusMessage = statusText || getHTTPStatusText(status)
}

/**
 * 设置响应头
 */
export async function provideResponseHeaders(
  req: MockRequest,
  res: MockResponse,
  mock: MockHttpItem,
  logger: Logger,
) {
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

  try {
    const raw = isFunction(headers) ? await headers(req) : headers
    Object.keys(raw).forEach((key) => {
      res.setHeader(key, raw[key]!)
    })
  }
  catch (e) {
    logger.error(
      `${ansis.red(
        `mock error at ${req.url!.split('?')[0]}`,
      )}\n${e}\n  at headers (${ansis.underline(filepath)})`,
      mock.log,
    )
  }
}

/**
 * 设置响应cookie
 */
export async function provideResponseCookies(
  req: MockRequest,
  res: MockResponse,
  mock: MockHttpItem,
  logger: Logger,
) {
  const { cookies } = mock
  const filepath = (mock as any).__filepath__ as string
  if (!cookies)
    return
  try {
    const raw = isFunction(cookies) ? await cookies(req) : cookies
    Object.keys(raw).forEach((key) => {
      const cookie = raw[key]
      if (isArray(cookie)) {
        const [value, options] = cookie
        res.setCookie(key, value, options)
      }
      else {
        res.setCookie(key, cookie)
      }
    })
  }
  catch (e) {
    logger.error(
      `${ansis.red(
        `mock error at ${req.url!.split('?')[0]}`,
      )}\n${e}\n  at cookies (${ansis.underline(filepath)})`,
      mock.log,
    )
  }
}

/**
 * 设置响应数据
 */
export function sendResponseData(res: MockResponse, raw: ResponseBody, type: string) {
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
 * 实际响应延迟
 */
export async function responseRealDelay(startTime: number, delay?: MockHttpItem['delay']) {
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
