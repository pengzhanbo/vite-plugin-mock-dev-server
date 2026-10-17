import type { Readable } from 'node:stream'
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
 * Context used to report the errors of a stream response
 *
 * 用于输出流式响应错误的上下文
 */
interface StreamErrorContext {
  logger: Logger
  url: string
  filepath?: string
  level?: MockHttpItem['log']
}

/**
 * Send response data
 *
 * 设置响应数据
 *
 * 流式响应的源流错误会被接管：记录错误日志后按响应是否已开始发送分别处理，
 * 避免 `error` 事件无人监听抛出未捕获异常而终止整个 dev server 进程。
 *
 * Errors of a stream response are handled here: the error is logged and handled
 * according to whether the response has started, so that an unhandled `error`
 * event cannot crash the whole dev server process.
 *
 * @param res - Response object / 响应对象
 * @param raw - Response body data / 响应体数据
 * @param type - Response data type / 响应数据类型
 * @param context - Error log context of the stream response / 流式响应的错误日志上下文
 */
export function sendResponseData(
  res: MockResponse,
  raw: ResponseBody,
  type: string,
  context?: StreamErrorContext,
): void {
  if (isReadableStream(raw)) {
    sendStreamData(res, raw, context)
  } else if (Buffer.isBuffer(raw)) {
    res.end(raw)
  } else {
    const content = typeof raw === 'string' ? raw : JSON.stringify(raw)
    res.end(type === 'buffer' ? Buffer.from(content) : content)
  }
}

/**
 * Pipe a readable stream to the response with error handling
 *
 * 将可读流写入响应，并处理流错误
 *
 * `pipe` 不会为源流注册 `error` 监听，mock 返回文件流 / 网络流时，一旦读取失败
 * （文件被删除、上游断流），`error` 事件无人接管会抛出未捕获异常并终止进程。
 *
 * `pipe` does not register an `error` listener on the source stream. When a mock
 * returns a file or network stream, a read failure (deleted file, broken upstream)
 * would emit an unhandled `error` event and terminate the process.
 *
 * @param res - Response object / 响应对象
 * @param raw - Readable stream / 可读流
 * @param context - Error log context / 错误日志上下文
 */
function sendStreamData(res: MockResponse, raw: Readable, context?: StreamErrorContext): void {
  raw.once('error', (error: Error) => {
    if (context) {
      context.logger.error(
        `${ansis.red(`mock error at ${context.url}`)}\n  ${error}\n  at stream (${ansis.underline.gray(context.filepath ?? '')})`,
        context.level,
      )
    }

    // 源流已不可用，停止向响应写入剩余数据
    // The source stream is not usable anymore, stop writing to the response
    if (!raw.destroyed) {
      raw.destroy()
    }

    // 响应体已经开始写出，无法再改写状态码：销毁响应，让客户端感知响应不完整，
    // 而不是一直等待剩余字节。不传入 error，避免再触发未监听的 `error` 事件。
    // The response has already started, so the status cannot be changed anymore:
    // destroy it so the client notices the incomplete response instead of waiting
    // for the remaining bytes. No error is passed to avoid emitting an unhandled
    // `error` event on the response.
    if (res.headersSent || res.writableEnded) {
      res.destroy()
      return
    }

    // 尚未写出任何响应体，按 500 结束本次响应
    // Nothing has been written yet, end the response with 500
    res.removeHeader('content-length')
    res.statusCode = 500
    res.statusMessage = getHTTPStatusText(500)
    res.end('')
  })

  // 客户端提前断开时销毁源流，避免文件句柄 / 上游连接泄漏；
  // `pipe` 会在目标流关闭时自动 unpipe，但不会销毁源流
  // Destroy the source stream when the client disconnects early to avoid leaking
  // file handles / upstream connections; `pipe` unpipes but does not destroy it
  res.once('close', () => {
    if (!raw.destroyed) {
      raw.destroy()
    }
  })

  raw.pipe(res)
}

/**
 * Apply real response delay
 *
 * 实际响应延迟
 *
 * 延迟统一以「请求开始时间」为基准计时，请求解析阶段已消耗的时间会从本次采样出的延迟中扣除，
 * 因此数值形式与数组形式语义一致：两者都不是在此前的基础上「额外再等一次」。
 * 需要注意的是，当请求解析耗时已经超过延迟（数组形式为范围上限）时，剩余等待时间为 0，
 * 即直接响应，不会为了凑满延迟而继续等待。
 *
 * The delay is always measured from the request start time, and the time already spent
 * on request parsing is deducted from the sampled delay, so the number form and the array
 * form share the same semantics: neither of them waits an extra round on top of it.
 * Note that when the request parsing time already exceeds the delay (the upper bound for
 * the array form), the remaining wait is 0 and the response is sent immediately, instead
 * of waiting longer to fulfill the configured delay.
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
  // 已经耗费的解析时间 / elapsed time already spent before responding
  const elapsed = timestamp() - startTime
  let realDelay = 0
  if (isArray(delay)) {
    const [min, max] = delay
    // 以「已耗时」与 `min` 中的较大者作为本次采样的下限，避免总耗时低于用户配置的下限；
    // 若已耗时已达上限，则不再等待
    // Take the larger of the elapsed time and `min` as the lower bound of the sampled
    // delay so the total elapsed never falls below `min`; wait nothing once the elapsed
    // time has already reached the upper bound
    const lowerBound = Math.min(Math.max(min, elapsed), max)
    realDelay = lowerBound >= max ? 0 : random(lowerBound, max, true) - elapsed
  } else {
    realDelay = delay - elapsed
  }
  if (realDelay > 0) {
    await sleep(realDelay)
  }
}
