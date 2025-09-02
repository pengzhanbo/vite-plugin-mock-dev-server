import type { Matcher } from 'picomatch'
import { toArray } from '@pengzhanbo/utils'
import picomatch from 'picomatch'

export function createMatcher(
  include: string | string[],
  exclude: string | string[],
): {
  pattern: string[]
  ignore: string[]
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
