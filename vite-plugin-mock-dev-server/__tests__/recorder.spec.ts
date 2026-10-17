/**
 * Test for the request recorder
 *
 * 请求记录器测试
 */
import type { IncomingMessage } from 'node:http'
import type { RecordedRequest, ResolvedRecordOptions } from '../src/types/index.js'
import { Buffer } from 'node:buffer'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Recorder } from '../src/recorder/Recorder.js'
import { readRecordStorage, recordRequestWithRawReq } from '../src/recorder/storage.js'

/**
 * Create resolved record options for testing
 *
 * 创建用于测试的录制配置
 *
 * @param cwd - Working directory / 工作目录
 * @returns Resolved record options / 解析后的录制配置
 */
function createOptions(cwd: string): ResolvedRecordOptions {
  return {
    enabled: true,
    cwd,
    dir: '.recordings',
    overwrite: true,
    status: [],
    expires: Number.MAX_SAFE_INTEGER,
    gitignore: false,
    filter: () => true,
  }
}

/**
 * Create a request object that can be recorded
 *
 * 创建可被记录的请求对象
 *
 * @param url - Request URL / 请求 URL
 * @returns Request object / 请求对象
 */
function createRequest(url: string): IncomingMessage {
  return { url, method: 'GET', headers: {} } as unknown as IncomingMessage
}

/**
 * Emit a complete proxy response for a request
 *
 * 为请求发送一次完整的代理响应
 *
 * @param proxy - Proxy instance / 代理实例
 * @param req - Recorded request / 已登记的请求
 * @param body - Response body / 响应体
 */
function emitProxyResponse(proxy: EventEmitter, req: IncomingMessage, body = 'ok'): void {
  const proxyRes = new EventEmitter() as any
  proxyRes.headers = { 'content-type': 'text/plain' }
  proxyRes.statusCode = 200
  proxyRes.statusMessage = 'OK'

  proxy.emit('proxyRes', proxyRes, req)
  proxyRes.emit('data', Buffer.from(body))
  proxyRes.emit('end')
}

/**
 * Wait until the records of the file satisfy the predicate
 *
 * 等待记录文件中的数据满足条件
 *
 * @param filepath - Record file path / 记录文件路径
 * @param predicate - Condition to wait for / 等待满足的条件
 * @param timeout - Maximum waiting time in milliseconds / 最长等待时间（毫秒）
 * @returns The records that satisfy the predicate, or the last read result / 满足条件的记录或最后一次读取的结果
 */
async function waitForRecords(
  filepath: string,
  predicate: (records: RecordedRequest[]) => boolean,
  timeout = 2000,
): Promise<RecordedRequest[]> {
  const end = Date.now() + timeout
  let records = await readRecordStorage(filepath)

  while (!predicate(records) && Date.now() < end) {
    await new Promise((resolve) => setTimeout(resolve, 10))
    records = await readRecordStorage(filepath)
  }

  return records
}

/**
 * Test suite for the request recorder
 *
 * 请求记录器测试套件
 */
describe('recorder', () => {
  let cwd: string
  let recorder: Recorder
  let proxy: EventEmitter
  let filepath: string

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mock-recorder-'))
    recorder = new Recorder(createOptions(cwd))
    proxy = new EventEmitter()
    recorder.createProxySetup()(proxy as any, {})
    filepath = path.join(cwd, '.recordings', 'api-users.json')
  })

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true })
  })

  it('should keep the records of concurrent responses to the same pathname', async () => {
    // 同一 pathname、不同 query 的两个并发响应最终写入同一个记录文件，
    // 未串行化时后写入的结果会覆盖先写入的记录
    // Two concurrent responses of the same pathname (different query) are written
    // into the same file; without serialization the later write would drop the
    // record of the earlier one
    for (const query of ['?id=1', '?id=2']) {
      const req = createRequest(`/api/users${query}`)
      recordRequestWithRawReq(req, '/api/users', undefined)
      emitProxyResponse(proxy, req, query)
    }

    const records = await waitForRecords(filepath, (items) => items.length === 2)

    expect(records).toHaveLength(2)
    expect(records.map((item) => String(item.req.query.id)).sort()).toEqual(['1', '2'])
  })

  it('should overwrite the record of the same request', async () => {
    const first = createRequest('/api/users?id=1')
    recordRequestWithRawReq(first, '/api/users', undefined)
    emitProxyResponse(proxy, first, 'first')

    // 等待第一次写入完成后再录制同一个请求，避免两条记录同时进入队列
    // Wait for the first write to finish before recording the same request again
    await waitForRecords(filepath, (items) => items[0]?.res.body === 'first')

    const second = createRequest('/api/users?id=1')
    recordRequestWithRawReq(second, '/api/users', undefined)
    emitProxyResponse(proxy, second, 'second')

    const records = await waitForRecords(
      filepath,
      (items) => items.length === 1 && items[0]?.res.body === 'second',
    )

    expect(records).toHaveLength(1)
    expect(records[0].res.body).toBe('second')
  })
})
