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
import {
  isArray,
  isEmptyObject,
  isString,
  sortBy,
  uniq,
} from '@pengzhanbo/utils'
import type { Token } from 'path-to-regexp'
import { parse, pathToRegexp } from 'path-to-regexp'
import type { MockMatchPriority } from './types'

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

function getHighest(rules: string[]) {
  let weights = rules.map((rule) => getTokens(rule).length)
  weights = weights.length === 0 ? [1] : weights
  return Math.max(...weights) + 2
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

function preSort(rules: string[]) {
  let matched: string[] = []
  const preMatch: string[][] = []

  for (const rule of rules) {
    const tokens = getTokens(rule)

    const len = tokens.filter((token) => typeof token !== 'string').length
    if (!preMatch[len]) preMatch[len] = []
    preMatch[len].push(rule)
  }
  // 归类相同参数数量，并根据参数位置进行排序
  for (const match of preMatch.filter((v) => v && v.length > 0)) {
    matched = [...matched, ...sortBy(match, sortFn).reverse()]
  }
  return matched
}

function defaultPriority(rules: string[]) {
  const highest = getHighest(rules)

  return sortBy(rules, (rule) => {
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
        weight += 5 * 10 ** (tokens.length === 1 ? highest + 1 : highest)
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
}

export function matchingWeight(
  rules: string[],
  url: string,
  priority: MockMatchPriority,
): string[] {
  // 基于默认规则下进行优先级排序
  let matched = defaultPriority(
    preSort(rules.filter((rule) => pathToRegexp(rule).test(url))),
  )

  const { global = [], special = {} } = priority

  // 未配置自定义的排序规则，直接返回匹配结果
  if ((global.length === 0 && isEmptyObject(special)) || matched.length === 0)
    return matched

  const [statics, dynamics] = twoPartMatch(matched)
  const globalMatch = global.filter((rule) => dynamics.includes(rule))

  if (globalMatch.length > 0) {
    matched = uniq([...statics, ...globalMatch, ...dynamics])
  }
  if (isEmptyObject(special)) return matched

  const specialRule = Object.keys(special).filter((rule) =>
    matched.includes(rule),
  )[0]

  if (!specialRule) return matched

  const options = special[specialRule]
  const { rules: lowerRules, when } = isArray(options)
    ? { rules: options, when: [] }
    : options

  if (lowerRules.includes(matched[0])) {
    if (
      when.length === 0 ||
      when.some((path) => pathToRegexp(path).test(url))
    ) {
      matched = uniq([specialRule, ...matched])
    }
  }

  return matched
}

function twoPartMatch(rules: string[]) {
  const statics: string[] = []
  const dynamics: string[] = []
  for (const rule of rules) {
    const tokens = getTokens(rule)
    const dym = tokens.filter((token) => typeof token !== 'string')
    if (dym.length > 0) dynamics.push(rule)
    else statics.push(rule)
  }
  return [statics, dynamics]
}
