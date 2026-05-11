import { LRUCache } from '@pengzhanbo/utils'

const PATTERN_CACHE = new LRUCache<string, RegExp>({ maxSize: 100 })

export function doesProxyContextMatchUrl(
  context: string,
  url: string,
): boolean {
  if (context[0] === '^') {
    let pattern = PATTERN_CACHE.get(context)
    if (!pattern)
      PATTERN_CACHE.set(context, pattern = new RegExp(context))
    return pattern.test(url)
  }
  return url.startsWith(context)
}
