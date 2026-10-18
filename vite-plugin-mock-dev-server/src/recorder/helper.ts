import type { IncomingMessage } from 'node:http'
import type { RecordedReq, RecordedRes, ResolvedRecordOptions } from '../types/index.js'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import path from 'node:path'
import {
  deepEqual,
  hasOwn,
  isFunction,
  isPlainObject,
  kebabCase,
  objectKeys,
  toArray,
} from '@pengzhanbo/utils'
import { createMatcher, isPathMatch, isTextContent, urlParse } from '../utils/index.js'
import { FILTERED_RESPONSE_HEADERS } from './constants.js'
import { decompressBody } from './decompress.js'

export const timeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
})

/**
 * 处理记录的请求
 *
 * @param req 原始请求对象
 * @param pathname 请求路径
 * @param body 请求体
 * @returns 处理后的请求记录
 */
export function processRecordReq(
  req: IncomingMessage,
  pathname: string,
  body: unknown,
): RecordedReq {
  const { query } = urlParse(req.url!)
  const method = req.method!.toUpperCase()
  let bodyType = (req.headers['content-type'] ?? '').split(';')[0].trim()
  // 过滤 multipart/form-data 中的文件字段
  if (bodyType.startsWith('multipart/form-data') && isPlainObject(body)) {
    body = { ...body }
    objectKeys(body as Record<string, unknown>).forEach((key) => {
      const value = (body as Record<string, unknown>)[key]
      // 过滤 multipart/form-data 中的文件字段
      if (isPlainObject(value) && hasOwn(value, 'filepath') && hasOwn(value, 'mimetype')) {
        delete (body as Record<string, unknown>)[key]
      }
    })
  }

  if (Buffer.isBuffer(body)) {
    body = body.toString()
    bodyType = 'buffer'
  }

  return { method, pathname, query, bodyType, body }
}

/**
 * 处理记录的响应
 *
 * @param res 原始响应对象
 * @param body 响应体
 * @returns 处理后的响应记录
 */
export async function processRecordRes(res: IncomingMessage, body: Buffer): Promise<RecordedRes> {
  const status = res.statusCode ?? 200
  const statusText = res.statusMessage ?? 'OK'
  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(res.headers)) {
    const lowerKey = key.toLowerCase()
    if (value !== undefined && !FILTERED_RESPONSE_HEADERS.includes(lowerKey)) {
      headers[key] = String(value)
    }
  }
  const isText = isTextContent(headers['content-type'] || '')
  const contentEncoding = headers['content-encoding']
  if (isText && contentEncoding) {
    const { body: decodedBody, encoding } = await decompressBody(body, contentEncoding)
    // 解压成功时 `encoding` 为 `identity`：响应体已是明文，必须移除 `content-encoding`
    // （不能写成 `identity`），否则客户端会按错误的编码解析响应体。
    // 解压失败时响应体保持压缩状态，保留原始 `content-encoding`。
    if (encoding === 'identity') {
      body = Buffer.from(decodedBody)
      delete headers['content-encoding']
    }
  }
  return { status, statusText, headers, body: body.toString(isText ? 'utf-8' : 'base64') }
}

/**
 * 判断两个请求是否是同一个请求
 *
 * @param prev 上一个请求
 * @param current 当前请求
 * @returns 是否是同一个请求
 */
export function isSameRecord(prev: RecordedReq, current: RecordedReq): boolean {
  // 路径名或方法不同，认为不是同一个请求
  if (prev.pathname !== current.pathname || prev.method !== current.method) {
    return false
  }

  // 请求体类型不同， 或者请求体类型为 buffer，认为不是同一个请求
  if (prev.bodyType !== current.bodyType) {
    return false
  }

  // 查询参数不同，认为不是同一个请求
  if (!deepEqual(prev.query, current.query)) {
    return false
  }

  if (current.bodyType === 'buffer' && prev.bodyType === 'buffer') {
    const currentBody = Buffer.from(current.body as string)
    const prevBody = Buffer.from(prev.body as string)
    if (currentBody.length !== prevBody.length || !currentBody.equals(prevBody)) {
      return false
    }
  }

  // 请求体不同，认为不是同一个请求
  if (!deepEqual(prev.body, current.body)) {
    return false
  }

  return true
}

/**
 * 创建请求记录过滤器
 *
 * `filter.include` 缺省时视为「包含所有请求」，仅由 `filter.exclude` 排除。
 *
 * @param filter 记录过滤选项
 * @returns 请求匹配函数
 */
export function createRecordMatcher(
  filter: ResolvedRecordOptions['filter'],
): (req: RecordedReq) => boolean {
  if (isFunction(filter)) {
    return filter
  }

  const { mode = 'glob' } = filter
  const include = toArray(filter.include)
  const exclude = toArray(filter.exclude)

  // include 缺省（或只写了否定模式）时，默认包含所有请求，仅保留 exclude 的排除语义。
  // 否则 `picomatch([])` / `[].some()` 会拒绝一切路径，导致「配了 filter 就再也录不到数据且毫无提示」。
  const hasInclude = include.some((item) => item[0] !== '!')

  if (mode === 'glob') {
    const { isMatch } = createMatcher(hasInclude ? include : ['**', ...include], exclude)
    return (req) => isMatch(req.pathname)
  }

  const matchesInclude =
    include.length === 0
      ? () => true
      : (pathname: string) => include.some((pattern) => isPathMatch(pattern, pathname))

  return (req) =>
    matchesInclude(req.pathname) && exclude.every((pattern) => !isPathMatch(pattern, req.pathname))
}

/**
 * 生成记录文件路径
 *
 * `kebabCase` 会在不同的 pathname 之间产生碰撞（如 `/api/userProfile` 与
 * `/api/user/profile`），并且根路径 `/` 会被转换为空字符串（生成隐藏文件 `.json`）。
 * 因此在文件名后追加 pathname 的短哈希，根路径单独映射为 `root.json`。
 *
 * @param pathname 请求路径
 * @param dir 记录目录
 * @returns 记录文件路径
 */
export function getFilepath(pathname: string, dir: string): string {
  const name = kebabCase(pathname)
  // 根路径等无法生成文件名的路径，使用固定的 `root.json`
  if (!name) {
    return path.join(dir, 'root.json')
  }
  const hash = createHash('sha1').update(pathname).digest('hex').slice(0, 8)
  return path.join(dir, `${name}-${hash}.json`)
}
