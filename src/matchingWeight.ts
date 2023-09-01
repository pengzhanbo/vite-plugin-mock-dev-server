/**
 * 规则匹配优先级
 *
 * 由于一个请求可能会同时命中多个 匹配规则，需要计算 优先级，并根据优先级 从高到低 排序。
 *
 * 规则：
 * 1. 无参数的规则优先级最高
 * 2. 参数规则少的优先级高，对于参数数量相同的，根据参数所在位置，参数越靠后的优先级越高
 * 3. 命名参数优先级比非命名参数优先级高
 * 4. 对于 有修饰符 *+?, 优先级需要对比无修饰符的参数进行降低，
 * 5. 同位置修饰符， * 比 + 的优先级低
 * 6. 对于 (.*) 的参数规则，无论其出现在任何位置，都拥有该位置的最低优先级，(.*)? 比 (.*) 优先级更低
 */
import { isString, sortBy } from '@pengzhanbo/utils'
import type { Token } from 'path-to-regexp'
import { parse, pathToRegexp } from 'path-to-regexp'

const tokensCache: Record<string, Token[]> = {}

function getTokens(rule: string) {
  if (tokensCache[rule]) return tokensCache[rule]

  const tks = parse(rule)
  const tokens: Token[] = []
  for (const tk of tks) {
    if (!isString(tk)) {
      tokens.push(tk)
    } else {
      const hasPrefix = tk[0] === '/'
      const subTks = hasPrefix ? tk.slice(1).split('/') : tk.split('/')
      tokens.push(
        `${hasPrefix ? '/' : ''}${subTks[0]}`,
        ...subTks.slice(1).map((t) => `/${t}`),
      )
    }
  }
  tokensCache[rule] = tokens
  return tokens
}

function sortFn(rule: string) {
  const tokens = getTokens(rule)
  let w = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (!isString(token)) {
      w += 10 ** (i + 1)
    }
    w += 10 ** (i + 1)
  }
  return w
}

export function matchingWeight(rules: string[], url: string): string[] {
  const matchRules = rules.filter((rule) => pathToRegexp(rule).test(url))
  let weights = matchRules.map((rule) => getTokens(rule).length)
  weights = weights.length === 0 ? [1] : weights
  const highest = Math.max(...weights) + 2

  let matched: string[] = []
  const preMatch: string[][] = []

  for (const rule of matchRules) {
    const tokens = getTokens(rule)

    const len = tokens.filter((token) => typeof token !== 'string').length
    if (!preMatch[len]) preMatch[len] = []
    preMatch[len].push(rule)
  }
  // 归类相同参数数量，并根据参数位置进行排序
  for (const match of preMatch.filter((v) => v && v.length > 0)) {
    matched = [...matched, ...sortBy(match, sortFn)]
  }

  matched = sortBy(matched, (rule) => {
    const tokens = getTokens(rule)
    const dym = tokens.filter((token) => typeof token !== 'string')
    if (dym.length === 0) return 0

    let weight = dym.length
    let exp = 0
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const isDynamic = !isString(token)
      const {
        pattern = '',
        modifier,
        prefix,
        name,
      } = isDynamic ? token : ({} as any)
      const isGlob = pattern && pattern.includes('.*')
      const isSlash = prefix === '/'
      const isNamed = isString(name)

      exp += isDynamic && isSlash ? 1 : 0

      // 如果规则末尾是通配，则优先级最低
      if (i === tokens.length - 1 && isGlob) {
        weight += 5 * 10 ** highest
      } else {
        // 非末尾的通配，优先级次低
        if (isGlob) {
          weight += 3 * 10 ** (highest - 1)
        } else if (pattern) {
          if (isSlash) {
            // 具名参数优先级高于非命名参数
            weight += (isNamed ? 2 : 1) * 10 ** (exp + 1)
          } else {
            // :foo{-:bar}{-:baz}? 优先级高于 :foo
            weight -= 1 * 10 ** exp
          }
        }
      }
      if (modifier === '+') {
        weight += 1 * 10 ** (highest - 1)
      }
      if (modifier === '*') {
        weight += 1 * 10 ** (highest - 1) + 1
      }
      if (modifier === '?') {
        weight += 1 * 10 ** (exp + (isSlash ? 1 : 0))
      }
    }
    return weight
  })
  return matched
}
