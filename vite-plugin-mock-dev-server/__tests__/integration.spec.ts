/**
 * Integration tests for mock server
 *
 * Mock 服务器集成测试
 */
import { describe, expect, it } from 'vitest'
import { matchingWeight } from '../src/mockHttp/matchingWeight.js'

/**
 * Test suite for matching weight with complex scenarios
 *
 * 复杂场景下的匹配权重测试套件
 */
describe('integration: matching weight with priority', () => {
  it('should apply global priority rules', () => {
    const rules = ['/api/:a/:b', '/api/a/:b', '/api/:a/b', '/api/a/b']
    const priority = {
      global: ['/api/:a/b', '/api/a/:b'],
    }
    const result = matchingWeight(rules, '/api/a/b', priority)
    expect(result[0]).toBe('/api/a/b')
    expect(result[1]).toBe('/api/:a/b')
    expect(result[2]).toBe('/api/a/:b')
  })

  it('should apply special priority rules', () => {
    const rules = ['/api/:a/:b/c', '/api/a/:b/c', '/api/:a/b/c']
    const priority = {
      special: {
        '/api/:a/b/c': ['/api/a/:b/c'],
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)
    expect(result).toContain('/api/:a/b/c')
  })

  it('should apply special priority with when condition', () => {
    const rules = ['/api/a/:b/c', '/api/:a/b/c', '/api/:a/:b/c']
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
    const rules = ['/api/a/:b/c', '/api/:a/b/c']
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

  it('should apply every matching special priority rule in declaration order', () => {
    const rules = ['/api/a/:b/c', '/api/:a/b/c', '/api/:a/:b/c', '/api/:a/b/:c']
    const priority = {
      special: {
        '/api/:a/:b/c': ['/api/a/:b/c'],
        '/api/:a/b/:c': ['/api/a/:b/c'],
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)

    // 两条特殊规则同时满足条件时都被提升，且声明靠前的排在更前面，
    // 不会出现「只有首个命中的特殊规则生效」的情况
    // Both special rules apply at once and keep the declaration order, instead of
    // silently ignoring every rule after the first one
    expect(result.slice(0, 2)).toEqual(['/api/:a/:b/c', '/api/:a/b/:c'])
    expect(result).toEqual(['/api/:a/:b/c', '/api/:a/b/:c', '/api/a/:b/c', '/api/:a/b/c'])
  })

  it('should apply a later declared special rule when the first one is not applicable', () => {
    const rules = ['/api/a/:b/c', '/api/:a/b/c', '/api/:a/:b/c']
    const priority = {
      special: {
        // 与其竞争的规则不在首位，因此不生效
        // The competing rule is not on top, so this rule is not promoted
        '/api/:a/:b/c': ['/api/:a/b/c'],
        // 与其竞争的规则在首位，因此生效
        // The competing rule is on top, so this rule is promoted
        '/api/:a/b/c': ['/api/a/:b/c'],
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)

    expect(result).toEqual(['/api/:a/b/c', '/api/a/:b/c', '/api/:a/:b/c'])
  })

  it('should evaluate the when condition of each special rule independently', () => {
    const rules = ['/api/a/:b/c', '/api/:a/b/c', '/api/:a/:b/c', '/api/:a/b/:c']
    const priority = {
      special: {
        // `when` 不匹配，不生效 / the `when` condition does not match, not promoted
        '/api/:a/:b/c': { rules: ['/api/a/:b/c'], when: ['/api/other/path'] },
        // `when` 匹配，生效 / the `when` condition matches, promoted
        '/api/:a/b/:c': { rules: ['/api/a/:b/c'], when: ['/api/a/b/c'] },
      },
    }
    const result = matchingWeight(rules, '/api/a/b/c', priority)

    expect(result[0]).toBe('/api/:a/b/:c')
    // 未满足 `when` 的规则仍然参与匹配，只是不被提升
    // The rule whose `when` does not match still takes part in the matching,
    // it is simply not promoted
    expect(result).toContain('/api/:a/:b/c')
    expect(result.indexOf('/api/:a/:b/c')).toBeGreaterThan(0)
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
    expect(matchingWeight(rules, '/api/v1/users', {})).toEqual([
      '/api{/:version}{/:subVersion}/users',
    ])
    expect(matchingWeight(rules, '/api/v1/beta/users', {})).toEqual([
      '/api{/:version}{/:subVersion}/users',
    ])
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
