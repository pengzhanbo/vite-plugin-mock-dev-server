/**
 * Test for the recorder request filter
 *
 * 录制请求过滤器测试
 */
import type { RecordedReq } from '../src/types/index.js'
import { describe, expect, it, vi } from 'vitest'
import { createRecordMatcher } from '../src/recorder/helper.js'

/**
 * Create a recorded request
 *
 * 构造一条请求记录
 *
 * @param pathname - Request pathname / 请求路径
 * @returns Recorded request / 请求记录
 */
function createReq(pathname: string): RecordedReq {
  return { method: 'GET', pathname, query: {}, body: null, bodyType: 'none' }
}

describe('recorder request filter', () => {
  it('should use a custom filter function as is', () => {
    const filter = vi.fn((req: RecordedReq) => req.pathname === '/api/users')
    const isMatch = createRecordMatcher(filter)

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/orders'))).toBe(false)
  })

  it('should include all requests when include is omitted in glob mode', () => {
    // filter 对象只写了 exclude，include 缺省时不应拒绝一切请求
    // Only `exclude` is configured, omitting `include` must not reject every request
    const isMatch = createRecordMatcher({ mode: 'glob', exclude: ['/api/auth/**'] })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/orders/1'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
  })

  it('should include all requests when neither include nor exclude is configured', () => {
    const isMatch = createRecordMatcher({ mode: 'glob' })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/'))).toBe(true)
  })

  it('should treat negation-only include patterns as include-all in glob mode', () => {
    // include 只包含否定模式时，picomatch 的正向模式集为空，同样需要兜底
    // A negation-only `include` leaves picomatch without any positive pattern
    const isMatch = createRecordMatcher({ mode: 'glob', include: ['!**/auth/**'] })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
  })

  it('should still restrict requests when include is configured in glob mode', () => {
    const isMatch = createRecordMatcher({
      mode: 'glob',
      include: ['/api/**'],
      exclude: ['/api/auth/**'],
    })

    expect(isMatch(createReq('/api/users'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
    expect(isMatch(createReq('/other/service'))).toBe(false)
  })

  it('should include all requests when include is omitted in path-to-regexp mode', () => {
    // path-to-regexp 模式下 include 缺省时 `[].some()` 恒为 false，同样会静默不录制
    // In path-to-regexp mode an empty `include` makes `[].some()` always false
    const isMatch = createRecordMatcher({ mode: 'path-to-regexp', exclude: ['/api/auth/:action'] })

    expect(isMatch(createReq('/api/users/1'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
  })

  it('should match include/exclude patterns in path-to-regexp mode', () => {
    const isMatch = createRecordMatcher({
      mode: 'path-to-regexp',
      include: ['/api/:resource/:id'],
      exclude: ['/api/auth/:action'],
    })

    expect(isMatch(createReq('/api/users/1'))).toBe(true)
    expect(isMatch(createReq('/api/auth/login'))).toBe(false)
    expect(isMatch(createReq('/api/users'))).toBe(false)
  })
})
