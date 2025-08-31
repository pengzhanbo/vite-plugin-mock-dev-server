import { describe, expect, it } from 'vitest'
import { matchingWeight } from '../src/core/matchingWeight'

describe('matching weight', () => {
  const rules = [
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

  const expects = {
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
