/**
 * Check whether an import path matches an alias pattern
 *
 * 判断导入路径是否匹配 alias 规则
 *
 * Vite 的 `resolve.alias` 支持字符串与正则两种 `find`：
 * 字符串按「完全相等或以 `pattern/` 开头」匹配，正则直接测试导入路径。
 *
 * Vite `resolve.alias` accepts both a string and a RegExp `find`: a string matches
 * when the import path equals it or starts with `pattern/`, a RegExp is tested
 * directly against the import path.
 *
 * @param pattern - `find` pattern of an alias / alias 的 `find` 规则
 * @param importee - Import path / 导入路径
 * @returns Whether the import path matches / 导入路径是否匹配
 */
export function aliasMatches(pattern: string | RegExp, importee: string): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(importee)
  }

  if (importee.length < pattern.length) {
    return false
  }

  if (importee === pattern) {
    return true
  }

  return importee.startsWith(`${pattern}/`)
}
