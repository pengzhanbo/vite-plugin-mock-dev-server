/**
 * Tests for the `defineMockData` helper
 *
 * `defineMockData` 辅助函数测试
 *
 * The helper keeps a module-level cache, so every case uses its own key to stay
 * independent from the others.
 *
 * 该辅助函数使用模块级缓存，因此每个用例都使用独立的 key，避免相互影响。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineMockData } from '../src/helpers/defineMockData.js'

let keySeed = 0

/**
 * Create a unique cache key
 *
 * 创建唯一的缓存 key
 *
 * @param name - Case name / 用例名称
 * @returns Unique key / 唯一的 key
 */
function uniqueKey(name: string): string {
  keySeed += 1
  return `define-mock-data:${name}:${keySeed}`
}

describe('defineMockData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a getter, a setter and a value property', () => {
    const data = defineMockData(uniqueKey('shape'), { count: 0 })

    expect(typeof data[0]).toBe('function')
    expect(typeof data[1]).toBe('function')
    expect(data[0]()).toEqual({ count: 0 })
    expect(data.value).toEqual({ count: 0 })
  })

  it('should share the same data between calls with the same key', () => {
    const key = uniqueKey('shared')
    const first = defineMockData(key, { count: 0 })
    const second = defineMockData(key, { count: 0 })

    // 多个 mock 文件引入同一个 data 文件时，得到的是同一个缓存对象
    // Mock files importing the same data file get the same cached object
    expect(second).toBe(first)

    first[1]({ count: 1 })
    expect(second[0]()).toEqual({ count: 1 })
    expect(second.value).toEqual({ count: 1 })
  })

  it('should not share data between different keys', () => {
    const first = defineMockData(uniqueKey('isolated-a'), { count: 0 })
    const second = defineMockData(uniqueKey('isolated-b'), { count: 100 })

    first[1]({ count: 1 })

    expect(first[0]()).toEqual({ count: 1 })
    expect(second[0]()).toEqual({ count: 100 })
  })

  it('should support a setter function that returns a new value', () => {
    const data = defineMockData(uniqueKey('setter-return'), { count: 1 })

    data[1]((current) => ({ count: current.count + 1 }))

    expect(data[0]()).toEqual({ count: 2 })
  })

  it('should support a setter function that mutates the value in place', () => {
    const data = defineMockData(uniqueKey('setter-mutate'), { count: 1 })

    // 修改后未返回新值时应保留被修改过的原对象
    // The mutated object is kept when the setter does not return a new value
    data[1]((current) => {
      current.count = 5
    })

    expect(data[0]()).toEqual({ count: 5 })
  })

  it('should support updating the value through the value property', () => {
    const data = defineMockData(uniqueKey('value-property'), { count: 0 })

    data.value = { count: 9 }

    expect(data[0]()).toEqual({ count: 9 })
    expect(data.value).toEqual({ count: 9 })
  })

  it('should keep the mutated value when the file is recompiled with the same data', () => {
    const key = uniqueKey('recompile-same')
    const data = defineMockData(key, { count: 0 })
    data.value = { count: 7 }

    // 模拟文件重新编译（编译间隔超过缓存时间），初始数据未变化
    // Simulate a recompilation (after the cache interval) with unchanged initial data
    vi.advanceTimersByTime(100)
    const reloaded = defineMockData(key, { count: 0 })

    expect(reloaded).toBe(data)
    expect(reloaded.value).toEqual({ count: 7 })
  })

  it('should reset the value when the initial data changes after recompilation', () => {
    const key = uniqueKey('recompile-changed')
    const data = defineMockData(key, { count: 0 })
    data.value = { count: 7 }

    vi.advanceTimersByTime(100)
    const reloaded = defineMockData(key, { count: 1 })

    expect(reloaded.value).toEqual({ count: 1 })
  })

  it('should ignore an initial data change within the stale interval', () => {
    const key = uniqueKey('stale-interval')
    const data = defineMockData(key, { count: 0 })
    data.value = { count: 7 }

    // 编译耗时必然远小于用户修改间隔，短时间内的重复编译不应重置数据
    // Recompilations happen much faster than user edits, so they must not reset
    // the data within the stale interval
    vi.advanceTimersByTime(10)
    defineMockData(key, { count: 1 })

    expect(data.value).toEqual({ count: 7 })
  })

  it('should keep the value across recompilations when persistOnHMR is enabled', () => {
    const key = uniqueKey('persist')
    const data = defineMockData(key, { count: 0 }, { persistOnHMR: true })
    data.value = { count: 7 }

    vi.advanceTimersByTime(100)
    const reloaded = defineMockData(key, { count: 1 }, { persistOnHMR: true })

    expect(reloaded.value).toEqual({ count: 7 })
  })

  it('should not reset the value when persistOnHMR is enabled on a later call', () => {
    // 初始调用未启用 persistOnHMR，后续调用启用后同样不再跟随初始数据
    // persistOnHMR is sticky once enabled: later calls no longer follow the
    // initial data
    const key = uniqueKey('persist-later')
    const data = defineMockData(key, { count: 0 })
    data.value = { count: 7 }

    vi.advanceTimersByTime(100)
    const reloaded = defineMockData(key, { count: 1 }, { persistOnHMR: true })

    expect(reloaded.value).toEqual({ count: 7 })
  })
})
