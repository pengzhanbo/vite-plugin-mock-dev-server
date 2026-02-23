/**
 * Test for utility functions
 *
 * 工具函数测试
 */
import { describe, expect, it } from 'vitest'
import {
  createMatcher,
  doesProxyContextMatchUrl,
  isPathMatch,
  urlParse,
} from '../src/utils'

/**
 * Test suite for urlParse function
 *
 * urlParse 函数测试套件
 */
describe('urlParse', () => {
  it('should parse URL with pathname only', () => {
    const result = urlParse('/api/users')
    expect(result.pathname).toBe('/api/users')
    expect(result.query).toEqual({})
  })

  it('should parse URL with query parameters', () => {
    const result = urlParse('/api/users?id=123&name=test')
    expect(result.pathname).toBe('/api/users')
    expect(result.query).toEqual({ id: '123', name: 'test' })
  })

  it('should parse URL with special characters', () => {
    const result = urlParse('/api/users?name=%E4%BD%A0%E5%A5%BD')
    expect(result.pathname).toBe('/api/users')
    expect(result.query).toEqual({ name: '你好' })
  })

  it('should parse URL with encoded pathname', () => {
    const result = urlParse('/api/%7Buser%7D')
    expect(result.pathname).toBe('/api/{user}')
    expect(result.query).toEqual({})
  })

  it('should parse URL with multiple same query keys', () => {
    const result = urlParse('/api/users?tag=1&tag=2&tag=3')
    expect(result.pathname).toBe('/api/users')
    expect(result.query).toEqual({ tag: ['1', '2', '3'] })
  })

  it('should parse URL with empty query', () => {
    const result = urlParse('/api/users?')
    expect(result.pathname).toBe('/api/users')
    expect(result.query).toEqual({})
  })
})

/**
 * Test suite for isPathMatch function
 *
 * isPathMatch 函数测试套件
 */
describe('isPathMatch', () => {
  it('should match exact path', () => {
    expect(isPathMatch('/api/users', '/api/users')).toBe(true)
    expect(isPathMatch('/api/users', '/api/posts')).toBe(false)
  })

  it('should match path with parameters', () => {
    expect(isPathMatch('/api/users/:id', '/api/users/123')).toBe(true)
    expect(isPathMatch('/api/users/:id', '/api/posts/123')).toBe(false)
  })

  it('should match path with wildcard', () => {
    expect(isPathMatch('/api/*rest', '/api/users')).toBe(true)
    expect(isPathMatch('/api/*rest', '/api/users/123')).toBe(true)
  })

  it('should match path with optional segments', () => {
    expect(isPathMatch('/api{/:version}', '/api')).toBe(true)
    expect(isPathMatch('/api{/:version}', '/api/v1')).toBe(true)
  })

  it('should match path with complex parameters', () => {
    expect(isPathMatch('/api/users/:id/posts/:postId', '/api/users/123/posts/456')).toBe(true)
  })

  it('should not match different path structures', () => {
    expect(isPathMatch('/api/users/:id', '/api/users')).toBe(false)
    expect(isPathMatch('/api/users', '/api/users/123')).toBe(false)
  })
})

/**
 * Test suite for createMatcher function
 *
 * createMatcher 函数测试套件
 */
describe('createMatcher', () => {
  it('should create matcher with single include pattern', () => {
    const matcher = createMatcher('**/*.mock.ts', [])
    expect(matcher.isMatch('user.mock.ts')).toBe(true)
    expect(matcher.isMatch('user.ts')).toBe(false)
  })

  it('should create matcher with multiple include patterns', () => {
    const matcher = createMatcher(['**/*.mock.ts', '**/*.mock.js'], [])
    expect(matcher.isMatch('user.mock.ts')).toBe(true)
    expect(matcher.isMatch('user.mock.js')).toBe(true)
    expect(matcher.isMatch('user.ts')).toBe(false)
  })

  it('should exclude files with exclude patterns', () => {
    const matcher = createMatcher('**/*.mock.ts', '**/node_modules/**')
    expect(matcher.ignore).toContain('**/node_modules/**')
    expect(matcher.isMatch('user.mock.ts')).toBe(true)
  })

  it('should handle exclude patterns in include', () => {
    const matcher = createMatcher(['**/*.mock.ts', '!**/test/**'], [])
    expect(matcher.ignore).toContain('**/test/**')
  })
})

/**
 * Test suite for doesProxyContextMatchUrl function
 *
 * doesProxyContextMatchUrl 函数测试套件
 */
describe('doesProxyContextMatchUrl', () => {
  it('should match URL with prefix', () => {
    expect(doesProxyContextMatchUrl('/api', '/api/users')).toBe(true)
    expect(doesProxyContextMatchUrl('/api', '/post')).toBe(false)
  })

  it('should match URL with regex pattern', () => {
    expect(doesProxyContextMatchUrl('^/api', '/api/users')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/v\\d+', '/api/v1/users')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/v\\d+', '/api/users')).toBe(false)
  })

  it('should match exact regex', () => {
    expect(doesProxyContextMatchUrl('^/api/users$', '/api/users')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/users$', '/api/users/123')).toBe(false)
  })
})
