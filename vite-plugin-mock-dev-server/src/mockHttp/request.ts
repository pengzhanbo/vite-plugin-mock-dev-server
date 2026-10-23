import type { MatchFunction } from 'path-to-regexp'
import type { Connect } from 'vite'
import type { Logger } from '../core/index.js'
import type { BodyParserOptions, ExtraRequest, Headers, MockRequest } from '../types/index.js'
import { Buffer } from 'node:buffer'
import { PassThrough } from 'node:stream'
import { isEmptyObject, LRUCache } from '@pengzhanbo/utils'
import ansis from 'ansis'
import bodyParser from 'co-body'
import formidable from 'formidable'
import { match } from 'path-to-regexp'
import { isObjectSubset } from '../utils/index.js'

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
 * Parse request body
 *
 * 解析请求体 request.body
 *
 * @param req - Incoming message object / 入站消息对象
 * @param logger - Logger instance / 日志实例
 * @param formidableOptions - Formidable options for multipart form data / 用于 multipart 表单数据的 Formidable 配置项
 * @param bodyParserOptions - Body parser options / 请求体解析配置项
 * @returns Parsed request body / 解析后的请求体
 */
export async function parseRequestBody(
  req: Connect.IncomingMessage,
  logger: Logger,
  formidableOptions: formidable.Options,
  bodyParserOptions: BodyParserOptions = {},
): Promise<any> {
  const method = req.method!.toUpperCase()
  if (['HEAD', 'OPTIONS'].includes(method)) {
    return undefined
  }
  const type = req.headers['content-type']?.toLocaleLowerCase() ?? ''

  // `maxBodySize` 在读取请求体时生效（见 `readRequestBody`），不能透传给 `co-body`。
  const { limit, formLimit, jsonLimit, textLimit, maxBodySize: _, ...rest } = bodyParserOptions
  try {
    if (type.startsWith('application/json')) {
      return await bodyParser.json(req, { limit: jsonLimit ?? limit, ...rest })
    }

    if (type.startsWith('application/x-www-form-urlencoded')) {
      return await bodyParser.form(req, { limit: formLimit ?? limit, ...rest })
    }

    if (type.startsWith('text/plain')) {
      return await bodyParser.text(req, { limit: textLimit ?? limit, ...rest })
    }

    if (type.startsWith('multipart/form-data')) {
      return await parseRequestBodyWithMultipart(req, formidableOptions)
    }
  } catch (e) {
    logger.error(e)
  }
  return undefined
}

export interface ParsedRequestBody {
  body: any
  rawBody?: Buffer
}

/**
 * Parse request body and collect raw body
 *
 * 解析请求体并收集原始请求体
 *
 * @param req - Incoming message object / 入站消息对象
 * @param logger - Logger instance / 日志实例
 * @param formidableOptions - Formidable options for multipart form data / 用于 multipart 表单数据的 Formidable 配置项
 * @param bodyParserOptions - Body parser options / 请求体解析配置项
 * @returns Parsed request body and raw request body / 解析后的请求体和原始请求体
 */
export async function parseRequestBodyWithRaw(
  req: Connect.IncomingMessage,
  logger: Logger,
  formidableOptions: formidable.Options,
  bodyParserOptions: BodyParserOptions = {},
): Promise<ParsedRequestBody> {
  const method = req.method!.toUpperCase()
  if (['HEAD', 'OPTIONS'].includes(method)) {
    return { body: undefined }
  }

  const contentType = req.headers['content-type']
  const contentLength = req.headers['content-length']
  const transferEncoding = req.headers['transfer-encoding']
  if (!contentType && !contentLength && !transferEncoding) {
    return { body: undefined }
  }

  // 大小上限必须在读取阶段生效：`co-body` 的 limit 只能作用于已经被完整缓冲的请求体，
  // 无法阻止内存占用（详见 `readRequestBody`）。
  const maxBodySize = resolveBodyLimit(req, bodyParserOptions)
  const declaredLength = getContentLength(req)
  if (Number.isFinite(maxBodySize) && declaredLength != null && declaredLength > maxBodySize) {
    throw new RequestBodyError(
      'BODY_TOO_LARGE',
      413,
      `Request body exceeds the ${maxBodySize} bytes limit`,
    )
  }

  const rawBody = await readRequestBody(req, maxBodySize)
  if (!rawBody.byteLength) {
    return { body: undefined, rawBody }
  }

  const body = await parseRequestBody(
    createRequestStream(req, rawBody),
    logger,
    formidableOptions,
    bodyParserOptions,
  )

  return { body, rawBody }
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
function readRequestBody(req: Connect.IncomingMessage, maxBodySize: number): Promise<Buffer> {
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
function resolveBodyLimit(
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
function getContentLength(req: Connect.IncomingMessage): number | undefined {
  const raw = req.headers['content-length']
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) {
    return undefined
  }
  const length = Number(value)
  return Number.isFinite(length) && length >= 0 ? length : undefined
}

function createRequestStream(
  req: Connect.IncomingMessage,
  rawBody: Buffer,
): Connect.IncomingMessage {
  const stream = new PassThrough()
  Object.assign(stream, {
    headers: req.headers,
    method: req.method,
    url: req.url,
    socket: req.socket,
  })
  stream.end(rawBody)
  return stream as unknown as Connect.IncomingMessage
}

/**
 * Default formidable options
 *
 * 默认的 formidable 配置项
 */
const DEFAULT_FORMIDABLE_OPTIONS: formidable.Options = {
  keepExtensions: true,
  filename(name, ext, part) {
    return part?.originalFilename ?? `${name}.${Date.now()}${ext ? `.${ext}` : ''}`
  },
}

/**
 * Parse request body with multipart form data
 *
 * 解析 request form multipart body
 *
 * @param req - Incoming message object / 入站消息对象
 * @param options - Formidable options / Formidable 配置项
 * @returns Parsed request body / 解析后的请求体
 */
async function parseRequestBodyWithMultipart(
  req: Connect.IncomingMessage,
  options: formidable.Options,
): Promise<any> {
  const form = formidable({ ...DEFAULT_FORMIDABLE_OPTIONS, ...options })

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error as Error)
        return
      }
      resolve({ ...fields, ...files })
    })
  })
}

/**
 * Cache for path-to-regexp match functions
 *
 * path-to-regexp 匹配函数缓存
 *
 * 使用 `LRUCache` 限制缓存上限，避免 mock 文件频繁增删改时无界增长
 *
 * `LRUCache` bounds the cache size, avoiding unbounded growth when mock files are
 * frequently added, removed or edited.
 */
const matcherCache = new LRUCache<
  string,
  MatchFunction<Partial<Record<string, string | string[]>>>
>({ maxSize: 1024 })

/**
 * Parse request URL dynamic parameters
 *
 * 解析请求 url 中的动态参数 params
 *
 * @param pattern - URL pattern / URL 模式
 * @param url - Request URL / 请求 URL
 * @returns Parsed parameters / 解析后的参数
 */
export function parseRequestParams(
  pattern: string,
  url: string,
): Partial<Record<string, string | string[]>> {
  let matcher = matcherCache.get(pattern)
  if (!matcher) {
    matcher = match(pattern, { decode: decodeRequestParam })
    matcherCache.set(pattern, matcher)
  }
  const matched = matcher(url)
  return matched ? matched.params : {}
}

/**
 * Decode a matched parameter without throwing on malformed percent-encoding
 *
 * 解码匹配到的参数，遇到非法的百分号编码时不抛出异常
 *
 * @param value - Raw matched parameter / 匹配到的原始参数
 * @returns Decoded parameter, or the raw value when it cannot be decoded / 解码后的参数，无法解码时为原始值
 */
function decodeRequestParam(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Normalize header names to lowercase for case-insensitive comparison
 *
 * 将请求头名称归一化为小写，用于大小写不敏感的比较
 *
 * @param headers - Header object to normalize / 需要归一化的请求头对象
 * @returns Normalized header object / 归一化后的请求头对象
 */
function normalizeHeaderNames(headers?: Headers): Headers | undefined {
  if (!headers) {
    return undefined
  }
  const normalized: Headers = {}
  for (const name in headers) {
    normalized[name.toLowerCase()] = headers[name]
  }
  return normalized
}

/**
 * Validate request against validator
 *
 * 验证请求是否符合 validator
 *
 * @param request - Request object / 请求对象
 * @param validator - Validator object / 验证器对象
 * @returns Whether the request is valid / 请求是否有效
 */
export function requestValidate(request: ExtraRequest, validator: Partial<ExtraRequest>): boolean {
  return (
    isObjectSubset(request.headers, normalizeHeaderNames(validator.headers)) &&
    isObjectSubset(request.body, validator.body) &&
    isObjectSubset(request.params, validator.params) &&
    isObjectSubset(request.query, validator.query) &&
    isObjectSubset(request.refererQuery, validator.refererQuery)
  )
}

/**
 * Format log data
 *
 * 格式化日志数据
 *
 * @param prefix - Log prefix / 日志前缀
 * @param data - Data to format / 要格式化的数据
 * @returns Formatted log string / 格式化后的日志字符串
 */
function formatLog(prefix: string, data: any): string {
  return !data || isEmptyObject(data) ? '' : `  ${ansis.gray(`${prefix}:`)}${JSON.stringify(data)}`
}

/**
 * Generate request log
 *
 * 生成请求日志
 *
 * @param request - Request object / 请求对象
 * @param filepath - Mock file path / Mock 文件路径
 * @param shouldSimulateError - Whether to simulate error / 是否模拟错误
 * @returns Formatted log string / 格式化后的日志字符串
 */
export function requestLog(
  request: MockRequest,
  filepath: string,
  shouldSimulateError?: boolean,
): string {
  const { url, method, query, params, body } = request
  let { pathname } = new URL(url!, 'http://example.com')
  pathname = ansis.green(decodeURIComponent(pathname))
  const ms = ansis.magenta.bold(method)
  const qs = formatLog('query', query)
  const ps = formatLog('params', params)
  const bs = formatLog('body', body)
  const es = shouldSimulateError ? ` 🎲 ${ansis.bgYellow('ERR')}` : ''
  const file = `  ${ansis.dim.underline(`(${filepath})`)}`
  return `${ms}${es} ${pathname}${qs}${ps}${bs}${file}`
}
