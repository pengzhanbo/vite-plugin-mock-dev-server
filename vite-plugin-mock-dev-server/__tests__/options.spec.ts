/**
 * Test for options parsing functions
 *
 * 选项解析函数测试
 */
import type { ResolvedConfig } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ensureProxies, resolveCorsOptions, resolvePluginOptions } from '../src/core/options.js'

/**
 * Create a minimal resolved Vite config for testing
 *
 * 创建用于测试的最小化 Vite 解析配置
 *
 * @returns Resolved config / 解析后的配置
 */
function createResolvedConfig(): ResolvedConfig {
  return {
    root: process.cwd(),
    mode: 'development',
    define: {},
    env: {},
    resolve: { alias: [] },
    server: { proxy: {}, cors: false },
  } as unknown as ResolvedConfig
}

/**
 * Test suite for ensureProxies function
 *
 * ensureProxies 函数测试套件
 */
describe('ensureProxies', () => {
  it('should separate http and websocket proxies', () => {
    const proxy = {
      '/api': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true },
      '/wss': { target: 'wss://localhost:3000' },
    }
    const result = ensureProxies(proxy)
    expect(result.httpProxies).toEqual(['/api'])
    expect(result.wsProxies).toEqual(['/ws', '/wss'])
  })

  it('should handle string proxy targets', () => {
    const proxy = {
      '/api': 'http://localhost:3000',
    }
    const result = ensureProxies(proxy)
    expect(result.httpProxies).toEqual(['/api'])
    expect(result.wsProxies).toEqual([])
  })

  it('should classify string websocket proxy targets as ws proxies', () => {
    const proxy = {
      '/api': 'http://localhost:3000',
      '/socket.io': 'ws://localhost:3000',
      '/secure-socket': 'wss://localhost:3000',
    }
    const result = ensureProxies(proxy)
    expect(result.httpProxies).toEqual(['/api'])
    expect(result.wsProxies).toEqual(['/socket.io', '/secure-socket'])
  })

  it('should classify URL websocket proxy targets as ws proxies', () => {
    const proxy = {
      '/api': { target: new URL('http://localhost:3000') },
      '/ws': { target: new URL('ws://localhost:3000') },
      '/wss': { target: new URL('wss://localhost:3000') },
    }
    const result = ensureProxies(proxy)
    expect(result.httpProxies).toEqual(['/api'])
    expect(result.wsProxies).toEqual(['/ws', '/wss'])
  })

  it('should handle object proxy targets', () => {
    const proxy = {
      '/api': { target: 'http://localhost:3000' },
    }
    const result = ensureProxies(proxy)
    expect(result.httpProxies).toEqual(['/api'])
    expect(result.wsProxies).toEqual([])
  })

  it('should handle empty proxy', () => {
    const result = ensureProxies({})
    expect(result.httpProxies).toEqual([])
    expect(result.wsProxies).toEqual([])
  })

  it('should handle undefined proxy', () => {
    const result = ensureProxies()
    expect(result.httpProxies).toEqual([])
    expect(result.wsProxies).toEqual([])
  })
})

/**
 * Test suite for resolveCorsOptions function
 *
 * resolveCorsOptions 函数测试套件
 */
describe('resolveCorsOptions', () => {
  it('should enable cors with empty options by default', () => {
    expect(resolveCorsOptions(true)).toEqual({})
    expect(resolveCorsOptions({})).toEqual({})
  })

  it('should disable cors when either option disables it', () => {
    expect(resolveCorsOptions(false)).toBe(false)
    expect(resolveCorsOptions(true, false)).toBe(false)
    expect(resolveCorsOptions(false, { origin: '*' })).toBe(false)
  })

  it('should use the vite server.cors options as the base', () => {
    expect(resolveCorsOptions(true, { origin: 'https://vite.dev', credentials: true })).toEqual({
      origin: 'https://vite.dev',
      credentials: true,
    })
  })

  it('should override the vite server.cors options with the plugin cors options', () => {
    expect(
      resolveCorsOptions(
        { origin: 'https://mock.dev' },
        {
          origin: 'https://vite.dev',
          credentials: true,
        },
      ),
    ).toEqual({ origin: 'https://mock.dev', credentials: true })
  })
})

/**
 * Test suite for resolvePluginOptions function
 *
 * resolvePluginOptions 函数测试套件
 */
describe('resolvePluginOptions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should warn when replay is enabled while record is disabled', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const options = resolvePluginOptions(
      { prefix: ['/api'], record: false, replay: true },
      createResolvedConfig(),
    )

    expect(options.replay).toBe(true)
    expect(options.record.enabled).toBe(false)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(String(warnSpy.mock.calls[0][0])).toContain('replay option is enabled')
  })

  it('should enable replay by default when record is enabled', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const options = resolvePluginOptions({ prefix: ['/api'], record: true }, createResolvedConfig())

    expect(options.record.enabled).toBe(true)
    expect(options.replay).toBe(true)
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('should disable replay by default when record is disabled', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const options = resolvePluginOptions(
      { prefix: ['/api'], record: false },
      createResolvedConfig(),
    )

    expect(options.record.enabled).toBe(false)
    expect(options.replay).toBe(false)
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('should disable cors when the vite server.cors option is disabled', () => {
    const config = createResolvedConfig()
    config.server.cors = false

    const options = resolvePluginOptions({ prefix: ['/api'] }, config)

    expect(options.cors).toBe(false)
  })

  it('should merge the plugin cors options over the vite server.cors options', () => {
    const config = createResolvedConfig()
    config.server.cors = { origin: 'https://vite.dev', credentials: true }

    const options = resolvePluginOptions({ prefix: ['/api'], cors: { origin: '*' } }, config)

    expect(options.cors).toEqual({ origin: '*', credentials: true })
  })
})
