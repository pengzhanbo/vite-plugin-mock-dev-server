/**
 * Test for response handling functions
 *
 * 响应处理函数测试
 */
import type { MockHttpItem, MockRequest, MockResponse } from '../src/types/index.js'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { sleep } from '@pengzhanbo/utils'
import Cookies from 'cookies'
import { describe, expect, it, vi } from 'vitest'
import {
  getHTTPStatusText,
  provideResponseCookies,
  provideResponseHeaders,
  provideResponseStatus,
  responseRealDelay,
} from '../src/mockHttp/response.js'

/**
 * Test suite for getHTTPStatusText function
 *
 * getHTTPStatusText 函数测试套件
 */
describe('getHTTPStatusText', () => {
  it('should get correct status text for standard codes', () => {
    expect(getHTTPStatusText(200)).toBe('OK')
    expect(getHTTPStatusText(201)).toBe('Created')
    expect(getHTTPStatusText(400)).toBe('Bad Request')
    expect(getHTTPStatusText(404)).toBe('Not Found')
    expect(getHTTPStatusText(500)).toBe('Internal Server Error')
  })

  it('should return Unknown for invalid status code', () => {
    expect(getHTTPStatusText(9999)).toBe('Unknown')
  })
})

/**
 * Test suite for provideResponseStatus function
 *
 * provideResponseStatus 函数测试套件
 */
describe('provideResponseStatus', () => {
  it('should set default status code and text', () => {
    const res = {
      statusCode: 0,
      statusMessage: '',
    } as any
    provideResponseStatus(res)
    expect(res.statusCode).toBe(200)
    expect(res.statusMessage).toBe('OK')
  })

  it('should set custom status code', () => {
    const res = {
      statusCode: 0,
      statusMessage: '',
    } as any
    provideResponseStatus(res, 404)
    expect(res.statusCode).toBe(404)
    expect(res.statusMessage).toBe('Not Found')
  })

  it('should set custom status text', () => {
    const res = {
      statusCode: 0,
      statusMessage: '',
    } as any
    provideResponseStatus(res, 200, 'Custom OK')
    expect(res.statusCode).toBe(200)
    expect(res.statusMessage).toBe('Custom OK')
  })
})

/**
 * Create a real `ServerResponse` instance
 *
 * 创建真实的 `ServerResponse` 实例
 *
 * @returns ServerResponse instance / ServerResponse 实例
 */
function createServerResponse(): ServerResponse {
  return new ServerResponse(new IncomingMessage(new Socket()))
}

/**
 * Test suite for provideResponseHeaders function
 *
 * provideResponseHeaders 函数测试套件
 */
describe('provideResponseHeaders', () => {
  /**
   * Create a mock logger
   *
   * 创建模拟日志实例
   *
   * @returns Mock logger / 模拟日志实例
   */
  const createLogger = () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })

  /**
   * Create request object
   *
   * 创建请求对象
   *
   * @returns Mock request / 模拟请求对象
   */
  const createRequest = () => ({ url: '/api/users' }) as unknown as MockRequest

  it('should skip response headers with invalid names', async () => {
    const logger = createLogger()
    const res = createServerResponse()
    const mock = {
      url: '/api/users',
      headers: { 'Bad Header': 'value', 'X-Ok': 'ok' },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    await provideResponseHeaders(createRequest(), res as unknown as MockResponse, mock, logger)

    expect(res.getHeader('X-Ok')).toBe('ok')
    expect(res.getHeader('Bad Header')).toBeUndefined()
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error.mock.calls[0][0]).toContain('Invalid response header name')
    expect(logger.error.mock.calls[0][0]).toContain('Bad Header')
  })

  it('should skip response headers with invalid values', async () => {
    const logger = createLogger()
    const res = createServerResponse()
    const mock = {
      url: '/api/users',
      headers: { 'X-Bad': 'invalid\nvalue', 'X-Ok': 'ok' },
      __filepath__: 'test.mock.ts',
    } as MockHttpItem

    await provideResponseHeaders(createRequest(), res as unknown as MockResponse, mock, logger)

    expect(res.getHeader('X-Ok')).toBe('ok')
    expect(res.getHeader('X-Bad')).toBeUndefined()
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error.mock.calls[0][0]).toContain('ERR_INVALID_CHAR')
  })

  it('should encode non-latin1 filepath in the X-File-Path header', async () => {
    const logger = createLogger()
    const res = createServerResponse()
    const mock = {
      url: '/api/users',
      body: {},
      __filepath__: 'mock/中文/demo.mock.ts',
    } as MockHttpItem

    await provideResponseHeaders(createRequest(), res as unknown as MockResponse, mock, logger)

    expect(res.getHeader('X-File-Path')).toBe('mock/%E4%B8%AD%E6%96%87/demo.mock.ts')
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should not throw when the headers function returns undefined', async () => {
    const logger = createLogger()
    const res = createServerResponse()
    const mock = {
      url: '/api/users',
      headers: () => undefined,
      __filepath__: 'test.mock.ts',
    } as unknown as MockHttpItem

    await provideResponseHeaders(createRequest(), res as unknown as MockResponse, mock, logger)

    expect(logger.error).not.toHaveBeenCalled()
    expect(res.getHeader('X-Mock-Power-By')).toBe('vite-plugin-mock-dev-server')
  })
})

/**
 * Test suite for provideResponseCookies function
 *
 * provideResponseCookies 函数测试套件
 */
describe('provideResponseCookies', () => {
  /**
   * Create a response with a real `cookies` instance attached
   *
   * 创建挂载了真实 `cookies` 实例的响应对象
   *
   * @returns Mock request and response / 模拟请求与响应对象
   */
  const createCookieResponse = () => {
    const req = {
      url: '/api/users',
      socket: { encrypted: false },
    } as unknown as MockRequest
    const res = createServerResponse() as unknown as MockResponse
    const cookies = new Cookies(req, res, {})
    res.setCookie = cookies.set.bind(cookies)
    return { req, res }
  }

  it('should skip invalid cookies and keep the valid ones', async () => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const { req, res } = createCookieResponse()
    const mock = {
      url: '/api/users',
      cookies: {
        // A cookie name that is not a valid token would be dropped by the browser
        'invalid name': 'value',
        // A cookie value containing non-latin1 characters
        'invalidValue': '中文',
        'invalidOptions': ['value', { sameSite: 'invalid' }],
        // A secure cookie cannot be sent over an unencrypted connection
        'insecure': ['value', { secure: true }],
        'valid': 'ok',
      },
      __filepath__: 'test.mock.ts',
    } as unknown as MockHttpItem

    await provideResponseCookies(req, res, mock, logger)

    const setCookie = res.getHeader('Set-Cookie')
    expect(setCookie).toHaveLength(1)
    expect(String(setCookie)).toContain('valid=ok')
    expect(logger.error).toHaveBeenCalledTimes(4)
    expect(logger.error.mock.calls[0][0]).toContain('Invalid response cookie name')
    expect(logger.error.mock.calls[0][0]).toContain('invalid name')
    expect(logger.error.mock.calls[1][0]).toContain('argument value is invalid')
    expect(logger.error.mock.calls[1][0]).toContain('invalidValue')
    expect(logger.error.mock.calls[2][0]).toContain('option sameSite is invalid')
    expect(logger.error.mock.calls[2][0]).toContain('invalidOptions')
    expect(logger.error.mock.calls[3][0]).toContain(
      'Cannot send secure cookie over unencrypted connection',
    )
    expect(logger.error.mock.calls[3][0]).toContain('insecure')
  })

  it('should not throw when the cookies function returns undefined', async () => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const { req, res } = createCookieResponse()
    const mock = {
      url: '/api/users',
      cookies: () => undefined,
      __filepath__: 'test.mock.ts',
    } as unknown as MockHttpItem

    await provideResponseCookies(req, res, mock, logger)

    expect(logger.error).not.toHaveBeenCalled()
    expect(res.getHeader('Set-Cookie')).toBeUndefined()
  })
})

/**
 * Test suite for responseRealDelay function
 *
 * responseRealDelay 函数测试套件
 */
describe('responseRealDelay', () => {
  it('should not delay when delay is not provided', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime)
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should not delay when delay is zero', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, 0)
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should not delay when delay is negative', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, -100)
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should delay for specified milliseconds', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, 50)
    const endTime = Date.now()
    expect(endTime - startTime).toBeGreaterThanOrEqual(45)
  })

  it('should handle delay range', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, [30, 50])
    const endTime = Date.now()
    const delay = endTime - startTime
    expect(delay).toBeGreaterThanOrEqual(25)
    expect(delay).toBeLessThanOrEqual(100)
  })

  it('should not delay when delay array is invalid', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, [20] as unknown as [number, number])
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should deduct elapsed time from the delay range', async () => {
    const startTime = Date.now()
    //模拟请求解析耗时 / simulate request parsing time
    await sleep(80)
    await responseRealDelay(startTime, [60, 100])
    const total = Date.now() - startTime
    // 总耗时应落在 [60, 100] 内，而不是 80 + [60, 100)
    // The total elapsed time should stay within [60, 100], instead of 80 + [60, 100]
    expect(total).toBeGreaterThanOrEqual(55)
    expect(total).toBeLessThanOrEqual(130)
  })

  it('should not delay when elapsed time exceeds the delay range', async () => {
    const startTime = Date.now()
    await sleep(80)
    await responseRealDelay(startTime, [20, 50])
    const total = Date.now() - startTime
    expect(total).toBeLessThan(130)
  })

  it('should deduct elapsed time from the number delay', async () => {
    const startTime = Date.now()
    await sleep(80)
    await responseRealDelay(startTime, 200)
    const total = Date.now() - startTime
    expect(total).toBeGreaterThanOrEqual(170)
    expect(total).toBeLessThan(230)
  })
})
