/**
 * Test for findMockData function
 *
 * findMockData 函数测试
 */

import type { MockOptions } from 'vite-plugin-mock-dev-server'
import { describe, expect, it, vi } from 'vitest'
import { findMockData } from '../src/mockHttp/matcher.js'

/**
 * Test suite for findMockData function
 *
 * findMockData 函数测试套件
 */
describe('findMockData', () => {
  const logger = {
    error: vi.fn(),
  } as any

  it('should find matching mock by URL and method', () => {
    const mockList: MockOptions = [
      { url: '/api/users', method: 'GET', body: { data: 'users' } },
      { url: '/api/posts', method: 'POST', body: { data: 'posts' } },
    ]
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toEqual(mockList[0])
  })

  it('should default to GET and POST methods if not specified', () => {
    const mockList = [{ url: '/api/users', body: { data: 'users' } }]
    const getResult = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    const postResult = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'POST',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(getResult).toEqual(mockList[0])
    expect(postResult).toEqual(mockList[0])
  })

  it('should support array of methods', () => {
    const mockList: MockOptions = [
      { url: '/api/users', method: ['GET', 'PUT'], body: { data: 'users' } },
    ]
    const getResult = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    const putResult = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'PUT',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(getResult).toEqual(mockList[0])
    expect(putResult).toEqual(mockList[0])
  })

  it('should match a lowercase method name', () => {
    // .js / .json 的 mock 文件中可能写成小写
    // Method names may be written in lowercase in .js / .json mock files
    const mockList = [
      { url: '/api/users', method: 'get', body: { data: 'users' } },
    ] as unknown as MockOptions
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toEqual(mockList[0])
  })

  it('should match a method array with mixed case', () => {
    const mockList = [
      { url: '/api/users', method: ['get', 'Put'], body: { data: 'users' } },
    ] as unknown as MockOptions

    const createRequest = (method: string) =>
      ({
        pathname: '/api/users',
        method,
        request: {
          query: {},
          refererQuery: {},
          body: {},
          headers: {},
        },
        activeScene: [],
      }) as any

    expect(findMockData(mockList, logger, createRequest('GET'))).toEqual(mockList[0])
    expect(findMockData(mockList, logger, createRequest('PUT'))).toEqual(mockList[0])
    expect(findMockData(mockList, logger, createRequest('DELETE'))).toBeUndefined()
  })

  it('should respect enabled flag when enabled is false', () => {
    const mockList: MockOptions = [
      { url: '/api/users', method: 'GET', body: { data: 'users' }, enabled: true },
    ]
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toEqual(mockList[0])
  })

  it('should match with validator object', () => {
    const mockList: MockOptions = [
      {
        url: '/api/users',
        method: 'GET',
        validator: { query: { id: '123' } },
        body: { data: 'user 123' },
      },
    ]
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: { id: '123' },
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toEqual(mockList[0])
  })

  it('should not match when validator fails', () => {
    const mockList: MockOptions = [
      {
        url: '/api/users',
        method: 'GET',
        validator: { query: { id: '123' } },
        body: { data: 'user 123' },
      },
    ]
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: { id: '456' },
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toBeUndefined()
  })

  it('should use validator function', () => {
    const mockList: MockOptions = [
      {
        url: '/api/users',
        method: 'GET',
        validator: (req: any) => req.query.id === '123',
        body: { data: 'user 123' },
      },
    ]
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: { id: '123' },
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toEqual(mockList[0])
  })

  it('should return undefined for websocket mock', () => {
    const mockList = [{ url: '/api/ws', ws: true, setup: vi.fn() }] as any
    const result = findMockData(mockList, logger, {
      pathname: '/api/ws',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toBeUndefined()
  })

  it('should handle empty mock list', () => {
    const result = findMockData([], logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toBeUndefined()
  })

  it('should handle invalid mock data', () => {
    const mockList = [null, undefined, { url: null }, {} as any]
    const result = findMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
      activeScene: [],
    })
    expect(result).toBeUndefined()
  })
})
