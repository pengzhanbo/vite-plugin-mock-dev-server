/**
 * Test for matching weight functionality
 *
 * 匹配权重功能测试
 */
import { describe, expect, it } from 'vitest'
import { createMatchingWeightSorter, matchingWeight } from '../src/mockHttp/matchingWeight.js'

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
    '/api/a': ['/api/a', '/api/:a', '/api{/:a}', '/api/:a{/:b/:c}', '/api/*rest', '/api{/*rest}'],
    '/api/e/e/e/e': ['/api/*rest/:d', '/api/*rest', '/api{/*rest}'],
    '/api': ['/api{/:a}', '/api{/*rest}'],
  }

  /**
   * Test each URL with expected matching results
   *
   * 测试每个 URL 的预期匹配结果
   */
  it.each(
    Object.keys(expects).map((url) => ({
      rules,
      url,
      expected: expects[url],
    })),
  )('$url', ({ rules: testRules, url, expected }) => {
    expect(matchingWeight(testRules, url, {})).toEqual(expected)
  })
})

/**
 * Test suite for the sorted result cache
 *
 * 排序结果缓存测试套件
 */
describe('createMatchingWeightSorter', () => {
  const rules = ['/api/a', '/api/:a', '/api/*rest']

  it('should return the same result as matchingWeight', () => {
    const sorter = createMatchingWeightSorter()
    expect(sorter(rules, '/api/a')).toEqual(matchingWeight(rules, '/api/a'))
  })

  it('should reuse the cached result for the same pathname', () => {
    const sorter = createMatchingWeightSorter()
    const first = sorter(rules, '/api/a')
    const second = sorter(rules, '/api/a')

    // 命中缓存时返回同一个引用，避免重复排序
    // The same reference is returned on a cache hit, avoiding repeated sorting
    expect(second).toBe(first)
  })

  it('should recompute the result after the cache is cleared', () => {
    const sorter = createMatchingWeightSorter()
    const first = sorter(rules, '/api/a')
    sorter.clear()
    const second = sorter(rules, '/api/a')

    expect(second).toEqual(first)
    expect(second).not.toBe(first)
  })

  it('should reflect the updated rules after the cache is cleared', () => {
    const sorter = createMatchingWeightSorter()
    expect(sorter(rules, '/api/a')).toEqual(['/api/a', '/api/:a', '/api/*rest'])

    const newRules = [...rules, '/api/a/:b']
    sorter.clear()

    expect(sorter(newRules, '/api/a')).toEqual(['/api/a', '/api/:a', '/api/*rest'])
  })

  it('should cache different pathnames separately', () => {
    const sorter = createMatchingWeightSorter()
    const a = sorter(rules, '/api/a')
    const b = sorter(rules, '/api/other')

    expect(a).not.toBe(b)
    expect(a).toEqual(['/api/a', '/api/:a', '/api/*rest'])
    expect(b).toEqual(['/api/:a', '/api/*rest'])
  })

  it('should isolate the cache between sorters', () => {
    const first = createMatchingWeightSorter()
    const second = createMatchingWeightSorter()

    // 不同 mock 数据集之间不应互相影响 / different mock datasets must not interfere
    expect(first(rules, '/api/a')).toEqual(['/api/a', '/api/:a', '/api/*rest'])
    expect(second(['/api/:a'], '/api/a')).toEqual(['/api/:a'])
  })

  it('should bound the cache size', () => {
    const sorter = createMatchingWeightSorter(1)
    const first = sorter(rules, '/api/a')
    sorter(rules, '/api/other')

    // 超过容量后此前缓存的 `/api/a` 已被丢弃，重新排序不会命中缓存
    // The previously cached `/api/a` is dropped once the capacity is exceeded,
    // so sorting again misses the cache
    expect(sorter(rules, '/api/a')).not.toBe(first)
    expect(sorter(rules, '/api/a')).toEqual(first)
  })
})
