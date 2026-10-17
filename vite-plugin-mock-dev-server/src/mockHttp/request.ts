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
  const { limit, formLimit, jsonLimit, textLimit, ...rest } = bodyParserOptions
  try {
    if (type.startsWith('application/json')) {
      return await bodyParser.json(req, {
        limit: jsonLimit ?? limit,
        ...rest,
      })
    }

    if (type.startsWith('application/x-www-form-urlencoded')) {
      return await bodyParser.form(req, {
        limit: formLimit ?? limit,
        ...rest,
      })
    }

    if (type.startsWith('text/plain')) {
      return await bodyParser.text(req, {
        limit: textLimit ?? limit,
        ...rest,
      })
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
 * Default buffering limit of the JSON / form / text body
 *
 * JSON / form / text 请求体的默认缓冲上限
 *
 * 与 co-body（raw-body）的 `1mb` 默认限制保持一致
 *
 * Kept in sync with the `1mb` default limit of co-body (raw-body)
 */
const DEFAULT_BODY_LIMIT: number = 1024 * 1024

/**
 * Default buffering limit of the multipart body
 *
 * multipart 请求体的默认缓冲上限
 *
 * 与 formidable 的 `maxFileSize` 默认值保持一致
 *
 * Kept in sync with the `maxFileSize` default of formidable
 */
const DEFAULT_MULTIPART_LIMIT: number = 200 * 1024 * 1024

const SIZE_UNITS: Record<string, number> = {
  b: 1,
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
  tb: 1024 ** 4,
  pb: 1024 ** 5,
}

const SIZE_REGEX = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb)?$/i

/**
 * Parse a body size option into bytes
 *
 * 将请求体大小配置解析为字节数
 *
 * 支持数字以及 `bytes` 风格的字符串（如 `'10mb'`），无法解析时返回 `undefined`
 *
 * Supports numbers and `bytes` style strings (such as `'10mb'`), returns `undefined`
 * when the value cannot be parsed
 *
 * @param value - Size option / 大小配置
 * @returns Size in bytes, `undefined` when not configured or invalid / 字节数，未配置或非法时为 `undefined`
 */
function parseBodyLimit(value?: string | number): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : undefined
  }
  if (!value) {
    return undefined
  }
  const matched = SIZE_REGEX.exec(value.trim())
  if (!matched) {
    return undefined
  }
  return Math.floor(Number(matched[1]) * (SIZE_UNITS[(matched[2] ?? 'b').toLowerCase()] ?? 1))
}

/**
 * Resolve the buffering limit of the request body
 *
 * 解析请求体的缓冲上限
 *
 * 读取阶段就应用与解析阶段一致的限制，避免先把超大请求体完整拼进内存后
 * 才被 co-body / formidable 拒绝。无法确认解析方式的 content-type 不做限制，
 * 以免影响通过代理转发的大文件请求。
 *
 * @param contentType - Request content type / 请求的 content-type
 * @param bodyParserOptions - Body parser options / 请求体解析配置项
 * @param formidableOptions - Formidable options / Formidable 配置项
 * @returns Limit in bytes, `undefined` for no limit / 字节上限，`undefined` 表示不限制
 */
function resolveBodyLimit(
  contentType: string,
  bodyParserOptions: BodyParserOptions,
  formidableOptions: formidable.Options | undefined,
): number | undefined {
  const { limit, jsonLimit, formLimit, textLimit } = bodyParserOptions

  if (contentType.startsWith('application/json')) {
    return parseBodyLimit(jsonLimit ?? limit) ?? DEFAULT_BODY_LIMIT
  }
  if (contentType.startsWith('application/x-www-form-urlencoded')) {
    return parseBodyLimit(formLimit ?? limit) ?? DEFAULT_BODY_LIMIT
  }
  if (contentType.startsWith('text/plain')) {
    return parseBodyLimit(textLimit ?? limit) ?? DEFAULT_BODY_LIMIT
  }
  if (contentType.startsWith('multipart/form-data')) {
    return (
      parseBodyLimit(limit) ??
      parseBodyLimit(formidableOptions?.maxTotalFileSize) ??
      parseBodyLimit(formidableOptions?.maxFileSize) ??
      DEFAULT_MULTIPART_LIMIT
    )
  }
  return undefined
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

  const type = typeof contentType === 'string' ? contentType.toLowerCase() : ''
  const rawBody = await readRequestBody(
    req,
    resolveBodyLimit(type, bodyParserOptions, formidableOptions),
  )
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
 * Create an error when reading the request body fails
 *
 * 创建读取请求体失败时的错误
 *
 * `status` 会被 Vite / connect 的错误处理中间件用作响应状态码

 * @param status - HTTP status code / HTTP 状态码
 * @param message - Error message / 错误信息
 * @param code - Error code / 错误码
 * @returns The created error / 创建的错误
 */
function createRequestBodyError(
  status: number,
  message: string,
  code: string,
): Error & { status: number; code: string } {
  return Object.assign(new Error(message), { status, code })
}

/**
 * Check whether the error means the client aborted the request
 *
 * 判断错误是否表示客户端中断了请求
 *
 * @param error - Error to check / 需要判断的错误
 * @returns Whether the request is aborted / 请求是否被中断
 */
export function isRequestAbortedError(error: unknown): boolean {
  return (error as { code?: string } | undefined)?.code === 'ECONNABORTED'
}

/**
 * Read the request body with a size limit
 *
 * 读取请求体（带大小上限）
 *
 * 读取前先通过 `content-length` 快速拒绝超大请求；读取过程中累计已接收的字节数，
 * 超限立即停止读取并返回 413 错误，避免把超大请求体完整拼进内存。
 * 同时监听 `aborted` / `close`，客户端中途断开时立即 reject，避免异步链悬挂。
 *
 * @param req - Incoming message object / 入站消息对象
 * @param limit - Maximum body size in bytes, `undefined` for no limit / 请求体字节上限，`undefined` 表示不限制
 * @returns Raw request body / 原始请求体
 */
function readRequestBody(req: Connect.IncomingMessage, limit?: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const contentLength = Number(req.headers['content-length'])
    if (limit !== undefined && Number.isFinite(contentLength) && contentLength > limit) {
      reject(
        createRequestBodyError(
          413,
          `request entity too large: content-length ${contentLength} exceeds the limit ${limit}`,
          'ETOOLARGE',
        ),
      )
      return
    }

    const chunks: Buffer[] = []
    let received = 0
    let settled = false

    function cleanup(): void {
      req.removeListener('data', onData)
      req.removeListener('end', onEnd)
      req.removeListener('error', onError)
      req.removeListener('aborted', onAborted)
      req.removeListener('close', onClose)
    }

    function done(error?: Error, body?: Buffer): void {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      if (error) {
        // 停止消费剩余请求体，避免继续占用内存
        // Stop consuming the rest of the request to avoid further memory usage
        req.pause()
        reject(error)
        return
      }
      resolve(body!)
    }

    function onData(chunk: Buffer): void {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      received += buffer.byteLength
      if (limit !== undefined && received > limit) {
        done(
          createRequestBodyError(
            413,
            `request entity too large: received more than the limit ${limit}`,
            'ETOOLARGE',
          ),
        )
        return
      }
      chunks.push(buffer)
    }

    function onEnd(): void {
      done(undefined, chunks.length ? Buffer.concat(chunks) : Buffer.alloc(0))
    }

    function onError(error: Error): void {
      done(error)
    }

    function onAborted(): void {
      done(createRequestBodyError(400, 'request aborted by the client', 'ECONNABORTED'))
    }

    function onClose(): void {
      // `close` 在请求未正常结束时也会触发，`complete` 表示消息已完整接收
      // `close` is also emitted when the request does not end normally, while
      // `complete` indicates the message has been fully received
      if (!req.complete) {
        onAborted()
      }
    }

    req.on('data', onData)
    req.once('end', onEnd)
    req.once('error', onError)
    req.once('aborted', onAborted)
    req.once('close', onClose)
  })
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
    matcher = match(pattern, { decode: decodeURIComponent })
    matcherCache.set(pattern, matcher)
  }
  const matched = matcher(url)
  return matched ? matched.params : {}
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
