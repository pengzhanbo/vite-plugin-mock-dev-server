/**
 * Tests for proxy configure helper
 *
 * 代理 configure 扩展工具测试
 */
import type { ProxyOptions, UserConfig } from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { setupProxyConfigure } from '../src/utils/proxyConfigure.js'

function createProxy(): { proxy: any; listeners: Record<string, (...args: any[]) => void> } {
  const listeners: Record<string, (...args: any[]) => void> = {}
  return {
    listeners,
    proxy: {
      on: vi.fn((event: string, callback: (...args: any[]) => void) => {
        listeners[event] = callback
      }),
    },
  }
}

function getOptions(config: UserConfig, key: string): ProxyOptions {
  return config.server!.proxy![key] as ProxyOptions
}

describe('setupProxyConfigure', () => {
  it('should wrap configure for http proxies in a single pass', () => {
    const original = vi.fn()
    const setupA = vi.fn()
    const setupB = vi.fn()
    const config = {
      server: {
        proxy: {
          '/api': { target: 'http://example.com', configure: original },
        },
      },
    } as UserConfig

    setupProxyConfigure(config, [setupA, setupB])

    const options = getOptions(config, '/api')
    const { proxy } = createProxy()
    options.configure!(proxy, options)

    expect(original).toHaveBeenCalledTimes(1)
    expect(setupA).toHaveBeenCalledTimes(1)
    expect(setupB).toHaveBeenCalledTimes(1)
    expect(setupA).toHaveBeenCalledWith(proxy, options)
    expect(setupB).toHaveBeenCalledWith(proxy, options)
    expect(setupA.mock.invocationCallOrder[0]).toBeLessThan(setupB.mock.invocationCallOrder[0])
  })

  it('should normalize string proxy options and keep target', () => {
    const setup = vi.fn()
    const config = {
      server: { proxy: { '/api': 'http://example.com' } },
    } as UserConfig

    setupProxyConfigure(config, [setup])

    const options = getOptions(config, '/api')
    expect(options).toMatchObject({ target: 'http://example.com' })
    expect(typeof options.configure).toBe('function')
  })

  it('should bind `this` to the proxy options for the original configure', () => {
    const contexts: unknown[] = []
    const original = function (this: unknown): void {
      contexts.push(this)
    }
    const config = {
      server: { proxy: { '/api': { target: 'http://example.com', configure: original } } },
    } as UserConfig

    setupProxyConfigure(config, [vi.fn()])

    const options = getOptions(config, '/api')
    options.configure!(createProxy().proxy, options)

    expect(contexts).toHaveLength(1)
    expect(contexts[0]).toBe(options)
  })

  it('should skip websocket proxies', () => {
    const original = vi.fn()
    const proxyOptions = { target: 'ws://example.com', ws: true, configure: original }
    const config = {
      server: { proxy: { '/ws': proxyOptions } },
    } as UserConfig

    setupProxyConfigure(config, [vi.fn()])

    expect(config.server!.proxy!['/ws']).toBe(proxyOptions)
  })

  it('should do nothing when there is no proxy or no setup', () => {
    expect(() => setupProxyConfigure({}, [vi.fn()])).not.toThrow()

    const proxyOptions = { target: 'http://example.com' }
    const config = {
      server: { proxy: { '/api': proxyOptions } },
    } as UserConfig

    setupProxyConfigure(config, [])

    expect(config.server!.proxy!['/api']).toBe(proxyOptions)
  })
})
