import { expect, it } from 'vitest'
import { isObjectSubset } from '../plugin/src/core/validator'

it('validator isObjectSubset', () => {
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
