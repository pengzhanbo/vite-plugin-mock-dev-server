import type { Matcher } from 'picomatch'
import { toArray } from '@pengzhanbo/utils'
import picomatch from 'picomatch'

/**
 * Create file matcher
 *
 * 创建文件匹配器
 *
 * @param include - Include patterns / 包含模式
 * @param exclude - Exclude patterns / 排除模式
 * @returns Matcher object with pattern, ignore, and isMatch properties / 带有 pattern、ignore 和 isMatch 属性的匹配器对象
 */
export function createMatcher(
  include: string | string[],
  exclude: string | string[],
): {
  /**
   * Include patterns
   *
   * 包含模式
   */
  pattern: string[]
  /**
   * Exclude patterns
   *
   * 排除模式
   */
  ignore: string[]
  /**
   * Match function
   *
   * 匹配函数
   */
  isMatch: Matcher
} {
  const pattern: string[] = []
  const ignore: string[] = ['**/node_modules/**', ...toArray(exclude)]
  toArray(include).forEach((item) => {
    if (item[0] === '!')
      ignore.push(item.slice(1))
    else
      pattern.push(item)
  })

  const isMatch = picomatch(pattern, { ignore })

  return { pattern, ignore, isMatch }
}
