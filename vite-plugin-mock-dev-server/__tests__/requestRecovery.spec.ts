/**
 * Tests for request recovery
 *
 * 请求恢复测试
 */
import type { Connect, UserConfig } from 'vite'
import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import { cacheRequestBody, recoverRequest } from '../src/mockHttp/requestRecovery'

describe('requestRecovery', () => {
  it('should write cached raw body to proxy request', () => {
    const rawBody = Buffer.from('hello')
    const req = {} as Connect.IncomingMessage
    const proxyReq = {
      headersSent: false,
      writableEnded: false,
      setHeader: vi.fn(),
      write: vi.fn(),
    }
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

    cacheRequestBody(req, rawBody)
    recoverRequest(config)

    const proxyOptions = config.server!.proxy!['/api'] as any
    proxyOptions.configure(proxy, proxyOptions)
    listeners.proxyReq(proxyReq, req)

    expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Length', rawBody.byteLength)
    expect(proxyReq.write).toHaveBeenCalledWith(rawBody)
  })
})
