/**
 * Test for options parsing functions
 *
 * 选项解析函数测试
 */
import { describe, expect, it } from 'vitest'
import { ensureProxies } from '../src/core/options'

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
