/**
 * Tests for compiler module
 *
 * 编译器模块测试
 */
import type { MockOptions } from '../src/types'
import { describe, expect, it, vi } from 'vitest'
import { processMockData, processRawData, sortByValidator } from '../src/compiler/processData'

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
      users: [
        { url: '/api/users', method: 'GET', body: { id: 1 } },
      ],
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
      ['file1.mock.ts', [
        { url: '/api/users', method: 'GET', body: {} },
        { url: '/api/posts', method: 'GET', body: {} },
      ] as MockOptions],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(result).toHaveProperty('/api/posts')
    expect(result['/api/users']).toHaveLength(1)
    expect(result['/api/posts']).toHaveLength(1)
  })

  it('should filter out disabled mocks', () => {
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', [
        { url: '/api/users', method: 'GET', body: {}, enabled: true },
        { url: '/api/posts', method: 'GET', body: {}, enabled: false },
      ] as MockOptions],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(result).not.toHaveProperty('/api/posts')
  })

  it('should filter out mocks without url', () => {
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', [
        { url: '/api/users', method: 'GET', body: {} },
        { method: 'GET', body: {} },
      ] as MockOptions],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/api/users')
    expect(Object.keys(result)).toHaveLength(1)
  })

  it('should merge query parameters into validator', () => {
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', [
        { url: '/api/users?id=123', method: 'GET', body: {} },
      ] as MockOptions],
    ])

    const result = processMockData(mockList)

    expect(result['/api/users'][0]).toHaveProperty('validator')
    expect((result['/api/users'][0] as any).validator).toEqual({ query: { id: '123' } })
  })

  it('should merge query with existing validator', () => {
    const mockList = new Map<string, MockOptions>([
      ['file1.mock.ts', [
        { url: '/api/users?id=123', method: 'GET', body: {}, validator: { body: { name: 'test' } } },
      ] as MockOptions],
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
      ['file1.mock.ts', [
        { url: '/ws/connect', ws: true, setup: vi.fn() },
      ] as unknown as MockOptions],
    ])

    const result = processMockData(mockList)

    expect(result).toHaveProperty('/ws/connect')
    expect(result['/ws/connect'][0]).toHaveProperty('ws', true)
  })

  it('should handle empty input', () => {
    const result = processMockData(new Map())
    expect(result).toEqual({})
  })

  it('should handle null/undefined values in map', () => {
    const mockList = new Map<string, any>([
      ['file1.mock.ts', null],
      ['file2.mock.ts', undefined],
      ['file3.mock.ts', [
        { url: '/api/users', method: 'GET', body: {} },
      ]],
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
      { url: '/api/users', method: 'GET', body: {}, validator: { query: { id: '1', name: 'test' } } },
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
    expect(firstTwo.some(item => item.ws === true)).toBe(true)
    expect(firstTwo.some(item => typeof (item as any).validator === 'function')).toBe(true)
    expect((result[2] as any).validator).toHaveProperty('query')
    expect(result[3]).not.toHaveProperty('validator')
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
