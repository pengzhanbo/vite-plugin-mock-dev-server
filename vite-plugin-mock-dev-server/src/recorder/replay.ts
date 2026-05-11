import type { IncomingMessage } from 'node:http'
import type { MockHttpItem, RecordedRequest, ResolvedRecordOptions } from '../types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { isTextContent } from '../utils'
import { getFilepath, isSameRecord, processRecordReq } from './helper'
import { readRecordStorage } from './storage'

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
  const matchedList = records
    .filter(item => timestamp - item.meta.timestamp < options.expires && isSameRecord(item.req, req))
  let matched: RecordedRequest | undefined
  // 如果未设置 status，优先使用 200 状态码，否则返回第一个记录
  if (options.status.length === 0) {
    matched = matchedList.find(item => item.res.status === 200) || matchedList[0]
  }
  // 返回第一个匹配的状态码记录
  else {
    matched = matchedList.find(item => options.status.includes(item.res.status))
  }

  if (matched) {
    const isText = isTextContent(matched.res.headers['content-type'] || '')
    return {
      url: matched.req.pathname,
      status: matched.res.status,
      statusText: matched.res.statusText,
      headers: matched.res.headers,
      body: Buffer.from(matched.res.body, isText ? 'utf-8' : 'base64'),
      type: 'buffer',
      __filepath__: matched.meta.filepath,
    } as MockHttpItem
  }
}
