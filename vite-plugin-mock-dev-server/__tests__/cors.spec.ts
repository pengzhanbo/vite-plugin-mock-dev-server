/**
 * Tests for CORS module
 *
 * CORS 模块测试
 */
import { describe, expect, it, vi } from 'vitest'
import { createCors } from '../src/mockHttp/cors.js'

/**
 * Create a response object with a minimal event API
 *
 * 创建带有最小事件能力的响应对象
 *
 * `cors` 在预检请求时直接结束响应而不调用 `next`，因此需要 `finish` 事件收尾 Promise。
 *
 * `cors` ends the response of a preflight request without calling `next`, so the
 * `finish` event is needed to settle the Promise.
 *
 * @returns Mock response / 模拟响应对象
 */
function createMockResponse() {
  const listeners: Record<string, (() => void)[]> = {}
  const headers: Record<string, string> = {}
  const res: any = {
    statusCode: 200,
    headers,
    setHeader: vi.fn((key: string, value: string) => {
      headers[key.toLowerCase()] = value
    }),
    getHeader: vi.fn((key: string) => headers[key.toLowerCase()]),
    end: vi.fn(() => res.emit('finish')),
    once(event: string, callback: () => void) {
      ;(listeners[event] ||= []).push(callback)
      return res
    },
    emit(event: string) {
      listeners[event]?.forEach((callback) => callback())
      return true
    },
  }
  return res
}

describe('createCors', () => {
  it('should return undefined when corsOptions is false', () => {
    const result = createCors(false)
    expect(result).toBeUndefined()
  })

  it('should return middleware function when corsOptions is provided', () => {
    expect(typeof createCors({ origin: '*' })).toBe('function')
  })

  it('should return middleware function when corsOptions is empty object', () => {
    expect(typeof createCors({})).toBe('function')
  })

  it('should resolve through next for simple requests', async () => {
    const corsMiddleware = createCors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })!
    const req = {
      method: 'GET',
      headers: { origin: 'http://localhost:3000' },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000')
    expect(res.end).not.toHaveBeenCalled()
  })

  it('should resolve when cors ends the preflight response', async () => {
    // 预检请求由 cors 直接结束响应，不调用 next，Promise 仍必须 settle
    // `cors` ends the preflight response without calling `next`, and the Promise
    // must still settle
    const corsMiddleware = createCors({
      origin: 'http://localhost:3000',
      credentials: true,
    })!
    const req = {
      method: 'OPTIONS',
      headers: {
        'origin': 'http://localhost:3000',
        'access-control-request-method': 'POST',
      },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.statusCode).toBe(204)
    expect(res.end).toHaveBeenCalledTimes(1)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000')
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it('should resolve when cors ends the preflight response with a custom success status', async () => {
    const corsMiddleware = createCors({ origin: '*', optionsSuccessStatus: 200 })!
    const req = {
      method: 'OPTIONS',
      headers: { 'access-control-request-method': 'GET' },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.statusCode).toBe(200)
  })

  it('should resolve when the response is closed before cors finishes', async () => {
    // 预检响应被提前关闭（如客户端断开）时，同样需要 settle，避免异步链悬挂
    // A preflight response closed early (e.g. the client disconnected) must settle
    // the Promise as well to avoid a dangling async chain
    const corsMiddleware = createCors({ origin: '*' })!
    const req = {
      method: 'OPTIONS',
      headers: { 'access-control-request-method': 'POST' },
    } as any
    const res = createMockResponse()
    res.end = vi.fn()

    const pending = corsMiddleware(req, res)
    res.emit('close')

    await expect(pending).resolves.toBeUndefined()
  })

  it('should reject when the origin callback returns an error', async () => {
    const corsMiddleware = createCors({
      origin: (_origin, callback) => callback(new Error('Not allowed')),
    })!
    const req = {
      method: 'GET',
      headers: { origin: 'http://not-allowed.com' },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).rejects.toThrow('Not allowed')
    expect(res.end).not.toHaveBeenCalled()
  })

  it('should handle specific origin configuration', async () => {
    const corsMiddleware = createCors({
      origin: ['http://localhost:3000', 'http://localhost:8080'],
      methods: ['GET', 'POST'],
    })!
    const req = {
      method: 'GET',
      headers: { origin: 'http://localhost:8080' },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:8080')
  })

  it('should handle function origin configuration', async () => {
    const corsMiddleware = createCors({
      origin: (origin, callback) => {
        callback(null, origin === 'http://allowed.com')
      },
    })!
    const req = {
      method: 'GET',
      headers: { origin: 'http://allowed.com' },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.headers['access-control-allow-origin']).toBe('http://allowed.com')
  })

  it('should handle exposed headers configuration', async () => {
    const corsMiddleware = createCors({
      origin: '*',
      exposedHeaders: ['X-Custom-Header', 'X-Request-ID'],
    })!
    const req = { method: 'GET', headers: {} } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.headers['access-control-expose-headers']).toBe('X-Custom-Header,X-Request-ID')
  })

  it('should handle maxAge configuration', async () => {
    const corsMiddleware = createCors({
      origin: '*',
      maxAge: 86400,
    })!
    const req = {
      method: 'OPTIONS',
      headers: { 'access-control-request-method': 'GET' },
    } as any
    const res = createMockResponse()

    await expect(corsMiddleware(req, res)).resolves.toBeUndefined()

    expect(res.headers['access-control-max-age']).toBe('86400')
  })
})
