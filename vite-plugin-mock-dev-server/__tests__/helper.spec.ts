import type { MockHttpItem, MockWebsocketItem } from '../src'
/**
 * Test for helper functions
 *
 * 辅助函数测试
 */
import { describe, expect, it, vi } from 'vitest'
import { createDefineMock, defineMock } from '../src'

/**
 * Test suite for defineMock function
 *
 * defineMock 函数测试套件
 */
describe('defineMock', () => {
  it('should return the same HTTP mock config', () => {
    const config: MockHttpItem = {
      url: '/api/users',
      method: 'GET',
      body: { data: 'users' },
    }
    const result = defineMock(config)
    expect(result).toEqual(config)
  })

  it('should return the same WebSocket mock config', () => {
    const setup = vi.fn()
    const config: MockWebsocketItem = {
      url: '/api/ws',
      ws: true,
      setup,
    }
    const result = defineMock(config)
    expect(result).toEqual(config)
  })

  it('should return array of mock configs', () => {
    const configs: MockHttpItem[] = [
      { url: '/api/users', method: 'GET', body: { data: 'users' } },
      { url: '/api/posts', method: 'POST', body: { data: 'posts' } },
    ]
    const result = defineMock(configs)
    expect(result).toEqual(configs)
  })
})

/**
 * Test suite for createDefineMock function
 *
 * createDefineMock 函数测试套件
 */
describe('createDefineMock', () => {
  it('should create custom defineMock with transformer', () => {
    const customDefineMock = createDefineMock((mock) => {
      mock.url = `/api${mock.url}`
    })
    const config: MockHttpItem = {
      url: '/users',
      method: 'GET',
      body: { data: 'users' },
    }
    const result = customDefineMock(config)
    expect(result.url).toBe('/api/users')
  })

  it('should handle array of mocks with transformer', () => {
    const customDefineMock = createDefineMock((mock) => {
      mock.url = `/api${mock.url}`
    })
    const configs: MockHttpItem[] = [
      { url: '/users', method: 'GET', body: { data: 'users' } },
      { url: '/posts', method: 'POST', body: { data: 'posts' } },
    ]
    const results = customDefineMock(configs)
    expect(results[0].url).toBe('/api/users')
    expect(results[1].url).toBe('/api/posts')
  })

  it('should return original config when transformer returns undefined', () => {
    const customDefineMock = createDefineMock(() => undefined)
    const config: MockHttpItem = {
      url: '/api/users',
      method: 'GET',
      body: { data: 'users' },
    }
    const result = customDefineMock(config)
    expect(result).toEqual(config)
  })

  it('should support complex transformer logic', () => {
    const customDefineMock = createDefineMock((mock) => {
      if (mock.ws) {
        return mock
      }
      if (!mock.method) {
        mock.method = ['GET', 'POST']
      }
      if (!mock.headers) {
        mock.headers = { 'X-Custom': 'test' }
      }
    })
    const config: MockHttpItem = {
      url: '/api/users',
      body: { data: 'users' },
    }
    const result = customDefineMock(config)
    expect(result.method).toEqual(['GET', 'POST'])
    expect(result.headers).toEqual({ 'X-Custom': 'test' })
  })
})
