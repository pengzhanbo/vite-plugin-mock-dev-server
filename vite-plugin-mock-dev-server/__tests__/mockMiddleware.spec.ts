/**
 * Tests for mock middleware
 *
 * Mock 中间件测试
 */
import type { Connect } from 'vite'
import type { Compiler } from '../src/compiler'
import type { MockHttpItem, MockOptions } from '../src/types'
import { describe, expect, it, vi } from 'vitest'
import { createMockMiddleware } from '../src/mockHttp/middleware'

/**
 * Create a mock compiler for testing
 *
 * 创建用于测试的模拟编译器
 *
 * @param mockData - Mock data to return / 要返回的 Mock 数据
 * @returns Mock compiler instance / 模拟编译器实例
 */
function createMockCompiler(mockData: Record<string, MockOptions> = {}): Compiler {
  return {
    mockData,
    on: vi.fn(),
    emit: vi.fn(),
  } as unknown as Compiler
}

type Listener = (...args: any[]) => void

/**
 * Create a mock request object
 *
 * 创建模拟请求对象
 *
 * @param options - Request options / 请求配置项
 * @param options.url - Request URL / 请求 URL
 * @param options.method - HTTP method / HTTP 方法
 * @param options.headers - Request headers / 请求头
 * @returns Mock request object / 模拟请求对象
 */
function createMockRequest(options: {
  url?: string
  method?: string
  headers?: Record<string, string>
} = {}): Connect.IncomingMessage {
  const {
    url = '/api/users',
    method = 'GET',
    headers = {},
  } = options
  const listeners: Record<string, Listener[]> = {}
  return {
    url,
    method,
    headers,
    socket: { encrypted: false },
    connection: { encrypted: false },
    addListener(event: string, callback: Listener) {
      if (!listeners[event])
        listeners[event] = []
      listeners[event].push(callback)
      return this
    },
    on(event: string, callback: Listener) {
      return (this as any).addListener(event, callback)
    },
    once(event: string, callback: Listener) {
      return (this as any).addListener(event, callback)
    },
    emit(event: string, ...args: any[]) {
      listeners[event]?.forEach(cb => cb(...args))
      return true
    },
    removeListener() { return this },
    removeAllListeners() { return this },
  } as unknown as Connect.IncomingMessage
}

/**
 * Create a mock response object
 *
 * 创建模拟响应对象
 *
 * @returns Mock response object / 模拟响应对象
 */
function createMockResponse(): any {
  const res: any = {
    statusCode: 0,
    statusMessage: '',
    headers: {} as Record<string, string | string[]>,
    cookies: {} as Record<string, any>,
    ended: false,
    data: null as any,
    setHeader(key: string, value: string | string[]) {
      this.headers[key] = value
    },
    getHeader(key: string) {
      return this.headers[key]
    },
    setCookie(key: string, value: string, options?: any) {
      this.cookies[key] = { value, options }
    },
    end(data?: any) {
      this.ended = true
      this.data = data
    },
  }
  return res
}

/**
 * Test suite for mock middleware
 *
 * Mock 中间件测试套件
 */
describe('mockMiddleware', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }

  it('should pass through requests not matching proxy context', async () => {
    const compiler = createMockCompiler({})
    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/other/path' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should pass through when no mock data matches', async () => {
    const compiler = createMockCompiler({})
    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/users' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should return mock response for matching request', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/users',
      method: 'GET',
      body: { id: 1, name: 'Test User' },
      status: 200,
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/users': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/users' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(res.ended).toBe(true)
    expect(JSON.parse(res.data)).toEqual({ id: 1, name: 'Test User' })
  })

  it('should handle POST requests', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/users',
      method: 'POST',
      body: { success: true },
      status: 201,
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/users': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/users', method: 'POST' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(201)
    expect(JSON.parse(res.data)).toEqual({ success: true })
  })

  it('should handle URL with query parameters', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/users',
      method: 'GET',
      body: { id: 1 },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/users': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/users?id=123&name=test' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.ended).toBe(true)
    expect(JSON.parse(res.data)).toEqual({ id: 1 })
  })

  it('should handle dynamic URL parameters', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/users/:id',
      method: 'GET',
      body: { userId: 'dynamic' },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/users/:id': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/users/123' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.ended).toBe(true)
  })

  it('should handle text response type', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/text',
      method: 'GET',
      body: 'Hello World',
      type: 'text',
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/text': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/text' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.data).toBe('Hello World')
    expect(res.headers['Content-Type']).toContain('text/plain')
  })

  it('should handle function body', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/dynamic',
      method: 'GET',
      body: req => ({ query: req.query }),
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/dynamic': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/dynamic?foo=bar' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    const responseData = JSON.parse(res.data)
    expect(responseData.query).toEqual({ foo: 'bar' })
  })

  it('should handle custom headers', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/custom-headers',
      method: 'GET',
      body: {},
      headers: { 'X-Custom-Header': 'test-value' },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/custom-headers': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/custom-headers' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.headers['X-Custom-Header']).toBe('test-value')
  })

  it('should handle cookies', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/cookies',
      method: 'GET',
      body: {},
      cookies: {
        sessionId: 'abc123',
        user: ['john', { path: '/' }],
      },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/cookies': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/cookies' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    // Cookies are set via Set-Cookie header
    const setCookieHeader = res.headers['Set-Cookie'] as string[]
    expect(setCookieHeader).toBeDefined()
    expect(Array.isArray(setCookieHeader)).toBe(true)
    expect(setCookieHeader.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle error simulation', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/error',
      method: 'GET',
      body: { success: true },
      error: {
        probability: 1,
        status: 500,
        statusText: 'Internal Server Error',
      },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/error': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/error' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(500)
    expect(res.statusMessage).toBe('Internal Server Error')
  })

  it('should handle response function', async () => {
    const responseFn = vi.fn((req, res, _next) => {
      res.setHeader('X-Custom', 'value')
      res.end(JSON.stringify({ custom: true }))
    })

    const mockItem: MockHttpItem = {
      url: '/api/custom-response',
      method: 'GET',
      response: responseFn,
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/custom-response': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/custom-response' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(responseFn).toHaveBeenCalled()
    expect(res.headers['X-Custom']).toBe('value')
    expect(JSON.parse(res.data)).toEqual({ custom: true })
  })

  it('should handle validator matching', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/validated',
      method: 'GET',
      body: { version: 1 },
      validator: { query: { version: '1' } },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/validated': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/validated?version=1' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.ended).toBe(true)
    expect(JSON.parse(res.data)).toEqual({ version: 1 })
  })

  it('should skip when validator does not match', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/validated',
      method: 'GET',
      body: { version: 1 },
      validator: { query: { version: '1' } },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/validated': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/validated?version=2' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should set correct default headers', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/users',
      method: 'GET',
      body: {},
      __filepath__: 'test/mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/users': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/users' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.headers['Cache-Control']).toBe('no-cache,max-age=0')
    expect(res.headers['X-Mock-Power-By']).toBe('vite-plugin-mock-dev-server')
    expect(res.headers['X-File-Path']).toBe('test/mock.ts')
  })

  it('should handle empty body', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/empty',
      method: 'GET',
      body: '',
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/empty': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/empty' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.ended).toBe(true)
    expect(res.data).toBe('')
  })

  it('should handle array body', async () => {
    const mockItem: MockHttpItem = {
      url: '/api/list',
      method: 'GET',
      body: [{ id: 1 }, { id: 2 }],
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    const compiler = createMockCompiler({
      '/api/list': [mockItem],
    })

    const middleware = createMockMiddleware(compiler, {
      proxies: ['/api'],
      logger: mockLogger as any,
      cors: false,
    })

    const req = createMockRequest({ url: '/api/list' })
    const res = createMockResponse()
    const next = vi.fn()

    await middleware(req, res, next)

    const data = JSON.parse(res.data)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
  })
})
