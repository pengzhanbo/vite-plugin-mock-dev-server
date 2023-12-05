import { expect, it } from 'vitest'
import { sortByValidator } from '../src/transform'
import type { MockHttpItem } from '../src/types'

const mockList: MockHttpItem[] = [
  { url: '1', validator: () => true },
  { url: '2', validator: {} },
  { url: '3' },
  { url: '4', validator: { query: { a: 1 } } },
  { url: '5', validator: { query: { a: 1, b: [1] } } },
  { url: '6', validator: { query: { c: 1 } } },
  { url: '7', validator: { query: {} } },
]

/**
 * 验证 validator 优先级
 */
it('sort by validator', () => {
  expect(sortByValidator(mockList).map(m => m.url)).toEqual([
    '1',
    '5',
    '4',
    '6',
    '2',
    '3',
    '7',
  ])
})
