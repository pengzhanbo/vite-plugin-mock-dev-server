/**
 * Tests for request recovery
 *
 * 请求恢复测试
 */
import type { Connect, UserConfig } from 'vite'
import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import { cacheRequestBody, requestRecoverySetup } from '../src/mockHttp/requestRecovery.js'
import { setupProxyConfigure } from '../src/utils/index.js'

interface FakeProxyReq {
  headersSent: boolean
  writableEnded: boolean
  headers: Map<string, string>
  getHeader: (name: string) => string | undefined
  setHeader: (name: string, value: string | number) => void
  removeHeader: (name: string) => void
  write: (chunk: Buffer) => void
}

/**
 * Create a fake `http.ClientRequest` that tracks its headers,
 * mimicking Node's case-insensitive header storage.
 *
 * 创建一个模拟的 `http.ClientRequest`，按 Node 的大小写不敏感语义记录头部。
 *
 * @param initialHeaders - Initial headers / 初始头部
 * @param headersSent - Whether headers are already sent / 头部是否已发送
 * @returns Fake proxy request / 模拟的代理请求
 */
function createProxyReq(
  initialHeaders: Record<string, string> = {},
  headersSent = false,
): FakeProxyReq {
  const headers = new Map<string, string>(
    Object.entries(initialHeaders).map(([key, value]) => [key.toLowerCase(), value]),
  )

  return {
    headersSent,
    writableEnded: false,
    headers,
    getHeader: vi.fn((name: string) => headers.get(name.toLowerCase())),
    setHeader: vi.fn((name: string, value: string | number) => {
      headers.set(name.toLowerCase(), String(value))
    }),
    removeHeader: vi.fn((name: string) => {
      headers.delete(name.toLowerCase())
    }),
    write: vi.fn(),
  }
}

/**
 * Setup the proxy extension and trigger the `proxyReq` event.
 *
 * 安装代理扩展并触发 `proxyReq` 事件。
 *
 * @param proxyReq - Fake proxy request / 模拟的代理请求
 * @param req - Incoming message / 入站消息
 */
function runProxyReq(proxyReq: FakeProxyReq, req: Connect.IncomingMessage): void {
  const listeners: Record<string, (...args: any[]) => void> = {}
  const proxy = {
    on: vi.fn((event: string, callback: (...args: any[]) => void) => {
      listeners[event] = callback
    }),
  }
  const config = {
    server: {
      proxy: {
        '/api': { target: 'http://example.com' },
      },
    },
  } as UserConfig

  setupProxyConfigure(config, [requestRecoverySetup])

  const proxyOptions = config.server!.proxy!['/api'] as any
  proxyOptions.configure(proxy, proxyOptions)
  listeners.proxyReq(proxyReq, req)
}

describe('requestRecovery', () => {
  it('should write cached raw body to proxy request', () => {
    const rawBody = Buffer.from('hello')
    const req = {} as Connect.IncomingMessage
    const proxyReq = createProxyReq()

    cacheRequestBody(req, rawBody)
    runProxyReq(proxyReq, req)

    expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Length', rawBody.byteLength)
    expect(proxyReq.write).toHaveBeenCalledWith(rawBody)
  })

  it('should drop transfer-encoding when replaying a chunked request body', () => {
    const rawBody = Buffer.from('{"chunked":true}')
    const req = {} as Connect.IncomingMessage
    // http-proxy copies the origin request headers, including `transfer-encoding: chunked`
    const proxyReq = createProxyReq({
      'transfer-encoding': 'chunked',
      'content-type': 'application/json',
    })

    cacheRequestBody(req, rawBody)
    runProxyReq(proxyReq, req)

    expect(proxyReq.removeHeader).toHaveBeenCalledWith('transfer-encoding')
    expect(proxyReq.headers.has('transfer-encoding')).toBe(false)
    // only one framing header must remain
    expect(proxyReq.getHeader('content-length')).toBe(String(rawBody.byteLength))
    expect(proxyReq.getHeader('content-type')).toBe('application/json')
    expect(proxyReq.write).toHaveBeenCalledWith(rawBody)
  })

  it('should keep headers untouched when they have already been sent', () => {
    const rawBody = Buffer.from('hello')
    const req = {} as Connect.IncomingMessage
    const proxyReq = createProxyReq({ 'transfer-encoding': 'chunked' }, true)

    cacheRequestBody(req, rawBody)
    runProxyReq(proxyReq, req)

    expect(proxyReq.removeHeader).not.toHaveBeenCalled()
    expect(proxyReq.setHeader).not.toHaveBeenCalled()
    expect(proxyReq.write).toHaveBeenCalledWith(rawBody)
  })
})
