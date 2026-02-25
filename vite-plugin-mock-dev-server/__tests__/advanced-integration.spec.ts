/**
 * Advanced integration tests
 *
 * 高级集成测试
 */
import { describe, expect, it } from 'vitest'
import { matchingWeight } from '../src/mockHttp/matchingWeight'
import { parseRequestParams, requestValidate } from '../src/mockHttp/request'
import {
  createMatcher,
  doesProxyContextMatchUrl,
  isObjectSubset,
  isPathMatch,
  urlParse,
} from '../src/utils'

/**
 * Test suite for complex URL parsing scenarios
 *
 * 复杂 URL 解析场景测试套件
 */
describe('advanced integration: complex URL scenarios', () => {
  it('should handle URL with query string containing special characters', () => {
    const url = '/api/search?q=test+query&filter=active&page=1'
    const result = urlParse(url)
    expect(result.pathname).toBe('/api/search')
    expect(result.query.q).toBe('test query')
    expect(result.query.filter).toBe('active')
    expect(result.query.page).toBe('1')
  })

  it('should handle URL with nested query parameters', () => {
    const url = '/api/data?user[name]=test&user[age]=25&tags[]=a&tags[]=b'
    const result = urlParse(url)
    expect(result.pathname).toBe('/api/data')
    expect(result.query['user[name]']).toBe('test')
    expect(result.query['user[age]']).toBe('25')
  })

  it('should handle URL with encoded special characters in path', () => {
    const url = '/api/users/test%20space'
    const result = urlParse(url)
    expect(result.pathname).toBe('/api/users/test space')
  })

  it('should handle empty query string', () => {
    const result = urlParse('/api/data?')
    expect(result.pathname).toBe('/api/data')
    expect(result.query).toEqual({})
  })
})

/**
 * Test suite for complex path matching scenarios
 *
 * 复杂路径匹配场景测试套件
 */
describe('advanced integration: complex path matching', () => {
  it('should match nested dynamic parameters', () => {
    const pattern = '/api/:org/:repo/:branch/*rest'
    const url = '/api/myorg/myrepo/main/src/index.ts'
    expect(isPathMatch(pattern, url)).toBe(true)
  })

  it('should handle optional groups with multiple segments', () => {
    const pattern = '/api{/:version}/users{/:id}'
    expect(isPathMatch(pattern, '/api/users')).toBe(true)
    expect(isPathMatch(pattern, '/api/v1/users')).toBe(true)
    expect(isPathMatch(pattern, '/api/v1/users/123')).toBe(true)
    expect(isPathMatch(pattern, '/api/users/123')).toBe(true)
  })

  it('should handle mixed parameter types', () => {
    const pattern = '/api/:category/products/:id'
    const url = '/api/electronics/products/123'
    expect(isPathMatch(pattern, url)).toBe(true)

    const params = parseRequestParams(pattern, url)
    expect(params.category).toBe('electronics')
    expect(params.id).toBe('123')
  })
})

/**
 * Test suite for complex object subset validation
 *
 * 复杂对象子集验证测试套件
 */
describe('advanced integration: complex object validation', () => {
  it('should validate deep nested objects', () => {
    const source = {
      user: {
        profile: {
          name: 'John',
          age: 30,
          address: {
            city: 'New York',
            zip: '10001',
          },
        },
      },
    }
    const target = {
      user: {
        profile: {
          name: 'John',
          address: {
            city: 'New York',
          },
        },
      },
    }
    expect(isObjectSubset(source, target)).toBe(true)
  })

  it('should validate arrays with mixed types', () => {
    const source = {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ],
    }
    const target = {
      items: [
        { id: 2, name: 'Item 2' },
      ],
    }
    expect(isObjectSubset(source, target)).toBe(true)
  })

  it('should handle NaN values correctly', () => {
    const source = { value: Number.NaN }
    const target = { value: Number.NaN }
    expect(isObjectSubset(source, target)).toBe(true)
  })

  it('should handle special number values', () => {
    const source = { zero: 0, negZero: -0, positive: 1, negative: -1 }
    const target = { zero: 0, negZero: -0 }
    expect(isObjectSubset(source, target)).toBe(true)
  })
})

/**
 * Test suite for complex request validation scenarios
 *
 * 复杂请求验证场景测试套件
 */
describe('advanced integration: complex request validation', () => {
  it('should validate with multiple conditions', () => {
    const request = {
      query: { id: '123', type: 'admin' },
      params: { userId: '456' },
      body: { data: { active: true, role: 'manager' } },
      headers: { 'content-type': 'application/json', 'x-token': 'abc123' },
      refererQuery: { from: 'dashboard' },
    } as any
    const validator = {
      query: { id: '123', type: 'admin' },
      body: { data: { active: true } },
      headers: { 'content-type': 'application/json' },
    }
    expect(requestValidate(request, validator)).toBe(true)
  })

  it('should fail validation when any condition fails', () => {
    const request = {
      query: { id: '123', type: 'user' },
      params: {},
      body: {},
      headers: {},
      refererQuery: {},
    } as any
    const validator = {
      query: { id: '123', type: 'admin' },
    }
    expect(requestValidate(request, validator)).toBe(false)
  })
})

/**
 * Test suite for complex matching weight scenarios
 *
 * 复杂匹配权重场景测试套件
 */
describe('advanced integration: complex matching weight', () => {
  it('should handle very complex matching scenarios', () => {
    const rules = [
      '/api/users',
      '/api/users/:id',
      '/api/users/:id/posts',
      '/api/users/:id/posts/:postId',
      '/api/*rest',
      '/api{/*rest}',
      '/api/users/:id{/*rest}',
    ]

    const url1 = '/api/users/123/posts/456'
    const result1 = matchingWeight(rules, url1, {})
    expect(result1[0]).toBe('/api/users/:id/posts/:postId')

    const url2 = '/api/users/123'
    const result2 = matchingWeight(rules, url2, {})
    expect(result2[0]).toBe('/api/users/:id')
  })

  it('should handle global priority with complex rules', () => {
    const rules = [
      '/api/:a/:b/:c',
      '/api/:a/b/:c',
      '/api/a/:b/:c',
      '/api/a/b/:c',
    ]
    const priority = {
      global: ['/api/a/:b/:c', '/api/:a/b/:c'],
    }

    const result = matchingWeight(rules, '/api/a/x/y', priority)
    expect(result[0]).toBe('/api/a/:b/:c')
  })
})

/**
 * Test suite for file matching scenarios
 *
 * 文件匹配场景测试套件
 */
describe('advanced integration: file matching', () => {
  it('should handle complex include/exclude patterns', () => {
    const matcher = createMatcher(
      ['**/*.mock.ts', '**/*.mock.js', '!**/node_modules/**'],
      ['**/test/**', '**/*.spec.ts'],
    )

    expect(matcher.isMatch('user.mock.ts')).toBe(true)
    expect(matcher.isMatch('post.mock.js')).toBe(true)
    expect(matcher.isMatch('node_modules/dep/user.mock.ts')).toBe(false)
    expect(matcher.isMatch('test/user.mock.ts')).toBe(false)
  })

  it('should handle negation patterns in include', () => {
    const matcher = createMatcher(
      ['**/*.mock.ts', '!**/legacy/**'],
      [],
    )

    expect(matcher.isMatch('user.mock.ts')).toBe(true)
    expect(matcher.isMatch('legacy/user.mock.ts')).toBe(false)
    expect(matcher.ignore).toContain('**/legacy/**')
  })
})

/**
 * Test suite for proxy context matching
 *
 * 代理上下文匹配测试套件
 */
describe('advanced integration: proxy context matching', () => {
  it('should handle regex patterns with modifiers', () => {
    expect(doesProxyContextMatchUrl('^/api/v\\d+', '/api/v1/users')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/v\\d+', '/api/v2/posts')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/v\\d+', '/api/users')).toBe(false)
  })

  it('should handle exact match regex patterns', () => {
    expect(doesProxyContextMatchUrl('^/api/users$', '/api/users')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/users$', '/api/users/123')).toBe(false)
  })

  it('should handle mixed proxy types', () => {
    expect(doesProxyContextMatchUrl('/api', '/api/users')).toBe(true)
    expect(doesProxyContextMatchUrl('^/api/v\\d+', '/api/v1/users')).toBe(true)
    expect(doesProxyContextMatchUrl('/other', '/api/users')).toBe(false)
  })
})
