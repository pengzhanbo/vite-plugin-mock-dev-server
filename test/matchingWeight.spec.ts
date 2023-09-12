import { describe, expect, test } from 'vitest'
import { matchingWeight } from '../src/matchingWeight'

/**
 * 验证 规则优先级排序
 */
describe('matching weight', () => {
  const rules = [
    '/api/(.*)',
    '/api/(.*)/c',
    '/api/(.*)?',
    '/api/(.*)/:c',
    '/api/:a*',
    '/api/:a+',
    '/api/:a/:b?',
    '/api/a/b/c',
    '/api/:a/b/c',
    '/api/a/:b/c',
    '/api/a/b/:c',
    '/api/a/:b/:c',
    '/api/:a/:b/c',
    '/api/:a/b/:c',
    '/api/:a/:b/:c',
    '/api/a/b/:c{-:d}{-:e}?',
  ]
  const expects = {
    '/api/a/c/b': [
      '/api/a/:b/:c',
      '/api/:a/:b/:c',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api/e/f/g': [
      '/api/:a/:b/:c',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api/a/e/f': [
      '/api/a/:b/:c',
      '/api/:a/:b/:c',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api/e/b/f': [
      '/api/:a/b/:c',
      '/api/:a/:b/:c',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api/e/f/c': [
      '/api/:a/:b/c',
      '/api/:a/:b/:c',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/c',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api/a': [
      '/api/:a/:b?',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api/e/e/e/e': [
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],

    '/api': ['/api/:a*', '/api/(.*)?'],

    '/api/a/b/c-d-e': [
      '/api/a/b/:c{-:d}{-:e}?',
      '/api/a/b/:c',
      '/api/a/:b/:c',
      '/api/:a/b/:c',
      '/api/:a/:b/:c',
      '/api/:a+',
      '/api/:a*',
      '/api/(.*)/:c',
      '/api/(.*)',
      '/api/(.*)?',
    ],
  }

  test.each(
    Object.keys(expects).map((url) => ({
      rules,
      url,
      expected: expects[url],
    })),
  )('$url', ({ rules, url, expected }) => {
    expect(matchingWeight(rules, url, {})).toEqual(expected)
  })
})
