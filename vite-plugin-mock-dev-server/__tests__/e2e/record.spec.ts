/**
 * End-to-end tests for the record / replay pipeline.
 *
 * 录制 / 回放的端到端测试。
 *
 * A real upstream server and a real Vite dev server are used, so the specs cover
 * the proxy hooks of the recorder, the storage of the recordings and the replay
 * of a compressed response after the upstream service is gone.
 *
 * 用例使用真实的上游服务与 Vite 开发服务器，覆盖录制器的代理钩子、录制数据存储，
 * 以及上游服务不可用后对压缩响应的回放。
 */
import type { AddressInfo } from 'node:net'
import type { E2EProject, RunningServer } from './helpers.js'
import { readdir, readFile } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createProject, startMockServer, waitFor } from './helpers.js'

/**
 * The JSON payload returned by the upstream service
 *
 * 上游服务返回的 JSON 数据
 */
const PAYLOAD = JSON.stringify({ ok: true, from: 'upstream' })

/**
 * The binary payload returned by the upstream service
 *
 * 上游服务返回的二进制数据
 */
const BINARY = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0x10])

describe('e2e: record and replay', () => {
  let project: E2EProject
  let server: RunningServer
  let upstream: http.Server
  let recordFile: string
  let binaryRecordFile: string

  beforeAll(async () => {
    // 上游服务模拟真实后端：启用 gzip，响应体中包含 content-length
    // The upstream simulates a real backend: it compresses the body and keeps
    // the compressed `content-length`
    upstream = http.createServer((req, res) => {
      if (req.url?.startsWith('/api/binary')) {
        res.writeHead(200, {
          'content-type': 'application/octet-stream',
          'content-length': String(BINARY.length),
        })
        res.end(BINARY)
        return
      }

      const body = gzipSync(Buffer.from(PAYLOAD))
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'content-encoding': 'gzip',
        'content-length': String(body.length),
        'x-upstream': req.url === '/api/data?x=1' ? 'matched' : 'other',
      })
      res.end(body)
    })
    await new Promise<void>((resolve) => upstream.listen(0, '127.0.0.1', resolve))
    const { port } = upstream.address() as AddressInfo

    project = await createProject({ 'mock/keep.txt': '' })
    server = await startMockServer({
      root: project.root,
      pluginOptions: { cwd: project.root, dir: 'mock', record: true },
      serverOptions: {
        proxy: {
          '/api': {
            target: `http://127.0.0.1:${port}`,
            changeOrigin: true,
          },
        },
      },
    })

    // 首次请求：mock 未命中，请求被透传给上游并录制
    // First request: no mock matched, the request is proxied upstream and recorded
    const response = await waitFor(async () => {
      const res = await server.request('/api/data?x=1')
      return res.status === 200 ? res : false
    }, 'the proxied request did not succeed')
    expect(await response.json()).toEqual(JSON.parse(PAYLOAD))

    // 二进制响应：以 base64 存储，回放时需要还原为原始字节
    // Binary response: stored as base64 and restored to the original bytes on replay
    const binaryResponse = await waitFor(async () => {
      const res = await server.request('/api/binary')
      return res.status === 200 ? res : false
    }, 'the proxied binary request did not succeed')
    expect(Buffer.from(await binaryResponse.arrayBuffer()).equals(BINARY)).toBe(true)

    const recordDir = path.join(project.root, 'mock', '.recordings')
    const findRecord = (prefix: string): Promise<string> =>
      waitFor(async () => {
        const files = await readdir(recordDir).catch(() => [])
        const file = files.find((item) => item.startsWith(prefix) && item.endsWith('.json'))
        return file ? path.join(recordDir, file) : false
      }, `the ${prefix} request was not recorded`)

    ;[recordFile, binaryRecordFile] = await Promise.all([
      findRecord('api-data-'),
      findRecord('api-binary-'),
    ])

    // 关闭上游：之后的请求只能由回放响应
    // Stop the upstream: later requests can only be answered by replay
    await new Promise<void>((resolve) => upstream.close(() => resolve()))
  })

  afterAll(async () => {
    await server?.close()
    await new Promise<void>((resolve) => upstream?.close(() => resolve()))
    await project?.cleanup()
  })

  it('should record the decompressed body without the framing headers', async () => {
    const records = JSON.parse(await readFile(recordFile, 'utf-8')) as {
      res: { headers: Record<string, string>; body: string; status: number }
    }[]
    const record = records[0]

    expect(record.res.status).toBe(200)
    expect(record.res.body).toBe(PAYLOAD)
    // 解压后的响应体与压缩时的长度不一致，这些 header 不能再下发给客户端
    // The decompressed body does not match the compressed length, so these
    // headers must not be sent to the client anymore
    expect(record.res.headers).not.toHaveProperty('content-length')
    expect(record.res.headers).not.toHaveProperty('transfer-encoding')
    expect(record.res.headers).not.toHaveProperty('content-encoding')
    expect(record.res.headers['content-type']).toContain('application/json')
  })

  it('should write a .gitignore for the recordings directory', async () => {
    const gitignore = await readFile(
      path.join(project.root, 'mock', '.recordings', '.gitignore'),
      'utf-8',
    )

    expect(gitignore).toContain('*')
  })

  it('should replay the recording after the upstream is gone', async () => {
    // 上游已关闭：若回放未生效，该请求会因代理失败而返回错误状态或挂起
    // The upstream is gone: without replay the request either fails or hangs
    const response = await waitFor(async () => {
      const res = await server.request('/api/data?x=1', {
        signal: AbortSignal.timeout(3000),
      })
      return res.status === 200 ? res : false
    }, 'the recorded request was not replayed')

    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('content-encoding')).toBeNull()
    expect(await response.text()).toBe(PAYLOAD)
  })

  it('should record a binary response as base64', async () => {
    const records = JSON.parse(await readFile(binaryRecordFile, 'utf-8')) as {
      res: { headers: Record<string, string>; body: string }
    }[]
    const record = records[0]

    // 非文本响应不能按 utf-8 解码，否则回放出的字节会损坏
    // A binary response must not be decoded as utf-8, otherwise the replayed
    // bytes are corrupted
    expect(record.res.headers['content-type']).toContain('application/octet-stream')
    expect(Buffer.from(record.res.body, 'base64').equals(BINARY)).toBe(true)
  })

  it('should replay a binary response after the upstream is gone', async () => {
    const response = await waitFor(async () => {
      const res = await server.request('/api/binary', {
        signal: AbortSignal.timeout(3000),
      })
      return res.status === 200 ? res : false
    }, 'the recorded binary response was not replayed')

    expect(Buffer.from(await response.arrayBuffer()).equals(BINARY)).toBe(true)
  })

  it('should not replay a recording for a different query string', async () => {
    // 录制按「方法 + pathname + query + body」区分，不同的 query 不应命中
    // Recordings are keyed by method + pathname + query + body
    const response = await server
      .request('/api/data?x=2', {
        signal: AbortSignal.timeout(3000),
      })
      .catch(() => undefined)

    // 未命中回放时请求会被转发到已关闭的上游，Vite 可能返回错误状态或直接断开连接，
    // 但客户端必须能结束等待，而不是像旧版本回放压缩响应那样挂起
    // Without a replay hit the request is proxied to the closed upstream; Vite may
    // fail it or drop the connection, but the client must not hang forever
    expect(response === undefined || response.status !== 200).toBe(true)
  })
})
