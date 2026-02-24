/**
 * Extended tests for request module
 *
 * 请求模块扩展测试
 */

import { describe, expect, it } from 'vitest'
import { parseRequestParams, requestLog, requestValidate } from '../src/core/request'

describe('parseRequestParams', () => {
  it('should parse simple parameter', () => {
    const result = parseRequestParams('/api/users/:id', '/api/users/123')
    expect(result).toEqual({ id: '123' })
  })

  it('should parse multiple parameters', () => {
    const result = parseRequestParams('/api/users/:userId/posts/:postId', '/api/users/42/posts/99')
    expect(result).toEqual({ userId: '42', postId: '99' })
  })

  it('should handle optional parameters', () => {
    const result = parseRequestParams('/api/users{/:id}', '/api/users')
    expect(result).toEqual({})
  })

  it('should handle optional parameters with value', () => {
    const result = parseRequestParams('/api/users{/:id}', '/api/users/123')
    expect(result).toEqual({ id: '123' })
  })

  it('should handle wildcard parameters', () => {
    const result = parseRequestParams('/api/*path', '/api/users/123/posts')
    expect(result).toEqual({ path: ['users', '123', 'posts'] })
  })

  it('should handle encoded parameters', () => {
    const result = parseRequestParams('/api/users/:name', '/api/users/John%20Doe')
    expect(result).toEqual({ name: 'John Doe' })
  })

  it('should return empty object for non-matching path', () => {
    const result = parseRequestParams('/api/users/:id', '/api/posts/123')
    expect(result).toEqual({})
  })

  it('should cache compiled patterns', () => {
    // First call
    const result1 = parseRequestParams('/api/users/:id', '/api/users/123')
    // Second call with same pattern (should use cache)
    const result2 = parseRequestParams('/api/users/:id', '/api/users/456')
    expect(result1).toEqual({ id: '123' })
    expect(result2).toEqual({ id: '456' })
  })

  it('should handle complex patterns with optional segments', () => {
    const result1 = parseRequestParams('/api{/:version}/users', '/api/users')
    expect(result1).toEqual({})

    const result2 = parseRequestParams('/api{/:version}/users', '/api/v1/users')
    expect(result2).toEqual({ version: 'v1' })
  })
})

describe('requestValidate', () => {
  it('should validate matching query', () => {
    const request = {
      query: { id: '123', name: 'test' },
      body: {},
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    const validator = { query: { id: '123' } }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should reject non-matching query', () => {
    const request = {
      query: { id: '456', name: 'test' },
      body: {},
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    const validator = { query: { id: '123' } }
    expect(requestValidate(request, validator)).toBe(false)
  })

  it('should validate matching body', () => {
    const request = {
      query: {},
      body: { username: 'admin', password: 'secret' },
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    const validator = { body: { username: 'admin' } }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should validate matching params', () => {
    const request = {
      query: {},
      body: {},
      params: { id: '123', action: 'edit' },
      headers: {},
      refererQuery: {},
    } as any

    const validator = { params: { id: '123' } }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should validate matching headers', () => {
    const request = {
      query: {},
      body: {},
      params: {},
      headers: { 'content-type': 'application/json', 'x-custom': 'value' },
      refererQuery: {},
    } as any

    const validator = { headers: { 'content-type': 'application/json' } }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should validate matching refererQuery', () => {
    const request = {
      query: {},
      body: {},
      params: {},
      headers: {},
      refererQuery: { ref: 'homepage' },
    } as any

    const validator = { refererQuery: { ref: 'homepage' } }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should validate multiple conditions', () => {
    const request = {
      query: { version: '1' },
      body: { name: 'test' },
      params: { id: '123' },
      headers: {},
      refererQuery: {},
    } as any

    const validator = {
      query: { version: '1' },
      body: { name: 'test' },
      params: { id: '123' },
    }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should reject when any condition fails', () => {
    const request = {
      query: { version: '1' },
      body: { name: 'wrong' },
      params: { id: '123' },
      headers: {},
      refererQuery: {},
    } as any

    const validator = {
      query: { version: '1' },
      body: { name: 'test' },
      params: { id: '123' },
    }
    expect(requestValidate(request, validator)).toBe(false)
  })

  it('should handle empty validator', () => {
    const request = {
      query: { id: '123' },
      body: {},
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    expect(requestValidate(request, {})).toBe(true)
  })

  it('should handle nested object validation', () => {
    const request = {
      query: {},
      body: {
        user: {
          profile: {
            name: 'John',
          },
        },
      },
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    const validator = {
      body: {
        user: {
          profile: {
            name: 'John',
          },
        },
      },
    }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should handle array values in query', () => {
    const request = {
      query: { tags: ['a', 'b', 'c'] },
      body: {},
      params: {},
      headers: {},
      refererQuery: {},
    } as any

    const validator = { query: { tags: ['a', 'b', 'c'] } }
    expect(requestValidate(request, validator)).toBe(true)
  })
})

describe('requestLog', () => {
  it('should format basic request log', () => {
    const request = {
      url: '/api/users',
      method: 'GET',
      query: {},
      params: {},
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('GET')
    expect(log).toContain('/api/users')
    expect(log).toContain('test.mock.ts')
  })

  it('should include query parameters in log', () => {
    const request = {
      url: '/api/users?id=123',
      method: 'GET',
      query: { id: '123' },
      params: {},
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('query:')
    expect(log).toContain('"id":"123"')
  })

  it('should include params in log', () => {
    const request = {
      url: '/api/users/123',
      method: 'GET',
      query: {},
      params: { id: '123' },
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('params:')
    expect(log).toContain('"id":"123"')
  })

  it('should include body in log', () => {
    const request = {
      url: '/api/users',
      method: 'POST',
      query: {},
      params: {},
      body: { name: 'test' },
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('body:')
    expect(log).toContain('"name":"test"')
  })

  it('should handle URL with query string', () => {
    const request = {
      url: '/api/users?id=123&name=test',
      method: 'GET',
      query: { id: '123', name: 'test' },
      params: {},
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('/api/users')
    expect(log).not.toContain('?id=123&name=test')
  })

  it('should handle encoded URL path', () => {
    const request = {
      url: '/api/users/John%20Doe',
      method: 'GET',
      query: {},
      params: { name: 'John Doe' },
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('/api/users/John Doe')
  })

  it('should indicate error simulation in log', () => {
    const request = {
      url: '/api/users',
      method: 'GET',
      query: {},
      params: {},
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts', true)
    expect(log).toContain('ERR')
  })

  it('should handle empty request data', () => {
    const request = {
      url: '/api/users',
      method: 'GET',
      query: {},
      params: {},
      body: {},
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('GET')
    expect(log).toContain('/api/users')
  })

  it('should handle complex request data', () => {
    const request = {
      url: '/api/users?id=123',
      method: 'POST',
      query: { id: '123' },
      params: { userId: '456' },
      body: { name: 'test', email: 'test@example.com' },
    } as any

    const log = requestLog(request, 'test.mock.ts')
    expect(log).toContain('POST')
    expect(log).toContain('query:')
    expect(log).toContain('params:')
    expect(log).toContain('body:')
  })
})
