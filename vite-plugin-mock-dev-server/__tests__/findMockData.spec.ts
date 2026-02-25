/**
 * Test for findMockData function
 *
 * findMockData 函数测试
 */

import type { MockOptions } from 'vite-plugin-mock-dev-server/src'
import { describe, expect, it, vi } from 'vitest'
import { fineMockData } from '../src/mockHttp/matcher'

/**
 * Test suite for fineMockData function
 *
 * fineMockData 函数测试套件
 */
describe('fineMockData', () => {
  const logger = {
    error: vi.fn(),
  } as any

  it('should find matching mock by URL and method', () => {
    const mockList: MockOptions = [
      { url: '/api/users', method: 'GET', body: { data: 'users' } },
      { url: '/api/posts', method: 'POST', body: { data: 'posts' } },
    ]
    const result = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(result).toEqual(mockList[0])
  })

  it('should default to GET and POST methods if not specified', () => {
    const mockList = [
      { url: '/api/users', body: { data: 'users' } },
    ]
    const getResult = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    const postResult = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'POST',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(getResult).toEqual(mockList[0])
    expect(postResult).toEqual(mockList[0])
  })

  it('should support array of methods', () => {
    const mockList: MockOptions = [
      { url: '/api/users', method: ['GET', 'PUT'], body: { data: 'users' } },
    ]
    const getResult = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    const putResult = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'PUT',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(getResult).toEqual(mockList[0])
    expect(putResult).toEqual(mockList[0])
  })

  it('should respect enabled flag when enabled is false', () => {
    const mockList: MockOptions = [
      { url: '/api/users', method: 'GET', body: { data: 'users' }, enabled: true },
    ]
    const result = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
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
    const result = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: { id: '123' },
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
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
    const result = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: { id: '456' },
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
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
    const result = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: { id: '123' },
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(result).toEqual(mockList[0])
  })

  it('should return undefined for websocket mock', () => {
    const mockList = [
      { url: '/api/ws', ws: true, setup: vi.fn() },
    ] as any
    const result = fineMockData(mockList, logger, {
      pathname: '/api/ws',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(result).toBeUndefined()
  })

  it('should handle empty mock list', () => {
    const result = fineMockData([], logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(result).toBeUndefined()
  })

  it('should handle invalid mock data', () => {
    const mockList = [
      null,
      undefined,
      { url: null },
      {} as any,
    ]
    const result = fineMockData(mockList, logger, {
      pathname: '/api/users',
      method: 'GET',
      request: {
        query: {},
        refererQuery: {},
        body: {},
        headers: {},
      } as any,
    })
    expect(result).toBeUndefined()
  })
})
