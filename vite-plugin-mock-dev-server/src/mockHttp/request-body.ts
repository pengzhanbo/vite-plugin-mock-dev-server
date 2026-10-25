/**
 * Request body parsing by content type
 *
 * 按 content-type 解析请求体
 *
 * The raw body is read first (see `request-body-limit`), then replayed through a
 * `PassThrough` stream so it can be parsed once and cached for the proxy and the
 * recorder at the same time.
 *
 * 先读取原始请求体（见 `request-body-limit`），再通过 `PassThrough` 流重新提供，
 * 使请求体只被解析一次，同时可供代理与录制功能复用。
 */

import type { Buffer } from 'node:buffer'
import type { Connect } from 'vite'
import type { Logger } from '../core/index.js'
import type { BodyParserOptions } from '../types/index.js'
import { PassThrough } from 'node:stream'
import bodyParser from 'co-body'
import formidable from 'formidable'
import {
  getContentLength,
  readRequestBody,
  RequestBodyError,
  resolveBodyLimit,
} from './request-body-limit.js'

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

/**
 * Parsed request body together with the raw buffer
 *
 * 解析后的请求体与原始缓冲区
 */
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
 * Replay the raw body through a readable stream
 *
 * 通过可读流重新提供原始请求体
 *
 * @param req - Incoming message / 入站消息
 * @param rawBody - Raw request body / 原始请求体
 * @returns Stream carrying the request metadata and body / 携带请求元信息与请求体的流
 */
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
