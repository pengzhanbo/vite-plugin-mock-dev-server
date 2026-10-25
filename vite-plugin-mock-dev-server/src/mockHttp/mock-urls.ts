import type { MockOptions } from '../types/index.js'

const keysCache = new WeakMap<Record<string, MockOptions>, string[]>()

export function getMockUrls(mockData: Record<string, MockOptions>): string[] {
  let mockUrls = keysCache.get(mockData)
  if (!mockUrls) {
    mockUrls = Object.keys(mockData)
    keysCache.set(mockData, mockUrls)
  }
  return mockUrls
}
