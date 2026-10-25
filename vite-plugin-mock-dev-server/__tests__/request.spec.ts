/**
 * Test for request handling functions
 *
 * 请求处理函数测试
 */
import { describe, expect, it } from 'vitest'
import { parseRequestParams } from '../src/mockHttp/request-params.js'
import { requestValidate } from '../src/mockHttp/request-validate.js'

/**
 * Test suite for parseRequestParams function
 *
 * parseRequestParams 函数测试套件
 */
describe('parseRequestParams', () => {
  it('should parse simple parameters', () => {
    const params = parseRequestParams('/api/users/:id', '/api/users/123')
    expect(params).toEqual({ id: '123' })
  })

  it('should parse multiple parameters', () => {
    const params = parseRequestParams('/api/users/:id/posts/:postId', '/api/users/123/posts/456')
    expect(params).toEqual({ id: '123', postId: '456' })
  })

  it('should parse encoded parameters', () => {
    const params = parseRequestParams('/api/users/:name', '/api/users/%E4%BD%A0%E5%A5%BD')
    expect(params).toEqual({ name: '你好' })
  })

  it('should return empty object when no match', () => {
    const params = parseRequestParams('/api/users/:id', '/api/posts')
    expect(params).toEqual({})
  })

  it('should parse wildcard parameters', () => {
    const params = parseRequestParams('/api/*path', '/api/users/123/posts')
    expect(params.path).toEqual(['users', '123', 'posts'])
  })

  it('should use cache for repeated patterns', () => {
    const params1 = parseRequestParams('/api/users/:id', '/api/users/123')
    const params2 = parseRequestParams('/api/users/:id', '/api/users/456')
    expect(params1).toEqual({ id: '123' })
    expect(params2).toEqual({ id: '456' })
  })

  it('should not throw on malformed percent-encoded parameters', () => {
    // `100%` cannot be decoded by `decodeURIComponent`: the raw value must be kept,
    // otherwise the request fails with 500 (or even crashes the upgrade handler)
    // `100%` 无法被 `decodeURIComponent` 解码：应保留原始值，
    // 否则请求会变成 500（在 upgrade 处理器中甚至会导致进程崩溃）
    const params = parseRequestParams('/api/users/:id', '/api/users/100%')
    expect(params).toEqual({ id: '100%' })
  })
})

/**
 * Test suite for requestValidate function
 *
 * requestValidate 函数测试套件
 */
describe('requestValidate', () => {
  const baseRequest = {
    query: { id: '123', name: 'test' },
    params: { userId: '456' },
    body: { data: 'test' },
    headers: { 'content-type': 'application/json' },
    refererQuery: { page: '1' },
  } as any

  it('should validate with empty validator', () => {
    expect(requestValidate(baseRequest, {})).toBe(true)
  })

  it('should validate matching query parameters', () => {
    expect(requestValidate(baseRequest, { query: { id: '123' } })).toBe(true)
    expect(requestValidate(baseRequest, { query: { id: '456' } })).toBe(false)
  })

  it('should validate matching params parameters', () => {
    expect(requestValidate(baseRequest, { params: { userId: '456' } })).toBe(true)
    expect(requestValidate(baseRequest, { params: { userId: '789' } })).toBe(false)
  })

  it('should validate matching body parameters', () => {
    expect(requestValidate(baseRequest, { body: { data: 'test' } })).toBe(true)
    expect(requestValidate(baseRequest, { body: { data: 'wrong' } })).toBe(false)
  })

  it('should validate matching headers', () => {
    expect(requestValidate(baseRequest, { headers: { 'content-type': 'application/json' } })).toBe(
      true,
    )
  })

  it('should validate multiple conditions', () => {
    expect(
      requestValidate(baseRequest, {
        query: { id: '123' },
        params: { userId: '456' },
      }),
    ).toBe(true)
  })

  it('should fail if any condition fails', () => {
    expect(
      requestValidate(baseRequest, {
        query: { id: '123' },
        params: { userId: '789' },
      }),
    ).toBe(false)
  })

  it('should validate with deep object comparison', () => {
    const request = {
      body: {
        user: {
          name: 'test',
          age: 25,
        },
      },
    } as any

    expect(
      requestValidate(request, {
        body: { user: { name: 'test' } },
      }),
    ).toBe(true)
  })

  it('should treat a missing body as a mismatch instead of throwing', () => {
    // GET 请求没有请求体时，request.body 为 undefined
    // A GET request has no body, so `request.body` is undefined
    const request = {
      query: {},
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    expect(() => requestValidate(request, { body: { data: 'test' } })).not.toThrow()
    expect(requestValidate(request, { body: { data: 'test' } })).toBe(false)
    expect(requestValidate(request, { body: {} })).toBe(true)
  })
})
