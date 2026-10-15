/**
 * Test for response handling functions
 *
 * 响应处理函数测试
 */
import type { MockHttpItem, MockRequest, MockResponse } from '../src/types/index.js'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import Cookies from 'cookies'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
 * 固定 `Date.now()` 与 `setTimeout`，使请求解析耗时与延迟耗时完全由推进的虚拟时间决定，
 * 避免真实计时器的精度误差导致测试失败。
 *
 * responseRealDelay 函数测试套件。
 * `Date.now()` and `setTimeout` are faked so that both the request parsing time and the
 * delay time are fully determined by the advanced virtual time, avoiding flaky tests
 * caused by real timer precision.
 */
describe('responseRealDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not delay when delay is not provided', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime)
    // 未配置延迟时不应注册任何定时器
    // No timer should be scheduled when the delay is not configured
    expect(vi.getTimerCount()).toBe(0)
    expect(Date.now() - startTime).toBe(0)
  })

  it('should not delay when delay is zero', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, 0)
    expect(vi.getTimerCount()).toBe(0)
    expect(Date.now() - startTime).toBe(0)
  })

  it('should not delay when delay is negative', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, -100)
    expect(vi.getTimerCount()).toBe(0)
    expect(Date.now() - startTime).toBe(0)
  })

  it('should delay for specified milliseconds', async () => {
    const startTime = Date.now()
    const pending = responseRealDelay(startTime, 50)
    expect(vi.getTimerCount()).toBe(1)

    await vi.advanceTimersByTimeAsync(50)
    await pending
    // 数值形式的延迟耗时精确等于配置值
    // The number form waits exactly for the configured delay
    expect(Date.now() - startTime).toBe(50)
  })

  it('should handle delay range', async () => {
    const startTime = Date.now()
    const pending = responseRealDelay(startTime, [30, 50])
    // 采样值落在 `[min, max)` 区间内，直接推进到定时器触发时刻
    // The sampled delay stays within `[min, max)`, advance exactly to the moment it fires
    await vi.advanceTimersToNextTimerAsync()
    await pending

    const delay = Date.now() - startTime
    expect(delay).toBeGreaterThanOrEqual(30)
    expect(delay).toBeLessThan(50)
  })

  it('should not delay when delay array is invalid', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, [20] as unknown as [number, number])
    expect(vi.getTimerCount()).toBe(0)
    expect(Date.now() - startTime).toBe(0)
  })

  /**
   * 复用外层伪造的 `Date.now()` 与 `setTimeout`：验证已消耗的解析时间会从延迟中扣除
   *
   * Reuse the faked `Date.now()` and `setTimeout` of the outer suite: verify that the
   * elapsed request parsing time is deducted from the delay
   */
  describe('responseRealDelay deducts elapsed time', () => {
    it('should deduct elapsed time from the delay range', async () => {
      const startTime = Date.now()
      // 模拟请求解析耗时 / simulate request parsing time
      await vi.advanceTimersByTimeAsync(80)

      const pending = responseRealDelay(startTime, [60, 100])
      // 推进到内部 `sleep` 的触发时刻，得到精确的实际耗时
      // Advance to the moment the internal `sleep` fires to get the exact elapsed time
      if (vi.getTimerCount() > 0) {
        await vi.advanceTimersToNextTimerAsync()
      }
      await pending

      const total = Date.now() - startTime
      // 总耗时应落在 [60, 100] 内（实际为 [80, 100)），而不是 80 + [60, 100]
      // The total elapsed time should stay within [60, 100] (actually [80, 100)),
      // instead of 80 + [60, 100]
      expect(total).toBeGreaterThanOrEqual(60)
      expect(total).toBeLessThan(100)
    })

    it('should not delay when elapsed time exceeds the delay range', async () => {
      const startTime = Date.now()
      await vi.advanceTimersByTimeAsync(80)

      const pending = responseRealDelay(startTime, [20, 50])
      // 已耗时超出上限，不应再注册任何定时器
      // The elapsed time already exceeds the upper bound, so no timer should be scheduled
      expect(vi.getTimerCount()).toBe(0)

      await pending
      expect(Date.now() - startTime).toBe(80)
    })

    it('should deduct elapsed time from the number delay', async () => {
      const startTime = Date.now()
      await vi.advanceTimersByTimeAsync(80)

      const pending = responseRealDelay(startTime, 200)
      // 精确推进到 `sleep` 的触发时刻，剩余时间应为 200 - 80 = 120
      // Advance exactly to the moment `sleep` fires, the remaining time should be 200 - 80 = 120
      await vi.advanceTimersToNextTimerAsync()
      await pending

      // 总耗时精确等于 200，而不是 80 + 200
      // The total elapsed time is exactly 200, instead of 80 + 200
      expect(Date.now() - startTime).toBe(200)
    })
  })
})
