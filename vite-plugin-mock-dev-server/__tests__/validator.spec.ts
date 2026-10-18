/**
 * Test for isObjectSubset functionality
 *
 * 对象子集比较功能测试
 */
import { expect, it } from 'vitest'
import { isObjectSubset } from '../src/utils/index.js'

/**
 * Test isObjectSubset function
 *
 * 测试 isObjectSubset 函数
 */
it('isObjectSubset', () => {
  // 浅层比较
  expect(isObjectSubset({ a: 1 })).toBe(true)
  expect(isObjectSubset({ a: 1 }, { a: 1 })).toBe(true)
  expect(isObjectSubset({ a: 1 }, { a: 2 })).toBe(false)
  expect(isObjectSubset({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  expect(isObjectSubset({ a: 1, b: 2 }, { a: 1 })).toBe(true)

  // 深层比较
  expect(isObjectSubset({ a: [1, 2] }, { a: [1] })).toBe(true)
  expect(isObjectSubset({ a: [1, 2] }, { a: [1, 3] })).toBe(false)
  expect(isObjectSubset({ a: [1, 2], b: { c: 1 } }, { a: [1], b: { c: 1 } })).toBe(true)
  expect(isObjectSubset({ a: ['1', { b: 1 }] }, { a: [{ b: 1 }, '1'] })).toBe(true)
  expect(isObjectSubset({ a: [{ a: 1 }, { a: 2 }] }, { a: [{ a: 2 }, { a: 2 }] })).toBe(false)

  expect(isObjectSubset({ a: [{ a: { b: { c: 1 } } }, 2] }, { a: [{ a: { b: { c: 1 } } }] })).toBe(
    true,
  )
})

/**
 * Nullish source should be treated as a mismatch instead of throwing
 *
 * source 为空时应按不匹配处理，而不是抛出异常
 */
it('isObjectSubset with nullish source', () => {
  expect(isObjectSubset(undefined)).toBe(true)
  expect(isObjectSubset(null)).toBe(true)
  expect(isObjectSubset(undefined, {})).toBe(true)
  expect(isObjectSubset(null, {})).toBe(true)
  expect(isObjectSubset(undefined, { a: 1 })).toBe(false)
  expect(isObjectSubset(null, { a: 1 })).toBe(false)
  expect(isObjectSubset(undefined, { a: { b: 1 } })).toBe(false)
  expect(isObjectSubset(undefined, [])).toBe(true)
  expect(isObjectSubset(undefined, [1])).toBe(false)
})
