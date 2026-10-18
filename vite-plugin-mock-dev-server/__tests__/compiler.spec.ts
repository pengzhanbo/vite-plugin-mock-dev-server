/**
 * Tests for compiler module
 *
 * 编译器模块测试
 */
import type { MockOptions } from '../src/types/index.js'
import { pathToRegexp } from 'path-to-regexp'
import { describe, expect, it, vi } from 'vitest'
import { processMockData, processRawData, sortByValidator } from '../src/compiler/processData.js'

describe('processRawData', () => {
  it('should process array data', () => {
    const raw: any[] = [
      { url: '/api/users', method: 'GET', body: { id: 1 } },
      { url: '/api/posts', method: 'POST', body: { title: 'Test' } },
    ]
    const result = processRawData(raw, 'test.mock.ts')

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
    expect((result as MockOptions)[0]).toHaveProperty('__filepath__', 'test.mock.ts')
    expect((result as MockOptions)[1]).toHaveProperty('__filepath__', 'test.mock.ts')
  })

  it('should process single object with url', () => {
    const raw: any = { url: '/api/users', method: 'GET', body: { id: 1 } }
    const result = processRawData(raw, 'test.mock.ts')

    expect(result).toHaveProperty('__filepath__', 'test.mock.ts')
    expect(result).toHaveProperty('url', '/api/users')
  })

  it('should process object with nested arrays', () => {
    const raw: any = {
      users: [{ url: '/api/users', method: 'GET', body: { id: 1 } }],
      posts: { url: '/api/posts', method: 'POST', body: { title: 'Test' } },
    }
    const result = processRawData(raw, 'test.mock.ts')

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
  })

  it('should handle empty array', () => {
    const raw: any[] = []
    const result = processRawData(raw, 'test.mock.ts')

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(0)
  })

  it('should preserve all mock properties', () => {
    const raw: any = {
      url: '/api/users',
      method: 'GET',
      body: { id: 1 },
      status: 200,
      delay: 100,
      headers: { 'X-Custom': 'value' },
      cookies: { session: 'abc' },
      type: 'json',
    }
    const result = processRawData(raw, 'test.mock.ts')

    expect(result).toMatchObject({
      url: '/api/users',
      method: 'GET',
      body: { id: 1 },
      status: 200,
      delay: 100,
      headers: { 'X-Custom': 'value' },
      cookies: { session: 'abc' },
      type: 'json',
      __filepath__: 'test.mock.ts',
    })
  })
})

describe('processMockData', () => {
  it('should group mocks by pathname', () => {
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          { url: '/api/users', method: 'GET', body: {} },
          { url: '/api/posts', method: 'GET', body: {} },
        ] as MockOptions,
      ],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(result).toHaveProperty('/api/posts')
    expect(result['/api/users']).toHaveLength(1)
    expect(result['/api/posts']).toHaveLength(1)
  })

  it('should filter out disabled mocks', () => {
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          { url: '/api/users', method: 'GET', body: {}, enabled: true },
          { url: '/api/posts', method: 'GET', body: {}, enabled: false },
        ] as MockOptions,
      ],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(result).not.toHaveProperty('/api/posts')
  })

  it('should filter out mocks without url', () => {
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          { url: '/api/users', method: 'GET', body: {} },
          { method: 'GET', body: {} },
        ] as MockOptions,
      ],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(Object.keys(result)).toHaveLength(1)
  })

  it('should merge query parameters into validator', () => {
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', [{ url: '/api/users?id=123', method: 'GET', body: {} }] as MockOptions],
    ])

    const result = processMockData(mockList)

    expect(result['/api/users'][0]).toHaveProperty('validator')
    expect((result['/api/users'][0] as any).validator).toEqual({ query: { id: '123' } })
  })

  it('should merge query with existing validator', () => {
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          {
            url: '/api/users?id=123',
            method: 'GET',
            body: {},
            validator: { body: { name: 'test' } },
          },
        ] as MockOptions,
      ],
    ])

    const result = processMockData(mockList)

    expect((result['/api/users'][0] as any).validator).toEqual({
      query: { id: '123' },
      body: { name: 'test' },
    })
  })

  it('should handle multiple mocks from array input', () => {
    const mockList = [
      { url: '/api/users', method: 'GET', body: {} },
      { url: '/api/posts', method: 'GET', body: {} },
    ] as MockOptions

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(result).toHaveProperty('/api/posts')
  })

  it('should handle websocket mocks', () => {
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', [{ url: '/ws/connect', ws: true, setup: vi.fn() }]],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/ws/connect')
    expect(result['/ws/connect'][0]).toHaveProperty('ws', true)
  })

  it('should drop mocks with invalid url patterns', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          { url: '/api/users/:id*', method: 'GET', body: {} },
          { url: '/api/posts(', method: 'GET', body: {} },
          { url: '/api/users/:id', method: 'GET', body: {} },
          { url: '/api/files/*path', method: 'GET', body: {} },
          { url: '/ws/connect/:id*', ws: true, setup: vi.fn() },
        ] as MockOptions,
      ],
    ])

    const result = processMockData(mockList, logger)

    expect(result).not.toHaveProperty('/api/users/:id*')
    expect(result).not.toHaveProperty('/api/posts(')
    expect(result).not.toHaveProperty('/ws/connect/:id*')
    expect(result).toHaveProperty('/api/users/:id')
    expect(result).toHaveProperty('/api/files/*path')
    expect(logger.error).toHaveBeenCalledTimes(3)
    expect(logger.error.mock.calls[0][0]).toContain('/api/users/:id*')
  })

  it('should validate url patterns with the compiler used at request time', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
    const patterns = [
      '/',
      '/api/users',
      '/api/:id',
      '/api/:id/:id',
      '/api/{:id}',
      '/api/files/*path',
      '/api/:id?',
      '/api/:id*',
      '/api/(.*)',
    ]
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', patterns.map((url) => ({ url, method: 'GET', body: {} }))],
    ])

    const result = processMockData(mockList, logger)

    // 校验与请求期使用同一个编译器（`pathToRegexp`）：只有它可以编译的模式才会被保留，
    // 避免「校验通过但请求期抛错」的盲区
    // Validation uses the same compiler as the request matching (`pathToRegexp`), so only
    // patterns it can compile are kept: no pattern passes validation and then throws when
    // a request is matched
    const canCompile = (pattern: string): boolean => {
      try {
        pathToRegexp(pattern)
        return true
      } catch {
        return false
      }
    }
    for (const pattern of patterns) {
      expect(pattern in result).toBe(canCompile(pattern))
    }
  })

  it('should still drop invalid url patterns on repeated hot updates', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          { url: '/api/users/:id*', method: 'GET', body: {} },
          { url: '/api/users/:id', method: 'GET', body: {} },
        ] as MockOptions,
      ],
    ])

    // Simulate two hot updates with the same patterns, the cached validation
    // result must be reused without dropping the error
    // 模拟两次使用相同模式的热更新，应复用缓存的校验结果且不丢失错误信息
    const first = processMockData(mockList, logger)
    const second = processMockData(mockList, logger)

    expect(first).not.toHaveProperty('/api/users/:id*')
    expect(second).not.toHaveProperty('/api/users/:id*')
    expect(second).toHaveProperty('/api/users/:id')
    expect(logger.error).toHaveBeenCalledTimes(2)
    expect(logger.error.mock.calls[1][0]).toContain('/api/users/:id*')
  })

  it('should normalize invalid delay configs and warn', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
    const mockList = new Map<string, MockOptions>([
      [
        'file1.mock.ts',
        [
          { url: '/api/negative', delay: -100, body: {}, __filepath__: 'file1.mock.ts' },
          { url: '/api/reversed', delay: [300, 100], body: {} },
          { url: '/api/invalid', delay: [1, 2, 3], body: {} },
          { url: '/api/ok', delay: [100, 300], body: {} },
        ] as unknown as MockOptions,
      ],
    ])

    const result = processMockData(mockList, logger)

    // 负数按 0 处理、`min > max` 交换区间、无法解析的数组被丢弃
    // Negative values become 0, a reversed range is swapped, malformed arrays are dropped
    const delayOf = (url: string): unknown => (result[url][0] as any).delay
    expect(delayOf('/api/negative')).toBe(0)
    expect(delayOf('/api/reversed')).toEqual([100, 300])
    expect(delayOf('/api/invalid')).toBeUndefined()
    expect(delayOf('/api/ok')).toEqual([100, 300])
    expect(logger.warn).toHaveBeenCalledTimes(3)
    expect(String(logger.warn.mock.calls[1][0])).toContain('swapped')
    expect(String(logger.warn.mock.calls[0][0])).toContain('at (file1.mock.ts)')
  })

  it('should handle empty input', () => {
    const result = processMockData(new Map())
    expect(result).toEqual({})
  })

  it('should handle null/undefined values in map', () => {
    const mockList = new Map<string, any>([
      ['file1.mock.ts', null],
      ['file2.mock.ts', undefined],
      ['file3.mock.ts', [{ url: '/api/users', method: 'GET', body: {} }]],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(Object.keys(result)).toHaveLength(1)
  })
})

describe('sortByValidator', () => {
  it('should sort websocket mocks first', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {} },
      { url: '/ws/connect', ws: true, setup: vi.fn() },
    ] as unknown as MockOptions

    const result = sortByValidator(mocks)

    expect(result[0]).toHaveProperty('ws', true)
  })

  it('should sort function validators before object validators', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {}, validator: {} },
      { url: '/api/users', method: 'GET', body: {}, validator: () => true },
    ] as MockOptions

    const result = sortByValidator(mocks)

    expect(typeof (result[0] as any).validator).toBe('function')
  })

  it('should sort object validators by key count', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {}, validator: { query: { id: '1' } } },
      {
        url: '/api/users',
        method: 'GET',
        body: {},
        validator: { query: { id: '1', name: 'test' } },
      },
    ] as MockOptions

    const result = sortByValidator(mocks)

    // More specific validator should come first
    expect((result[0] as any).validator).toEqual({ query: { id: '1', name: 'test' } })
  })

  it('should sort mocks without validator last', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {} },
      { url: '/api/users', method: 'GET', body: {}, validator: { query: { id: '1' } } },
    ] as MockOptions

    const result = sortByValidator(mocks)

    expect(result[result.length - 1]).not.toHaveProperty('validator')
  })

  it('should handle complex validator sorting', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {} },
      { url: '/api/users', method: 'GET', body: {}, validator: { query: { id: '1' } } },
      { url: '/api/users', method: 'GET', body: {}, validator: () => true },
      { url: '/ws', ws: true, setup: vi.fn() },
    ] as unknown as MockOptions

    const result = sortByValidator(mocks)

    // Both ws and function validator have priority 0, so they could be in any order at the start
    const firstTwo = result.slice(0, 2)
    expect(firstTwo.some((item) => item.ws === true)).toBe(true)
    expect(firstTwo.some((item) => typeof (item as any).validator === 'function')).toBe(true)
    expect((result[2] as any).validator).toHaveProperty('query')
    expect(result[3]).not.toHaveProperty('validator')
  })

  it('should sort scene mocks before universal mocks even if the latter has a function validator', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {}, validator: () => true },
      {
        url: '/api/users',
        method: 'GET',
        body: {},
        scene: 'test',
        validator: { query: { id: '1', name: 'test' } },
      },
    ] as MockOptions

    const result = sortByValidator(mocks)

    // 配置了 scene 的 mock 优先级最高，validator 不应该跨越它
    expect((result[0] as any).scene).toBe('test')
  })

  it('should sort scene mocks before universal mocks with the same validator type', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {} },
      { url: '/api/users', method: 'GET', body: {}, scene: 'test' },
    ] as MockOptions

    const result = sortByValidator(mocks)

    expect((result[0] as any).scene).toBe('test')
  })

  it('should sort by validator priority within the same scene', () => {
    const mocks: MockOptions = [
      { url: '/api/users', method: 'GET', body: {}, scene: 'test' },
      {
        url: '/api/users',
        method: 'GET',
        body: {},
        scene: 'test',
        validator: { query: { id: '1' } },
      },
      { url: '/api/users', method: 'GET', body: {}, scene: 'test', validator: () => true },
    ] as MockOptions

    const result = sortByValidator(mocks)

    expect(typeof (result[0] as any).validator).toBe('function')
    expect((result[1] as any).validator).toEqual({ query: { id: '1' } })
    expect(result[2]).not.toHaveProperty('validator')
  })

  it('should sort scene mocks by key count within the same validator type', () => {
    const mocks: MockOptions = [
      {
        url: '/api/users',
        method: 'GET',
        body: {},
        scene: 'test',
        validator: { query: { id: '1' } },
      },
      {
        url: '/api/users',
        method: 'GET',
        body: {},
        scene: 'test',
        validator: { query: { id: '1', name: 'test' } },
      },
    ] as MockOptions

    const result = sortByValidator(mocks)

    expect((result[0] as any).validator).toEqual({ query: { id: '1', name: 'test' } })
  })

  it('should handle empty array', () => {
    const result = sortByValidator([])
    expect(result).toEqual([])
  })

  it('should handle mocks with same priority', () => {
    const mocks: MockOptions = [
      { url: '/api/a', method: 'GET', body: {} },
      { url: '/api/b', method: 'GET', body: {} },
    ] as MockOptions

    const result = sortByValidator(mocks)

    expect(result).toHaveLength(2)
  })
})
