import type { IncomingMessage } from 'node:http'
import type { RecordedReq, RecordedRequest, ResolvedRecordOptions } from '../types/index.js'
import type { ProxySetup } from '../utils/index.js'
import { Buffer } from 'node:buffer'
import fs, { promises as fsp } from 'node:fs'
import path from 'node:path'
import { debug, formatError } from '../utils/index.js'
import {
  createRecordMatcher,
  getFilepath,
  isSameRecord,
  processRecordReq,
  processRecordRes,
  timeFormatter,
} from './helper.js'
import { originalReqCache, readRecordStorage, writeRecordStorage } from './storage.js'

/**
 * 以记录文件绝对路径为键的待写入队列
 *
 * 录制是「读文件 → 修改 → 写文件」的过程。同一 pathname 的并发代理响应会读到
 * 相同的文件内容，后写入的结果会覆盖先前的记录，因此按文件串行化写入。
 */
const writeQueue: Map<string, Promise<void>> = new Map()

/**
 * 请求记录器
 */
export class Recorder {
  private options: ResolvedRecordOptions
  private filter: (req: RecordedReq) => boolean

  constructor(options: ResolvedRecordOptions) {
    this.options = options
    this.filter = createRecordMatcher(options.filter)
  }

  /**
   * Create the proxy setup that records requests from http-proxy.
   *
   * 创建从 http-proxy 记录请求的代理扩展。
   *
   * @returns Proxy setup callback / 代理扩展回调
   */
  createProxySetup(): ProxySetup {
    const recordRequest = this.record.bind(this)
    // 从 http-proxy 记录请求
    return (proxy) => {
      proxy.on('proxyRes', (proxyRes, req) => {
        // Capture response body
        const chunks: Buffer[] = []
        let settled = false

        /**
         * 停止收集响应体并释放已缓冲的分片
         *
         * 通过移除监听并清空数组，使分片在本函数返回后即可被回收；
         * `settled` 保证 `end` / `aborted` / `error` 中只有第一个生效。
         */
        function release(): void {
          settled = true
          proxyRes.removeListener('data', onData)
          proxyRes.removeListener('end', onEnd)
          proxyRes.removeListener('aborted', onAborted)
          proxyRes.removeListener('error', onError)
          chunks.length = 0
        }

        function onData(chunk: Buffer | string): void {
          if (settled) {
            return
          }
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        }

        function onEnd(): void {
          if (settled) {
            return
          }
          // 先取出完整的响应体，再释放缓冲区
          const body = Buffer.concat(chunks)
          release()
          void recordRequest(req, proxyRes, body).catch((error: unknown) => {
            debug('recorder: failed to record %s\n%s', req.url ?? '', formatError(error))
          })
        }

        function onAborted(): void {
          skip('the proxy response was aborted')
        }

        function onError(error: Error): void {
          skip(`the proxy response failed: ${error.message}`)
        }

        /**
         * 丢弃本次录制
         *
         * @param reason - Reason of the skip / 跳过原因
         */
        function skip(reason: string): void {
          if (settled) {
            return
          }
          release()
          // 响应不完整，原始请求的请求体不会再有消费者
          originalReqCache.delete(req)
          debug('recorder: skip %s, %s', req.url ?? '', reason)
        }

        proxyRes.on('data', onData)
        proxyRes.on('end', onEnd)
        proxyRes.on('aborted', onAborted)
        proxyRes.on('error', onError)
      })
    }
  }

  private async record(req: IncomingMessage, res: IncomingMessage, resBody: Buffer): Promise<void> {
    if (!originalReqCache.has(req)) {
      return
    }

    const { body, pathname, timestamp } = originalReqCache.get(req)!
    originalReqCache.delete(req)

    if (!pathname) {
      return
    }

    const recordReq = processRecordReq(req, pathname, body)

    if (!this.filter(recordReq)) {
      return
    }

    const { cwd, dir, status, expires, overwrite } = this.options
    // 过滤 status 配置项中未包含的状态码
    if (status.length !== 0 && !status.includes(res.statusCode ?? 200)) {
      return
    }

    const record: RecordedRequest = {
      meta: {
        timestamp,
        filepath: '',
        createAt: timeFormatter.format(timestamp),
        referer: req.headers.referer ?? 'unknown',
      },
      req: recordReq,
      res: await processRecordRes(res, resBody),
    }
    const filepath = getFilepath(pathname, dir)
    record.meta.filepath = filepath

    const absoluteFilepath = path.join(cwd, filepath)

    await this.updateRecords(absoluteFilepath, (records) => {
      const valid = records.filter((item) => timestamp - item.meta.timestamp <= expires)

      const index = valid.findIndex(
        (item) => isSameRecord(item.req, record.req) && item.res.status === record.res.status,
      )

      if (index === -1) {
        valid.push(record)
      }
      // 覆盖旧记录或过期时间超过配置项时，更新记录
      else if (overwrite || timestamp - valid[index].meta.timestamp > expires) {
        valid[index] = record
      }

      return valid
    })
  }

  /**
   * 以文件为单位串行化地读取、更新并写入记录文件
   *
   * @param filepath - Absolute path of the record file / 记录文件的绝对路径
   * @param update - Update function returning the records to write / 返回待写入数据的更新函数
   */
  private async updateRecords(
    filepath: string,
    update: (records: RecordedRequest[]) => RecordedRequest[],
  ): Promise<void> {
    const previous = writeQueue.get(filepath) ?? Promise.resolve()

    const task = previous
      // 前一次写入失败不应阻断后续写入
      // A failed write must not block the following ones
      .catch(() => undefined)
      .then(async () => {
        const records = update(await readRecordStorage(filepath))
        return writeRecordStorage(filepath, records)
      })

    writeQueue.set(filepath, task)

    try {
      await task
    } finally {
      // 队列为空时及时清理，避免映射随录制文件数量无限增长
      if (writeQueue.get(filepath) === task) {
        writeQueue.delete(filepath)
      }
    }
  }

  /**
   * Add `.gitignore` file in the recording directory.
   *
   * 在录制目录中添加 `.gitignore` 文件。
   */
  async addGitignore(): Promise<void> {
    const options = this.options

    if (!options.gitignore) {
      return
    }

    const dirname = path.join(options.cwd, options.dir)
    await fsp.mkdir(dirname, { recursive: true })
    if (!fs.existsSync(path.join(dirname, '.gitignore'))) {
      await fsp.writeFile(path.join(dirname, '.gitignore'), '*\n', 'utf-8')
    }
  }
}
