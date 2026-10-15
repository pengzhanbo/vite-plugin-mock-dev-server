import type http from 'node:http'
import type { RecordedRequest } from '../types/index.js'
import fs from 'node:fs'
import path from 'node:path'
import { LRUCache } from '@pengzhanbo/utils'

interface RecordStorageEntry {
  /** 记录数据 / recorded data */
  records: RecordedRequest[]
  /** 文件修改时间，用于判断缓存是否过期 / file mtime, used to detect stale cache */
  mtimeMs: number
  /** 文件大小，用于判断缓存是否过期 / file size, used to detect stale cache */
  size: number
}

// 缓存已记录的请求，使用 LRU 限制缓存上限，并记录文件信息以感知文件变更
// Cache the recorded requests, `LRUCache` bounds the cache size, and the file
// information is recorded so that external changes can be detected
const storage = new LRUCache<string, RecordStorageEntry>({ maxSize: 1024 })

/**
 * 读取记录文件
 *
 * 缓存命中时会比较文件的修改时间与大小，文件被外部修改或删除后会自动重新读取
 *
 * @param filepath 记录文件路径
 * @returns 记录的请求数组
 */
export async function readRecordStorage(filepath: string): Promise<RecordedRequest[]> {
  try {
    const stats = await fs.promises.stat(filepath)
    const cached = storage.get(filepath)
    if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
      return cached.records
    }

    const content = (await fs.promises.readFile(filepath, 'utf-8')) || '[]'
    const records = JSON.parse(content) as RecordedRequest[]
    storage.set(filepath, { records, mtimeMs: stats.mtimeMs, size: stats.size })
    return records
  } catch (error) {
    // 记录文件不存在时无需报错 / a missing record file is not an error
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.error(`Error reading record file ${filepath}:`, error)
    }
    // 文件被删除时同步清理缓存，避免残留过期数据
    // Clear the cache when the file is deleted to avoid stale data
    storage.delete(filepath)
    return []
  }
}

/**
 * 写入记录文件
 *
 * @param filepath 记录文件路径
 * @param records 记录的请求数组
 */
export async function writeRecordStorage(
  filepath: string,
  records: RecordedRequest[],
): Promise<void> {
  try {
    storage.delete(filepath)
    await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
    await fs.promises.writeFile(filepath, JSON.stringify(records, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing record file ${filepath}:`, error)
  }
}

// 缓存请求中的数据
export const originalReqCache: WeakMap<
  http.IncomingMessage,
  { body: unknown; pathname: string; timestamp: number }
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
export function recordRequestWithRawReq(
  req: http.IncomingMessage,
  pathname: string,
  body: unknown,
): void {
  originalReqCache.set(req, { body, pathname, timestamp: Date.now() })
}
