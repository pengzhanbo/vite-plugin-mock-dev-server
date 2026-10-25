/**
 * Request URL parameter parsing
 *
 * 请求 URL 参数解析
 */

import type { MatchFunction } from 'path-to-regexp'
import { LRUCache } from '@pengzhanbo/utils'
import { match } from 'path-to-regexp'

/**
 * Cache for path-to-regexp match functions
 *
 * path-to-regexp 匹配函数缓存
 *
 * 使用 `LRUCache` 限制缓存上限，避免 mock 文件频繁增删改时无界增长
 *
 * `LRUCache` bounds the cache size, avoiding unbounded growth when mock files are
 * frequently added, removed or edited.
 */
const matcherCache = new LRUCache<
  string,
  MatchFunction<Partial<Record<string, string | string[]>>>
>({ maxSize: 1024 })

/**
 * Parse request URL dynamic parameters
 *
 * 解析请求 url 中的动态参数 params
 *
 * @param pattern - URL pattern / URL 模式
 * @param url - Request URL / 请求 URL
 * @returns Parsed parameters / 解析后的参数
 */
export function parseRequestParams(
  pattern: string,
  url: string,
): Partial<Record<string, string | string[]>> {
  let matcher = matcherCache.get(pattern)
  if (!matcher) {
    matcher = match(pattern, { decode: decodeRequestParam })
    matcherCache.set(pattern, matcher)
  }
  const matched = matcher(url)
  return matched ? matched.params : {}
}

/**
 * Decode a matched parameter without throwing on malformed percent-encoding
 *
 * 解码匹配到的参数，遇到非法的百分号编码时不抛出异常
 *
 * @param value - Raw matched parameter / 匹配到的原始参数
 * @returns Decoded parameter, or the raw value when it cannot be decoded / 解码后的参数，无法解码时为原始值
 */
function decodeRequestParam(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
