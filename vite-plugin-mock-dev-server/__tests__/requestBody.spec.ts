/**
 * Tests for reading and parsing the request body
 *
 * 请求体读取与解析测试
 */
import type { EventEmitter } from 'node:events'
import type { Connect } from 'vite'
import { Buffer } from 'node:buffer'
import { EventEmitter as Emitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import { isRequestAbortedError, parseRequestBodyWithRaw } from '../src/mockHttp/request.js'

/**
 * Create a mock request that emits the given events manually
 *
 * 创建通过手动触发事件模拟的请求对象
 *
 * @param headers - Request headers / 请求头
 * @param method - HTTP method / HTTP 方法
 * @returns Mock request / 模拟请求对象
 */
function createRequest(
  headers: Record<string, string> = {},
  method = 'POST',
): Connect.IncomingMessage & EventEmitter {
  const req: any = new Emitter()
  req.method = method
  req.url = '/api/users'
  req.headers = headers
  req.complete = false
  req.paused = false
  req.pause = function pause(this: any) {
    this.paused = true
    return this
  }
  req.resume = function resume(this: any) {
    this.paused = false
    return this
  }
  return req
}

/**
 * Create a mock logger
 *
 * 创建模拟日志实例
 *
 * @returns Mock logger / 模拟日志实例
 */
function createLogger() {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

/**
 * Finish the request normally
 *
 * 正常结束请求
 *
 * @param req - Mock request / 模拟请求对象
 * @param body - Request body / 请求体
 */
function finishRequest(req: Connect.IncomingMessage & EventEmitter, body?: string): void {
  if (body) {
    req.emit('data', Buffer.from(body))
  }
  req.complete = true
  req.emit('end')
}

describe('parseRequestBodyWithRaw', () => {
  it('should parse the json body and keep the raw body', async () => {
    const logger = createLogger()
    const req = createRequest({ 'content-type': 'application/json' })

    const pending = parseRequestBodyWithRaw(req, logger, {}, {})
    finishRequest(req, '{"name":"test"}')

    const { body, rawBody } = await pending

    expect(body).toEqual({ name: 'test' })
    expect(rawBody).toEqual(Buffer.from('{"name":"test"}'))
  })

  it('should reject an oversized body by content-length before reading', async () => {
    // 读取前通过 content-length 快速拒绝，避免先缓冲整个请求体
    // The oversized body is rejected through `content-length` before reading
    const logger = createLogger()
    const req = createRequest({
      'content-type': 'application/json',
      'content-length': String(2 * 1024 * 1024),
    })

    await expect(parseRequestBodyWithRaw(req, logger, {}, {})).rejects.toMatchObject({
      status: 413,
      code: 'ETOOLARGE',
    })
    // 未注册读取监听，请求流未被消费
    // No read listener is attached, the request stream is not consumed
    expect(req.listenerCount('data')).toBe(0)
  })

  it('should reject an oversized body while reading', async () => {
    // 未提供 content-length（如 chunked）时按累计字节数判断
    // Without `content-length` (e.g. chunked) the accumulated bytes are counted
    const logger = createLogger()
    const req = createRequest({ 'content-type': 'application/json' }, 'POST')

    const pending = parseRequestBodyWithRaw(req, logger, {}, { jsonLimit: 5 })
    req.emit('data', Buffer.from('abc'))
    req.emit('data', Buffer.from('def'))

    await expect(pending).rejects.toMatchObject({
      status: 413,
      code: 'ETOOLARGE',
    })
    // 超限后停止消费剩余请求体
    // Stop consuming the rest of the request after exceeding the limit
    expect((req as any).paused).toBe(true)
  })

  it('should use the configured limit', async () => {
    const logger = createLogger()
    const req = createRequest({
      'content-type': 'application/json',
      'content-length': '2048',
    })

    await expect(
      parseRequestBodyWithRaw(req, logger, {}, { jsonLimit: '1kb' }),
    ).rejects.toMatchObject({ status: 413 })
  })

  it('should use the formidable size options for multipart bodies', async () => {
    const logger = createLogger()
    const req = createRequest({
      'content-type': 'multipart/form-data; boundary=test',
      'content-length': String(4096),
    })

    await expect(
      parseRequestBodyWithRaw(req, logger, { maxFileSize: 1024 }, {}),
    ).rejects.toMatchObject({ status: 413 })
  })

  it('should not limit content types handled by the proxy', async () => {
    // 非 mock 解析的 content-type 不做限制，避免影响代理转发大文件
    // Content types without a mock parser are not limited so that large files
    // forwarded by the proxy keep working
    const logger = createLogger()
    const req = createRequest({
      'content-type': 'application/octet-stream',
      'content-length': String(500 * 1024 * 1024),
    })

    const pending = parseRequestBodyWithRaw(req, logger, {}, {})
    finishRequest(req, 'binary')

    await expect(pending).resolves.toEqual({
      body: undefined,
      rawBody: Buffer.from('binary'),
    })
  })

  it('should reject when the client aborts the request', async () => {
    // 客户端中断时 Promise 必须 reject，否则异步链会一直悬挂
    // The promise must reject when the client aborts, otherwise the async chain hangs
    const logger = createLogger()
    const req = createRequest({ 'content-type': 'application/json' })

    const pending = parseRequestBodyWithRaw(req, logger, {}, {})
    req.emit('aborted')

    const error = await pending.catch((err) => err)
    expect(error).toMatchObject({ status: 400, code: 'ECONNABORTED' })
    expect(isRequestAbortedError(error)).toBe(true)
  })

  it('should reject when the request closes before ending', async () => {
    const logger = createLogger()
    const req = createRequest({ 'content-type': 'application/json' })

    const pending = parseRequestBodyWithRaw(req, logger, {}, {})
    req.emit('close')

    await expect(pending).rejects.toMatchObject({ code: 'ECONNABORTED' })
  })

  it('should not reject when the request closes after ending', async () => {
    // 正常结束后也会触发 close，此时请求已完整读取
    // `close` is also emitted after a normal end, when the body has been fully read
    const logger = createLogger()
    const req = createRequest({ 'content-type': 'application/json' })

    const pending = parseRequestBodyWithRaw(req, logger, {}, {})
    finishRequest(req, '{"ok":true}')
    req.emit('close')

    await expect(pending).resolves.toMatchObject({
      body: { ok: true },
    })
  })

  it('should not read the body of HEAD and OPTIONS requests', async () => {
    const logger = createLogger()

    for (const method of ['HEAD', 'OPTIONS']) {
      const req = createRequest({ 'content-type': 'application/json' }, method)
      await expect(parseRequestBodyWithRaw(req, logger, {}, {})).resolves.toEqual({
        body: undefined,
      })
      expect(req.listenerCount('data')).toBe(0)
    }
  })
})

describe('isRequestAbortedError', () => {
  it('should detect the aborted request error', () => {
    expect(
      isRequestAbortedError(Object.assign(new Error('aborted'), { code: 'ECONNABORTED' })),
    ).toBe(true)
    expect(
      isRequestAbortedError(Object.assign(new Error('too large'), { code: 'ETOOLARGE' })),
    ).toBe(false)
    expect(isRequestAbortedError(undefined)).toBe(false)
    expect(isRequestAbortedError(null)).toBe(false)
  })
})
