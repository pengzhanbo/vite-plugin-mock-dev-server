/**
 * Integration tests for mock server
 *
 * Mock 服务器集成测试
 */
import { describe, expect, it } from 'vitest'
import { matchingWeight } from '../src/core/matchingWeight'

/**
 * Test suite for matching weight with complex scenarios
 *
 * 复杂场景下的匹配权重测试套件
 */
describe('integration: matching weight with priority', () => {
  it('should apply global priority rules', () => {
    const rules = [
      '/api/:a/:b',
      '/api/a/:b',
      '/api/:a/b',
      '/api/a/b',
    ]
    const priority = {
      global: ['/api/:a/b', '/api/a/:b'],
    }
    const result = matchingWeight(rules, '/api/a/b', priority)
    expect(result[0]).toBe('/api/a/b')
    expect(result[1]).toBe('/api/:a/b')
    expect(result[2]).toBe('/api/a/:b')
  })

  it('should apply special priority rules', () => {
    const rules = [
      '/api/:a/:b/c',
      '/api/a/:b/c',
      '/api/:a/b/c',
    ]
    const priority = {
      special: {
        '/api/:a/b/c': ['/api/a/:b/c'],
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)
    expect(result).toContain('/api/:a/b/c')
  })

  it('should apply special priority with when condition', () => {
    const rules = [
      '/api/a/:b/c',
      '/api/:a/b/c',
      '/api/:a/:b/c',
    ]
    const priority = {
      special: {
        '/api/:a/b/c': {
          rules: ['/api/a/:b/c'],
          when: ['/api/a/b/c'],
        },
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)
    expect(result).toContain('/api/:a/b/c')
  })

  it('should not apply special priority when when condition not met', () => {
    const rules = [
      '/api/a/:b/c',
      '/api/:a/b/c',
    ]
    const priority = {
      special: {
        '/api/:a/b/c': {
          rules: ['/api/a/:b/c'],
          when: ['/api/other/path'],
        },
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)
    expect(result).toEqual(['/api/a/:b/c', '/api/:a/b/c'])
  })
})

/**
 * Test suite for complex URL patterns
 *
 * 复杂 URL 模式测试套件
 */
describe('integration: complex URL patterns', () => {
  it('should handle optional groups', () => {
    const rules = ['/api{/:version}/users']
    expect(matchingWeight(rules, '/api/users', {})).toEqual(['/api{/:version}/users'])
    expect(matchingWeight(rules, '/api/v1/users', {})).toEqual(['/api{/:version}/users'])
  })

  it('should handle multiple optional segments', () => {
    const rules = ['/api{/:version}{/:subVersion}/users']
    expect(matchingWeight(rules, '/api/users', {})).toEqual(['/api{/:version}{/:subVersion}/users'])
    expect(matchingWeight(rules, '/api/v1/users', {})).toEqual(['/api{/:version}{/:subVersion}/users'])
    expect(matchingWeight(rules, '/api/v1/beta/users', {})).toEqual(['/api{/:version}{/:subVersion}/users'])
  })

  it('should handle wildcard patterns', () => {
    const rules = ['/api/*path']
    expect(matchingWeight(rules, '/api/users/123/posts/456', {})).toEqual(['/api/*path'])
  })
})

/**
 * Test suite for edge case scenarios
 *
 * 边缘情况测试套件
 */
describe('integration: edge cases', () => {
  it('should handle empty rules', () => {
    expect(matchingWeight([], '/api/users', {})).toEqual([])
  })

  it('should handle rules with no matches', () => {
    const rules = ['/api/posts', '/api/comments']
    expect(matchingWeight(rules, '/api/users', {})).toEqual([])
  })

  it('should handle duplicate rules', () => {
    const rules = ['/api/users', '/api/users', '/api/posts']
    const result = matchingWeight(rules, '/api/users', {})
    expect(result).toContain('/api/users')
  })

  it('should handle very long URLs', () => {
    const longPath = `/api/${'a/'.repeat(20)}end`
    const rules = ['/api/*rest', longPath]
    const result = matchingWeight(rules, longPath, {})
    expect(result).toContain(longPath)
  })
})
