import type http from 'node:http'
import type { RecordedRequest } from '../types'
import fs from 'node:fs'
import path from 'node:path'

// 缓存已记录的请求
const storage = new Map<string, RecordedRequest[]>()

/**
 * 读取记录文件
 *
 * @param filepath 记录文件路径
 * @returns 记录的请求数组
 */
export async function readRecordStorage(filepath: string): Promise<RecordedRequest[]> {
  if (storage.has(filepath))
    return storage.get(filepath)!

  try {
    if (!fs.existsSync(filepath))
      return []
    const content = await fs.promises.readFile(filepath, 'utf-8') || '[]'
    const data = JSON.parse(content) as RecordedRequest[]
    storage.set(filepath, data)
    return data
  }
  catch (error) {
    console.error(`Error reading record file ${filepath}:`, error)
    return []
  }
}

/**
 * 写入记录文件
 *
 * @param filepath 记录文件路径
 * @param records 记录的请求数组
 */
export async function writeRecordStorage(filepath: string, records: RecordedRequest[]): Promise<void> {
  try {
    storage.set(filepath, records)
    await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
    await fs.promises.writeFile(filepath, JSON.stringify(records, null, 2), 'utf-8')
  }
  catch (error) {
    console.error(`Error writing record file ${filepath}:`, error)
  }
}

// 缓存请求中的数据
export const originalReqCache: WeakMap<
  http.IncomingMessage,
  { body: unknown, pathname: string, timestamp: number }
> = new WeakMap()

/**
 * Record a request with the raw request object.
 *
 * 记录原始请求对象的请求
 *
 * @param req The original request object / 原始请求对象
 * @param pathname The request pathname / 请求路径名
 * @param body The request body / 请求体
 */
export function recordRequestWithRawReq(req: http.IncomingMessage, pathname: string, body: unknown): void {
  originalReqCache.set(req, { body, pathname, timestamp: Date.now() })
}
