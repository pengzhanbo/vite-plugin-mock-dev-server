/**
 * Since the plugin compiles `*.mock.*` files as separate independent entries,
 * this leads to inconsistent dependency relationships after mock file compilation,
 * with each mock file having its own scope.
 * Even if multiple `*.mock.*` files import the same `data.ts` file, they are
 * completely different instances of `data`, making operations on `data` not
 * shareable across different `*.mock.*` files.
 *
 * To address this, the plugin provides a memory-based data sharing mechanism.
 *
 * 由于插件是分别独立对 `*.mock.*` 等文件作为单独入口进行编译的，
 * 这导致了 mock 文件编译后的依赖关系不一致，每个 mock 文件拥有独立的作用域，
 * 使得即使多个 `*.mock.*` 虽然引入了同一个 `data.ts` 文件，然而确是完全不同两份 `data`，
 * 使得对 `data` 的操作，在不同的 `*.mock.*` 文件中并不能共享。
 *
 * 为此，插件提供了一种基于 memory 的数据共享机制。
 */

import { createHash } from 'node:crypto'
import { deepClone, isFunction } from '@pengzhanbo/utils'

/**
 * Mock data cache
 *
 * Mock 数据缓存
 */
const mockDataCache = new Map<string, CacheImpl<any>>()

/**
 * Response cache for MockData objects
 *
 * MockData 对象的响应缓存
 */
const responseCache = new WeakMap<CacheImpl, MockData>()

/**
 * Stale interval in milliseconds
 *
 * 缓存过期间隔（毫秒）
 */
const staleInterval = 70

/**
 * Cache implementation for mock data
 *
 * Mock 数据缓存实现
 *
 * @template T - Type of cached data / 缓存数据的类型
 */
class CacheImpl<T = any> {
  /**
   * Current cached value
   *
   * 当前缓存值
   */
  value: T

  /**
   * Initial value hash, used to detect if initial data has changed
   *
   * 初始化数据的哈希值，用于判断传入的初始化数据是否发生变更
   */
  #hash: string

  /**
   * Last update timestamp
   *
   * 最后更新时间戳
   */
  #lastUpdate: number

  /**
   * Whether to persist data on HMR
   *
   * 热更新时是否保持数据
   */
  #persistOnHMR: boolean

  /**
   * Constructor
   *
   * 构造函数
   *
   * @param value - Initial value / 初始值
   * @param persistOnHMR - Whether to persist data on HMR / 热更新时是否保持数据
   */
  constructor(value: T, persistOnHMR?: boolean) {
    this.value = value
    this.#hash = getHash(value)
    this.#lastUpdate = Date.now()
    this.#persistOnHMR = persistOnHMR ?? false
  }

  /**
   * Hot update cached value
   *
   * 热更新缓存值
   *
   * @param value - New value / 新值
   */
  hotUpdate(value: T) {
    // If persistOnHMR is enabled, skip the update to preserve the current cached value.
    // 如果启用了 persistOnHMR ,跳过更新以保留当前缓存值
    if (this.#persistOnHMR) {
      return
    }

    // Used for cases where repeated compilation generates random data via `mockjs` or `faker-js`,
    // which may cause inconsistency in interface data across different mock files.
    // Since compilation and loading time is necessarily much shorter than user modification intervals,
    // a cache time is set here.
    // 用于针对重复编译时，如果是通过 `mockjs` 或 `faker-js` 等
    // 生成的随机数据，由于随机性带来的可能的不同mock文件关联的接口数据不一致的情况
    // 由于编译加载的时间必然远小于用户修改的间隔，因此这里设置了一个缓存时间
    if (Date.now() - this.#lastUpdate < staleInterval)
      return

    // After file changes and recompilation, when the two initialized data are not equal,
    // reinitialize to the newly compiled data.
    // 文件变更重新编译加载后，当两个初始化的数据不相等时，
    // 重新初始化为新的编译后的数据
    const hash = getHash(value)
    if (this.#hash !== hash) {
      this.value = deepClone(value)
      this.#hash = hash
      this.#lastUpdate = Date.now()
    }
  }

  /**
   * Set persistOnHMR
   *
   * 设置 persistOnHMR
   *
   * @param persistOnHMR - Whether to persist data on HMR / 热更新时是否保持数据
   */
  setPersistOnHMR(persistOnHMR: boolean) {
    // Once set to false, cannot be changed to true by subsequent calls
    // 设置为 false 后，不能被后续调用改为 true
    if (!this.#persistOnHMR)
      this.#persistOnHMR = persistOnHMR
  }
}

/**
 * Options for defineMockData
 *
 * defineMockData 的选项
 */
export interface DefineMockDataOptions {
  /**
   * Whether to persist the data value on HMR (Hot Module Replacement).
   *
   * 热更新时是否保持数据值
   *
   * @default false
   */
  persistOnHMR?: boolean
}

/**
 * Mock data type with getter, setter, and value property
 *
 * 带有 getter、setter 和 value 属性的 Mock 数据类型
 *
 * @template T - Type of mock data / Mock 数据的类型
 */
export type MockData<T = any> = readonly [
  /**
   * Getter function
   *
   * getter 函数
   *
   * @returns Current value / 当前值
   */
  () => T,
  /**
   * Setter function
   *
   * setter 函数
   *
   * @param val - New value or function to update value / 新值或更新值的函数
   */
  (val: T | ((val: T) => T | void)) => void,
] & {
  /**
   * Current value
   *
   * 当前值
   */
  value: T
}

/**
 * Define mock data with memory-based sharing mechanism
 *
 * 定义带有基于内存的共享机制的 Mock 数据
 *
 * @template T - Type of mock data / Mock 数据的类型
 * @param key - Unique key for mock data / Mock 数据的唯一键
 * @param initialData - Initial data value / 初始数据值
 * @param options - Options / 选项
 * @returns MockData object with getter, setter, and value property / 带有 getter、setter 和 value 属性的 MockData 对象
 */
export function defineMockData<T = any>(
  key: string,
  initialData: T,
  options?: DefineMockDataOptions,
): MockData<T> {
  let cache = mockDataCache.get(key) as CacheImpl<T> | undefined
  if (!cache) {
    const newCache = new CacheImpl<T>(
      initialData,
      options?.persistOnHMR,
    )
    const existing = mockDataCache.get(key)
    if (existing) {
      cache = existing as CacheImpl<T>
    }
    else {
      mockDataCache.set(key, newCache)
      cache = newCache
    }
  }
  else {
    // If cache already exists, update persistOnHMR if not already set
    // 如果缓存已存在，且 persistOnHMR 尚未设置，则更新
    cache.setPersistOnHMR(options?.persistOnHMR ?? false)
  }

  cache.hotUpdate(initialData)

  if (responseCache.has(cache))
    return responseCache.get(cache)!

  const res = [
    () => cache.value,
    (val) => {
      if (isFunction(val))
        val = val(cache.value) ?? cache.value

      cache.value = val
    },
  ] as const as MockData<T>

  Object.defineProperty(res, 'value', {
    get() {
      return cache.value
    },

    set(val: T) {
      cache.value = val
    },
  })

  responseCache.set(cache, res)

  return res
}

function getHash(data: any): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}
