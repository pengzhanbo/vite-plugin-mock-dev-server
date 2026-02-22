/**
 * Test for isObjectSubset functionality
 *
 * 对象子集比较功能测试
 */
import { expect, it } from 'vitest'
import { isObjectSubset } from '../src/utils'

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
  expect(
    isObjectSubset({ a: [1, 2], b: { c: 1 } }, { a: [1], b: { c: 1 } }),
  ).toBe(true)
  expect(isObjectSubset({ a: ['1', { b: 1 }] }, { a: [{ b: 1 }, '1'] })).toBe(
    true,
  )
  expect(
    isObjectSubset({ a: [{ a: 1 }, { a: 2 }] }, { a: [{ a: 2 }, { a: 2 }] }),
  ).toBe(false)

  expect(
    isObjectSubset(
      { a: [{ a: { b: { c: 1 } } }, 2] },
      { a: [{ a: { b: { c: 1 } } }] },
    ),
  ).toBe(true)
})
