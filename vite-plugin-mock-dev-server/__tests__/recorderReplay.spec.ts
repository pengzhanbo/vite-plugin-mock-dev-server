/**
 * Test for the response replay
 *
 * 响应回放测试
 */
import type { IncomingMessage } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { RecordedRequest, ResolvedRecordOptions } from '../src/types/index.js'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getFilepath } from '../src/recorder/helper.js'
import { normalizeReplayHeaders, replayRecordedRequest } from '../src/recorder/replay.js'
import { writeRecordStorage } from '../src/recorder/storage.js'

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
 * Create a request object for replaying
 *
 * 创建用于回放的请求对象
 *
 * @param url - Request URL / 请求 URL
 * @returns Request object / 请求对象
 */
function createRequest(url: string): IncomingMessage {
  return { url, method: 'GET', headers: {} } as unknown as IncomingMessage
}

/**
 * Create a record written by an older version, which kept the headers of the
 * compressed body and marked the decompressed one as `identity`
 *
 * 构造一条旧版本写入的记录：保留了压缩响应体的 header，并把解压后的响应体
 * 标记为 `identity`
 *
 * @returns Recorded request / 录制记录
 */
function createLegacyRecord(): RecordedRequest {
  return {
    meta: {
      timestamp: Date.now(),
      filepath: '.recordings/api-users.json',
      createAt: '',
    },
    req: { method: 'GET', pathname: '/api/users', query: {}, body: undefined, bodyType: '' },
    res: {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'identity',
        'content-length': '28',
        'transfer-encoding': 'chunked',
        'x-request-id': 'abc',
      },
      body: '{"ok":true}',
    },
  }
}

describe('normalizeReplayHeaders', () => {
  it('should drop the body framing headers and the identity encoding', () => {
    const headers = normalizeReplayHeaders({
      'content-type': 'application/json',
      'content-encoding': 'identity',
      'content-length': '28',
      'transfer-encoding': 'chunked',
      'x-request-id': 'abc',
    })

    expect(headers).toEqual({
      'content-type': 'application/json',
      'x-request-id': 'abc',
    })
  })

  it('should match the header names case-insensitively', () => {
    const headers = normalizeReplayHeaders({
      'Content-Type': 'application/json',
      'Content-Encoding': 'Identity',
      'Content-Length': '28',
      'Transfer-Encoding': 'chunked',
    })

    expect(headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('should keep a real content encoding', () => {
    // 解压失败的录制仍然保存压缩响应体，encoding 必须保留
    // Records whose decompression failed still hold the compressed body
    const headers = normalizeReplayHeaders({
      'content-encoding': 'gzip',
      'content-length': '28',
    })

    expect(headers).toEqual({ 'content-encoding': 'gzip' })
  })
})

describe('replayRecordedRequest', () => {
  let cwd: string

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mock-replay-'))
  })

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true })
  })

  it('should normalize the headers of a legacy record', async () => {
    const record = createLegacyRecord()
    await writeRecordStorage(path.join(cwd, getFilepath(record.req.pathname, '.recordings')), [
      record,
    ])

    const mock = await replayRecordedRequest(
      createRequest('/api/users'),
      '/api/users',
      undefined,
      createOptions(cwd),
    )

    expect(mock).toBeDefined()
    expect(mock!.headers).toEqual({
      'content-type': 'application/json',
      'x-request-id': 'abc',
    })
    expect(mock!.body).toEqual(Buffer.from('{"ok":true}'))
  })

  it('should replay the body without hanging an http client', async () => {
    // 旧记录中的 content-length 指向压缩前的长度，直接下发会让客户端一直等待
    // 或触发协议解析失败；回放后由 Node 依据实际写出的字节计算长度
    // The stale `content-length` of a legacy record makes clients wait forever or
    // fail to parse the response; after the fix Node computes it from the written bytes
    const record = createLegacyRecord()
    await writeRecordStorage(path.join(cwd, getFilepath(record.req.pathname, '.recordings')), [
      record,
    ])
    const mock = await replayRecordedRequest(
      createRequest('/api/users'),
      '/api/users',
      undefined,
      createOptions(cwd),
    )

    const server = http.createServer((_req, res) => {
      res.writeHead(mock!.status!, mock!.headers as unknown as Record<string, string>)
      res.end(mock!.body)
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

    try {
      const { port } = server.address() as AddressInfo
      const response = await fetch(`http://127.0.0.1:${port}/api/users`, {
        signal: AbortSignal.timeout(3000),
      })

      expect(await response.text()).toBe('{"ok":true}')
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })
})
