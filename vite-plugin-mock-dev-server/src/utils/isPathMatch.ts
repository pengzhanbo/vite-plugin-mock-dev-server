import { pathToRegexp } from 'path-to-regexp'

const cache: Map<string, RegExp> = new Map()

/**
 * 判断 path 是否匹配 pattern
 *
 * @param pattern - The pattern to match.
 * @param path - The path to match.
 * @returns True if path matches pattern, false otherwise.
 */
export function isPathMatch(pattern: string, path: string): boolean {
  let regexp = cache.get(pattern)
  if (!regexp) {
    regexp = pathToRegexp(pattern).regexp
    cache.set(pattern, regexp)
  }
  return regexp.test(path)
}
