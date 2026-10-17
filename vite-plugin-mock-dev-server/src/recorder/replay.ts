import type { IncomingMessage } from 'node:http'
import type { MockHttpItem, RecordedRequest, ResolvedRecordOptions } from '../types/index.js'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { isTextContent } from '../utils/index.js'
import { BODY_FRAMING_HEADERS } from './constants.js'
import { getFilepath, isSameRecord, processRecordReq } from './helper.js'
import { readRecordStorage } from './storage.js'

/**
 * 回放前归一化录制响应的响应头。
 *
 * 需要处理的场景：
 * - 旧版本录制的响应可能保留了（解压前的）`content-length` / `transfer-encoding`，
 *   而回放写出的是解压后的响应体，长度不一致会导致客户端挂起或解析失败；
 * - 旧版本会在 `content-encoding` 写入 `identity`，它等价于「未压缩」，不应再下发。
 *
 * 响应体长度交由 Node 在 `res.end(buffer)` 时依据实际写出的字节计算。
 *
 * @param headers Recorded response headers / 录制响应的响应头
 * @returns Normalized headers / 归一化后的响应头
 */
export function normalizeReplayHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase()
    if (BODY_FRAMING_HEADERS.includes(lowerKey)) {
      continue
    }
    if (lowerKey === 'content-encoding' && value.trim().toLowerCase() === 'identity') {
      continue
    }
    normalized[key] = value
  }
  return normalized
}

/**
 * Replay a recorded request.
 *
 * 重放已记录的请求
 *
 * @param rawReq The original request object / 原始请求对象
 * @param pathname The request pathname / 请求路径名
 * @param body The request body / 请求体
 * @param options Record options / 录制配置项
 * @returns The recorded request object if found, otherwise undefined / 如果找到记录的请求对象，则返回该对象，否则返回 undefined
 */
export async function replayRecordedRequest(
  rawReq: IncomingMessage,
  pathname: string,
  body: unknown,
  options: ResolvedRecordOptions,
): Promise<MockHttpItem | undefined> {
  const req = processRecordReq(rawReq, pathname, body)
  const filepath = path.join(options.cwd, getFilepath(req.pathname, options.dir))
  const timestamp = Date.now()

  const records = await readRecordStorage(filepath)
  const matchedList = records.filter(
    (item) => timestamp - item.meta.timestamp < options.expires && isSameRecord(item.req, req),
  )
  let matched: RecordedRequest | undefined
  // 如果未设置 status，优先使用 200 状态码，否则返回第一个记录
  if (options.status.length === 0) {
    matched = matchedList.find((item) => item.res.status === 200) ?? matchedList[0]
  }
  // 返回第一个匹配的状态码记录
  else {
    matched = matchedList.find((item) => options.status.includes(item.res.status))
  }

  if (matched) {
    const isText = isTextContent(matched.res.headers['content-type'] || '')
    return {
      url: matched.req.pathname,
      status: matched.res.status,
      statusText: matched.res.statusText,
      headers: normalizeReplayHeaders(matched.res.headers),
      body: Buffer.from(matched.res.body, isText ? 'utf-8' : 'base64'),
      type: 'buffer',
      __filepath__: matched.meta.filepath,
    } as MockHttpItem
  }
}
