import type { IncomingMessage } from 'node:http'
import type { RecordedReq, RecordedRequest, ResolvedRecordOptions } from '../types/index.js'
import type { ProxySetup } from '../utils/index.js'
import { Buffer } from 'node:buffer'
import fs, { promises as fsp } from 'node:fs'
import path from 'node:path'
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
        let chunks: Buffer[] | null = []
        proxyRes.on('data', (chunk) => chunk && chunks!.push(chunk))
        proxyRes.on('end', async () => {
          await recordRequest(req, proxyRes, Buffer.concat(chunks!))
          chunks = null
        })
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
    const records = (await readRecordStorage(absoluteFilepath)).filter(
      (item) => timestamp - item.meta.timestamp <= expires,
    )

    const index = records.findIndex(
      (item) => isSameRecord(item.req, record.req) && item.res.status === record.res.status,
    )

    if (index === -1) {
      records.push(record)
    }
    // 覆盖旧记录或过期时间超过配置项时，更新记录
    else if (overwrite || timestamp - records[index].meta.timestamp > expires) {
      records[index] = record
    }

    await writeRecordStorage(absoluteFilepath, records)
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
