/**
 * Test for options parsing functions
 *
 * 选项解析函数测试
 */
import type { ResolvedConfig } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ensureProxies, resolvePluginOptions } from '../src/core/options.js'

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
})
