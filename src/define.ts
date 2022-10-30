import type { MockOptions, MockOptionsItem } from './types'

export const defineMock = (
  mock: MockOptionsItem | MockOptions
): MockOptionsItem | MockOptions => {
  return mock
}

export default defineMock
