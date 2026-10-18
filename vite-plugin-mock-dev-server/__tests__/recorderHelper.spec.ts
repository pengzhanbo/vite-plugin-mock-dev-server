/**
 * Test for the recorder helpers
 *
 * 录制辅助函数测试
 */
import type { IncomingMessage } from 'node:http'
import type { RecordedReq } from '../src/types/index.js'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { createRecordMatcher, getFilepath, processRecordRes } from '../src/recorder/helper.js'

/**
 * Create a recorded request
 *
 * 构造一条请求记录
 *
 * @param pathname - Request pathname / 请求路径
 * @returns Recorded request / 请求记录
 */
function createReq(pathname: string): RecordedReq {
  return { method: 'GET', pathname, query: {}, body: null, bodyType: 'none' }
}

describe('recorder request filter', () => {
  it('should use a custom filter function as is', () => {
    const filter = vi.fn((req: RecordedReq) => req.pathname === '/api/users')
    const isMatch = createRecordMatcher(filter)

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/orders'))).toBe(false)
  })

  it('should include all requests when include is omitted in glob mode', () => {
    // filter 对象只写了 exclude，include 缺省时不应拒绝一切请求
    // Only `exclude` is configured, omitting `include` must not reject every request
    const isMatch = createRecordMatcher({ mode: 'glob', exclude: ['/api/auth/**'] })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/orders/1'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
  })

  it('should include all requests when neither include nor exclude is configured', () => {
    const isMatch = createRecordMatcher({ mode: 'glob' })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/'))).toBe(true)
  })

  it('should treat negation-only include patterns as include-all in glob mode', () => {
    // include 只包含否定模式时，picomatch 的正向模式集为空，同样需要兜底
    // A negation-only `include` leaves picomatch without any positive pattern
    const isMatch = createRecordMatcher({ mode: 'glob', include: ['!**/auth/**'] })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
  })

  it('should still restrict requests when include is configured in glob mode', () => {
    const isMatch = createRecordMatcher({
      mode: 'glob',
      include: ['/api/**'],
      exclude: ['/api/auth/**'],
    })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
    expect(isMatch(createReq('/other/service'))).toBe(false)
  })

  it('should include all requests when include is omitted in path-to-regexp mode', () => {
    // path-to-regexp 模式下 include 缺省时 `[].some()` 恒为 false，同样会静默不录制
    // In path-to-regexp mode an empty `include` makes `[].some()` always false
    const isMatch = createRecordMatcher({ mode: 'path-to-regexp', exclude: ['/api/auth/:action'] })

    expect(isMatch(createReq('/api/users/1'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
  })

  it('should match include/exclude patterns in path-to-regexp mode', () => {
    const isMatch = createRecordMatcher({
      mode: 'path-to-regexp',
      include: ['/api/:resource/:id'],
      exclude: ['/api/auth/:action'],
    })

    expect(isMatch(createReq('/api/users/1'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
    expect(isMatch(createReq('/api/users'))).toBe(false)
  })
})

describe('getFilepath', () => {
  it('should map different pathnames with the same kebab-case to different files', () => {
    // `/api/userProfile` 与 `/api/user/profile` 的 kebab-case 结果相同，
    // 短哈希保证它们不会落到同一个记录文件
    // Both pathnames share the same kebab-case form, the short hash keeps them apart
    expect(getFilepath('/api/userProfile', 'r')).not.toBe(getFilepath('/api/user/profile', 'r'))
  })

  it('should map the root path to root.json instead of a hidden file', () => {
    expect(getFilepath('/', 'r')).toBe(path.join('r', 'root.json'))
  })

  it('should keep the kebab-case name and append a stable short hash', () => {
    expect(getFilepath('/api/users', 'r')).toBe(path.join('r', 'api-users-6654ad4d.json'))
    // 同一 pathname 始终得到同一个文件名
    // The same pathname always maps to the same file name
    expect(getFilepath('/api/users', 'r')).toBe(getFilepath('/api/users', 'r'))
  })
})

/**
 * Create a proxy response for testing
 *
 * 构造用于测试的代理响应
 *
 * @param headers - Response headers / 响应头
 * @returns Response object / 响应对象
 */
function createRes(headers: Record<string, string>): IncomingMessage {
  return { statusCode: 200, statusMessage: 'OK', headers } as unknown as IncomingMessage
}

describe('processRecordRes', () => {
  it('should decompress the body and drop the headers describing the compressed body', async () => {
    // 解压后的响应体与压缩前的 content-length 不一致，这些 header 必须由 Node
    // 在回放时依据实际写出的字节重新计算，否则客户端会挂起或解析失败
    // The decompressed body does not match the compressed `content-length`; these
    // headers must be recomputed by Node on replay, otherwise clients hang or fail
    const content = JSON.stringify({ ok: true })
    const rawBody = gzipSync(Buffer.from(content))
    const res = createRes({
      'content-type': 'application/json',
      'content-encoding': 'gzip',
      'content-length': String(rawBody.length),
      'transfer-encoding': 'chunked',
    })

    const record = await processRecordRes(res, rawBody)

    expect(record.body).toBe(content)
    expect(record.headers).not.toHaveProperty('content-length')
    expect(record.headers).not.toHaveProperty('transfer-encoding')
    // 解压成功后响应体已是明文，不能保留 content-encoding（也不能写成 identity）
    // The body is no longer compressed, so `content-encoding` must be removed
    expect(record.headers).not.toHaveProperty('content-encoding')
  })

  it('should not add a content-encoding header for uncompressed responses', async () => {
    const res = createRes({ 'content-type': 'application/json' })

    const record = await processRecordRes(res, Buffer.from('{"ok":true}'))

    expect(record.headers).not.toHaveProperty('content-encoding')
  })

  it('should keep the compressed body and its encoding when decompression fails', async () => {
    // 解压失败时响应体保持压缩状态，encoding 必须保留，长度仍由 Node 计算
    // When decompression fails the body stays compressed; the encoding is kept and
    // the length is still computed by Node
    const res = createRes({
      'content-type': 'application/json',
      'content-encoding': 'gzip',
      'content-length': '8',
    })

    const record = await processRecordRes(res, Buffer.from('not-gzip'))

    expect(record.headers['content-encoding']).toBe('gzip')
    expect(record.headers).not.toHaveProperty('content-length')
    expect(record.body).toBe('not-gzip')
  })
})
