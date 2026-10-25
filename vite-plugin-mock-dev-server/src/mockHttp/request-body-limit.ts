/**
 * Request body size limits and bounded reading
 *
 * 请求体大小上限与有界读取
 *
 * The body is buffered by this module, so the size limit takes effect while reading
 * instead of after the whole body has been buffered by `co-body`.
 *
 * 请求体由本模块缓冲，因此大小上限在读取阶段即生效，
 * 而不是等 `co-body` 完整缓冲请求体之后才生效。
 */

import type { Connect } from 'vite'
import type { BodyParserOptions } from '../types/index.js'
import { Buffer } from 'node:buffer'

/**
 * Default limit of the raw request body (50 MiB)
 *
 * 原始请求体的默认上限（50 MiB）
 */
const DEFAULT_MAX_BODY_SIZE = 50 * 1024 * 1024

/**
 * Byte units accepted by `maxBodySize` / `limit`
 *
 * `maxBodySize` / `limit` 支持的字节单位
 */
const BYTE_UNITS: Record<string, number> = {
  b: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
}

/**
 * Pattern of a size value such as `1mb` / `512kb` / `1024`
 *
 * 尺寸值（如 `1mb` / `512kb` / `1024`）的匹配模式
 */
const BYTE_SIZE_RE = /^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/i

/**
 * Error raised while reading the request body
 *
 * 读取请求体时抛出的错误
 *
 * It carries a status code so the middleware can answer the request (such as `413`)
 * instead of letting the error fall through to the generic error handler.
 *
 * 该错误携带状态码，中间件可以直接据此结束请求（如 `413`），
 * 而不是让错误落入通用错误处理。
 */
export class RequestBodyError extends Error {
  /**
   * Machine readable error code
   *
   * 机器可读的错误码
   */
  readonly code: 'BODY_TOO_LARGE' | 'REQUEST_ABORTED'
  /**
   * HTTP status code used to answer the request
   *
   * 用于结束请求的 HTTP 状态码
   */
  readonly statusCode: number

  /**
   * Constructor
   *
   * 构造函数
   *
   * @param code - Error code / 错误码
   * @param statusCode - HTTP status code / HTTP 状态码
   * @param message - Error message / 错误信息
   */
  constructor(code: 'BODY_TOO_LARGE' | 'REQUEST_ABORTED', statusCode: number, message: string) {
    super(message)
    this.name = 'RequestBodyError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * Check whether the error comes from reading the request body
 *
 * 判断错误是否来自请求体读取
 *
 * @param error - Unknown error / 未知错误
 * @returns Whether it is a `RequestBodyError` / 是否为 `RequestBodyError`
 */
export function isRequestBodyError(error: unknown): error is RequestBodyError {
  return error instanceof RequestBodyError
}

/**
 * Read the whole request body with an upper bound
 *
 * 在大小上限内读取完整请求体
 *
 * The promise always settles:
 *
 * - the body exceeds `maxBodySize` → `RequestBodyError` with `413`, reading is paused so
 *   the middleware can still answer the request;
 * - the client aborts before the body ends → `RequestBodyError` with `400`.
 *
 * Promise 一定会 settle：
 *
 * - 请求体超过 `maxBodySize` → 抛出 `413` 的 `RequestBodyError`，并暂停读取，
 *   使中间件仍能正常响应；
 * - 客户端在请求体结束前断开 → 抛出 `400` 的 `RequestBodyError`。
 *
 * @param req - Incoming message / 入站消息
 * @param maxBodySize - Max size in bytes / 最大字节数
 * @returns Raw request body / 原始请求体
 */
export function readRequestBody(
  req: Connect.IncomingMessage,
  maxBodySize: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let received = 0
    let ended = false
    let settled = false

    const cleanup = (): void => {
      req.removeListener('data', onData)
      req.removeListener('end', onEnd)
      req.removeListener('error', onError)
      req.removeListener('aborted', onAborted)
      req.removeListener('close', onClose)
    }

    /**
     * @returns Whether the promise is still pending / 是否仍处于 pending 状态
     */
    const done = (): boolean => {
      if (settled) {
        return false
      }
      settled = true
      cleanup()
      return true
    }

    function onData(chunk: Buffer | string): void {
      if (settled) {
        return
      }
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      received += buffer.byteLength
      if (received > maxBodySize) {
        // 停止继续读取，但不要销毁连接：中间件还需要写出 413 响应
        // Stop reading, but keep the connection: the middleware still has to answer 413
        req.pause?.()
        if (done()) {
          reject(
            new RequestBodyError(
              'BODY_TOO_LARGE',
              413,
              `Request body exceeds the ${maxBodySize} bytes limit`,
            ),
          )
        }
        return
      }
      chunks.push(buffer)
    }

    function onEnd(): void {
      ended = true
      if (done()) {
        resolve(chunks.length ? Buffer.concat(chunks) : Buffer.alloc(0))
      }
    }

    function onError(error: Error): void {
      if (done()) {
        reject(error)
      }
    }

    function onAborted(): void {
      if (done()) {
        reject(new RequestBodyError('REQUEST_ABORTED', 400, 'Request was aborted by the client'))
      }
    }

    function onClose(): void {
      // 请求体正常读完后 `close` 也会触发，此时已经 resolve
      // `close` is also emitted after a fully read body, which has been resolved already
      if (ended || !done()) {
        return
      }
      reject(
        new RequestBodyError('REQUEST_ABORTED', 400, 'Request was closed before the body ended'),
      )
    }

    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onError)
    req.on('aborted', onAborted)
    req.on('close', onClose)
  })
}

/**
 * Resolve the effective body size limit
 *
 * 解析实际生效的请求体大小上限
 *
 * The smaller one of the configured `maxBodySize` and the `co-body` limit matching the
 * content type is used, so a stricter `co-body` limit keeps working as before.
 *
 * 取 `maxBodySize` 与「当前 content-type 对应的 `co-body` 限制」中较小的一个，
 * 使更严格的 `co-body` 限制保持原有语义。
 *
 * @param req - Incoming message / 入站消息
 * @param bodyParserOptions - Body parser options / 请求体解析配置
 * @returns Effective limit in bytes / 实际生效的字节上限
 */
export function resolveBodyLimit(
  req: Connect.IncomingMessage,
  bodyParserOptions: BodyParserOptions,
): number {
  const type = (req.headers['content-type'] ?? '').toLowerCase()
  const { limit, jsonLimit, formLimit, textLimit } = bodyParserOptions

  let typeLimit: number | undefined
  if (type.startsWith('application/json')) {
    typeLimit = toByteSize(jsonLimit ?? limit)
  } else if (type.startsWith('application/x-www-form-urlencoded')) {
    typeLimit = toByteSize(formLimit ?? limit)
  } else if (type.startsWith('text/plain')) {
    typeLimit = toByteSize(textLimit ?? limit)
  } else if (!type.startsWith('multipart/form-data')) {
    typeLimit = toByteSize(limit)
  }
  // multipart 的 `limit` 不生效（由 formidable 自行限制），只使用整体上限
  // `limit` does not apply to multipart (formidable limits it), only the global one is used

  return Math.min(typeLimit ?? Number.POSITIVE_INFINITY, resolveMaxBodySize(bodyParserOptions))
}

/**
 * Resolve `maxBodySize`, `0` disables the limit
 *
 * 解析 `maxBodySize`，`0` 表示不限制
 *
 * @param bodyParserOptions - Body parser options / 请求体解析配置
 * @returns Max size in bytes / 最大字节数
 */
function resolveMaxBodySize(bodyParserOptions: BodyParserOptions): number {
  const { maxBodySize } = bodyParserOptions
  if (maxBodySize === 0 || maxBodySize === '0' || maxBodySize === Number.POSITIVE_INFINITY) {
    return Number.POSITIVE_INFINITY
  }
  const size = toByteSize(maxBodySize)
  return size != null && size > 0 ? size : DEFAULT_MAX_BODY_SIZE
}

/**
 * Convert a size value (`1024` / `'1kb'` / `'1.5mb'`) to bytes
 *
 * 将尺寸值（`1024` / `'1kb'` / `'1.5mb'`）转换为字节数
 *
 * @param value - Size value / 尺寸值
 * @returns Bytes, `undefined` when it cannot be parsed / 字节数，无法解析时为 `undefined`
 */
function toByteSize(value?: number | string): number | undefined {
  if (value == null) {
    return undefined
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : undefined
  }
  const matched = BYTE_SIZE_RE.exec(value.trim())
  if (!matched) {
    return undefined
  }
  const unit = BYTE_UNITS[(matched[2] ?? 'b').toLowerCase()] ?? 1
  return Number(matched[1]) * unit
}

/**
 * Read the declared `content-length` of the request
 *
 * 读取请求声明的 `content-length`
 *
 * @param req - Incoming message / 入站消息
 * @returns Declared length, `undefined` when absent or invalid / 声明的长度，缺失或非法时为 `undefined`
 */
export function getContentLength(req: Connect.IncomingMessage): number | undefined {
  const raw = req.headers['content-length']
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) {
    return undefined
  }
  const length = Number(value)
  return Number.isFinite(length) && length >= 0 ? length : undefined
}
