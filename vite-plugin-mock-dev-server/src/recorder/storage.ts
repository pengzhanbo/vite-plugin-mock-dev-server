import type { Stats } from 'node:fs'
import type http from 'node:http'
import type { Logger } from '../core/logger.js'
import type { RecordedRequest } from '../types/index.js'
import fs from 'node:fs'
import path from 'node:path'
import { LRUCache } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { formatError } from '../utils/index.js'

interface RecordStorageEntry {
  /** 记录数据 / recorded data */
  records: RecordedRequest[]
  /** 文件身份签名，用于判断缓存是否过期 / file signature, used to detect stale cache */
  signature: string
}

// 缓存已记录的请求，使用 LRU 限制缓存上限，并记录文件身份信息以感知文件变更
// Cache the recorded requests, `LRUCache` bounds the cache size, and the file identity
// is recorded so that external changes can be detected
const storage = new LRUCache<string, RecordStorageEntry>({ maxSize: 1024 })

/**
 * 生成文件身份签名
 *
 * 仅比较 `mtime` 与文件大小并不充分：文件被替换（重新创建）时若内容大小相同、
 * 修改时间又被保留（如 `cp -p`、`git checkout`、解压覆盖等场景），缓存会命中旧数据。
 * 因此同时比较 `dev` + `ino`（文件身份标识）与 `ctime`（元数据变更时间），
 * 只要文件被替换或元数据被改动，签名就会变化。
 *
 * Build the file identity signature.
 *
 * Comparing only `mtime` and the file size is not enough: when a file is replaced
 * (recreated) with the same content size and its modification time is preserved
 * (e.g. `cp -p`, `git checkout`, extracting an archive over it), the stale cache
 * would be hit. So `dev` + `ino` (file identity) and `ctime` (metadata change time)
 * are compared as well, making the signature change whenever the file is replaced
 * or its metadata is modified.
 *
 * @param stats 文件状态 / file stats
 * @returns 文件身份签名 / file identity signature
 */
function getFileSignature(stats: Stats): string {
  return [stats.dev, stats.ino, stats.ctimeMs, stats.mtimeMs, stats.size].join(':')
}

/**
 * 读取记录文件
 *
 * 缓存命中时会比较文件身份签名，文件被外部修改、替换或删除后会自动重新读取
 *
 * @param filepath 记录文件路径
 * @param logger 日志实例 / logger instance
 * @returns 记录的请求数组
 */
export async function readRecordStorage(
  filepath: string,
  logger?: Logger,
): Promise<RecordedRequest[]> {
  try {
    const stats = await fs.promises.stat(filepath)
    const signature = getFileSignature(stats)
    const cached = storage.get(filepath)
    if (cached && cached.signature === signature) {
      return cached.records
    }

    const content = (await fs.promises.readFile(filepath, 'utf-8')) || '[]'
    const records = JSON.parse(content) as RecordedRequest[]
    storage.set(filepath, { records, signature })
    return records
  } catch (error) {
    // 记录文件不存在时无需报错 / a missing record file is not an error
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      logger?.error(
        `Failed to read the record file ${ansis.underline(filepath)}\n  ${formatError(error)}`,
      )
    }
    storage.delete(filepath)
    return []
  }
}

/**
 * 写入记录文件
 *
 * @param filepath 记录文件路径
 * @param records 记录的请求数组
 * @param logger 日志实例 / logger instance
 */
export async function writeRecordStorage(
  filepath: string,
  records: RecordedRequest[],
  logger?: Logger,
): Promise<void> {
  try {
    storage.delete(filepath)
    await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
    await fs.promises.writeFile(filepath, JSON.stringify(records, null, 2), 'utf-8')
  } catch (error) {
    logger?.error(
      `Failed to write the record file ${ansis.underline(filepath)}\n  ${formatError(error)}`,
    )
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
