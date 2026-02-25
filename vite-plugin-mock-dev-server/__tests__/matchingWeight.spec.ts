/**
 * Test for matching weight functionality
 *
 * 匹配权重功能测试
 */
import { describe, expect, it } from 'vitest'
import { matchingWeight } from '../src/mockHttp/matchingWeight'

/**
 * Test suite for matching weight
 *
 * 匹配权重测试套件
 */
describe('matching weight', () => {
  /**
   * Test rules for path matching
   *
   * 路径匹配测试规则
   */
  const rules: string[] = [
    '/api/*rest',
    '/api{/*rest}',
    '/api/*rest/:d',
    '/api/a',
    '/api/:a',
    '/api{/:a}',
    '/api/a/b',
    '/api/:a/:b',
    '/api/a/:b',
    '/api/a/b/c',
    '/api/:a/b/c',
    '/api/a/:b/c',
    '/api/a/b/:c',
    '/api/:a/:b/c',
    '/api/:a/b/:c',
    '/api/a/:b/:c',
    '/api/:a/:b/:c',
    '/api{/:a}/b/c',
    '/api/:a{/:b}/c',
    '/api/:a/b{/:c}',
    '/api/:a{/:b/:c}',
    '/api/:a{/:b/:c}/d',
  ]

  /**
   * Expected results for each test URL
   *
   * 每个测试 URL 的预期结果
   */
  const expects: Record<string, string[]> = {
    '/api/a/c/b': [
      '/api/a/:b/:c',
      '/api/:a/:b/:c',
      '/api/:a{/:b/:c}',
      '/api/*rest/:d',
      '/api/*rest',
      '/api{/*rest}',
    ],
    '/api/e/f/g': [
      '/api/:a/:b/:c',
      '/api/:a{/:b/:c}',
      '/api/*rest/:d',
      '/api/*rest',
      '/api{/*rest}',
    ],
    '/api/e/b/f': [
      '/api/:a/b/:c',
      '/api/:a/b{/:c}',
      '/api/:a/:b/:c',
      '/api/:a{/:b/:c}',
      '/api/*rest/:d',
      '/api/*rest',
      '/api{/*rest}',
    ],
    '/api/a/e/f': [
      '/api/a/:b/:c',
      '/api/:a/:b/:c',
      '/api/:a{/:b/:c}',
      '/api/*rest/:d',
      '/api/*rest',
      '/api{/*rest}',
    ],
    '/api/a': [
      '/api/a',
      '/api/:a',
      '/api{/:a}',
      '/api/:a{/:b/:c}',
      '/api/*rest',
      '/api{/*rest}',
    ],
    '/api/e/e/e/e': ['/api/*rest/:d', '/api/*rest', '/api{/*rest}'],
    '/api': ['/api{/:a}', '/api{/*rest}'],

  }

  /**
   * Test each URL with expected matching results
   *
   * 测试每个 URL 的预期匹配结果
   */
  it.each(
    Object.keys(expects).map(url => ({
      rules,
      url,
      expected: expects[url],
    })),
  )('$url', ({ rules, url, expected }) => {
    expect(matchingWeight(rules, url, {})).toEqual(expected)
  })
})
