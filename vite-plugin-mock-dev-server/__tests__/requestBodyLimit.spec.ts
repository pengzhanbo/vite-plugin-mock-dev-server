/**
 * Tests for the request body size limit and abort handling
 *
 * 请求体大小上限与中断处理的测试
 *
 * The limit has to be enforced while reading the body: the `co-body` limit only applies
 * to an already buffered body, so it can neither protect the memory of the dev server nor
 * prevent a matched mock from answering with a truncated body.
 *
 * 大小上限必须在读取请求体时生效：`co-body` 的限制只作用于已完整缓冲的请求体，
 * 既无法保护 dev server 的内存，也无法阻止 mock 使用不完整的请求体返回响应。
 */
import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import { createMockMiddleware } from '../src/mockHttp/middleware.js'
import { parseRequestBodyWithRaw } from '../src/mockHttp/request-body.js'

type Listener = (...args: any[]) => void

interface FakeRequestOptions {
  url?: string
  method?: string
  headers?: Record<string, string>
}

/**
 * Create a request that can be driven like a readable stream
 *
 * 创建可按可读流方式驱动的请求对象
 *
 * @param options - Request options / 请求配置
 * @returns Fake request / 模拟请求
 */
function createStreamRequest(options: FakeRequestOptions = {}): any {
  const listeners: Record<string, Listener[]> = {}
  const req: any = {
    url: options.url ?? '/api/body',
    method: options.method ?? 'POST',
    headers: options.headers ?? {},
    socket: { encrypted: false },
    paused: false,
    on(event: string, callback: Listener) {
      ;(listeners[event] ??= []).push(callback)
      return req
    },
    once(event: string, callback: Listener) {
      return req.on(event, callback)
    },
    removeListener(event: string, callback: Listener) {
      const list = listeners[event]
      const index = list ? list.indexOf(callback) : -1
      if (list && index !== -1) {
        list.splice(index, 1)
      }
      return req
    },
    pause() {
      req.paused = true
      return req
    },
    listenerCount(event: string) {
      return listeners[event]?.length ?? 0
    },
    emit(event: string, ...args: any[]) {
      listeners[event]?.slice().forEach((callback) => callback(...args))
      return true
    },
  }
  return req
}

/**
 * Create a minimal response object
 *
 * 创建最小可用的响应对象
 *
 * @returns Fake response / 模拟响应
 */
function createResponse(): any {
  const res: any = {
    statusCode: 0,
    statusMessage: '',
    headersSent: false,
    writableEnded: false,
    destroyed: false,
    data: undefined,
    headers: {} as Record<string, string | string[]>,
    setHeader(key: string, value: string | string[]) {
      res.headers[key] = value
    },
    getHeader(key: string) {
      return res.headers[key]
    },
    removeHeader(key: string) {
      delete res.headers[key]
    },
    end(data?: any) {
      res.writableEnded = true
      res.data = data
    },
    destroy() {
      res.destroyed = true
    },
  }
  return res
}

const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }

describe('request body limit', () => {
  it('should reject a chunked body that exceeds maxBodySize while reading', async () => {
    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const pending = parseRequestBodyWithRaw(req, logger, {}, { maxBodySize: 10 })

    req.emit('data', Buffer.alloc(4, 97))
    req.emit('data', Buffer.alloc(10, 97))

    await expect(pending).rejects.toMatchObject({ code: 'BODY_TOO_LARGE', statusCode: 413 })
    // 超限后停止读取，避免继续把请求体读入内存
    // Reading stops once the limit is exceeded
    expect(req.paused).toBe(true)
  })

  it('should reject from content-length before reading the body', async () => {
    const req = createStreamRequest({
      headers: { 'content-type': 'application/json', 'content-length': '2048' },
    })

    await expect(
      parseRequestBodyWithRaw(req, logger, {}, { maxBodySize: 1024 }),
    ).rejects.toMatchObject({ code: 'BODY_TOO_LARGE', statusCode: 413 })
  })

  it('should honour a smaller co-body limit', async () => {
    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const pending = parseRequestBodyWithRaw(req, logger, {}, { jsonLimit: '1kb' })

    req.emit('data', Buffer.alloc(2 * 1024, 97))

    await expect(pending).rejects.toMatchObject({ code: 'BODY_TOO_LARGE', statusCode: 413 })
  })

  it('should settle with REQUEST_ABORTED when the client disconnects', async () => {
    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const pending = parseRequestBodyWithRaw(req, logger, {}, {})

    req.emit('data', Buffer.alloc(4, 97))
    req.emit('aborted')

    await expect(pending).rejects.toMatchObject({ code: 'REQUEST_ABORTED', statusCode: 400 })
  })

  it('should settle with REQUEST_ABORTED when the request closes before ending', async () => {
    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const pending = parseRequestBodyWithRaw(req, logger, {}, {})

    req.emit('close')

    await expect(pending).rejects.toMatchObject({ code: 'REQUEST_ABORTED', statusCode: 400 })
  })

  it('should read a body within the limit', async () => {
    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const pending = parseRequestBodyWithRaw(req, logger, {}, { maxBodySize: '1kb' })

    req.emit('data', Buffer.from('{"ok":true}'))
    req.emit('end')

    await expect(pending).resolves.toEqual({
      body: { ok: true },
      rawBody: Buffer.from('{"ok":true}'),
    })
  })

  it('should not limit the body when maxBodySize is 0', async () => {
    const req = createStreamRequest({
      headers: { 'content-type': 'application/json', 'content-length': '2048' },
    })
    const pending = parseRequestBodyWithRaw(req, logger, {}, { maxBodySize: 0 })

    const body = Buffer.from(`{"data":"${'x'.repeat(2000)}"}`)
    req.emit('data', body)
    req.emit('end')

    await expect(pending).resolves.toMatchObject({ rawBody: body })
  })

  it('should answer 413 without matching the mock', async () => {
    const mockItem = {
      url: '/api/body',
      method: 'POST',
      body: () => ({ ok: true }),
      __filepath__: 'test.mock.ts',
    }
    const compiler = {
      mockData: { '/api/body': [mockItem] },
    }
    const middleware = createMockMiddleware(
      compiler as any,
      {
        proxies: ['/api'],
        logger,
        cors: false,
        record: { enabled: false },
        replay: false,
        activeScene: [],
        priority: {},
        cookiesOptions: {},
        formidableOptions: {},
        bodyParserOptions: { maxBodySize: 16 },
      } as any,
    )

    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const res = createResponse()
    const next = vi.fn()

    const pending = middleware(req, res, next)
    // 中间件在匹配前会先等待预检处理，请求体监听在微任务之后才注册
    // The middleware awaits the preflight handling first, so the body listeners are
    // registered after a microtask
    await vi.waitFor(() => expect(req.listenerCount('data')).toBe(1))
    req.emit('data', Buffer.alloc(32, 97))
    await pending

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(413)
    expect(res.headers['Content-Type']).toContain('text/plain')
    expect(res.data).toContain('exceeds')
  })

  it('should not answer an aborted request', async () => {
    const mockItem = {
      url: '/api/body',
      method: 'POST',
      body: () => ({ ok: true }),
      __filepath__: 'test.mock.ts',
    }
    const compiler = {
      mockData: { '/api/body': [mockItem] },
    }
    const middleware = createMockMiddleware(
      compiler as any,
      {
        proxies: ['/api'],
        logger,
        cors: false,
        record: { enabled: false },
        replay: false,
        activeScene: [],
        priority: {},
        cookiesOptions: {},
        formidableOptions: {},
        bodyParserOptions: {},
      } as any,
    )

    const req = createStreamRequest({ headers: { 'content-type': 'application/json' } })
    const res = createResponse()
    const next = vi.fn()

    const pending = middleware(req, res, next)
    await vi.waitFor(() => expect(req.listenerCount('data')).toBe(1))
    req.emit('aborted')
    await pending

    expect(next).not.toHaveBeenCalled()
    expect(res.writableEnded).toBe(false)
    expect(logger.debug).toHaveBeenCalled()
  })
})
