/**
 * 规则匹配优先级
 *
 * @see https://github.com/pillarjs/path-to-regexp
 *
 * 由于一个请求可能会同时命中多个 匹配规则，需要计算 优先级，并根据优先级 从高到低 排序。
 *
 * 规则：
 * 1. 无参数的规则优先级最高
 * 2. 参数规则少的优先级高，对于参数数量相同的，根据参数所在位置，参数越靠后的优先级越高
 * 3. 对于可选参数，优先级应该比必填参数低
 * 4. 对于通配符的参数，优先级应该比其他参数低
 */
import type { Parameter, Text, Token, Wildcard } from 'path-to-regexp'
import type { MockMatchPriority } from '../types'
import {
  isArray,
  isEmptyObject,
  sortBy,
  uniq,
} from '@pengzhanbo/utils'
import { parse, pathToRegexp } from 'path-to-regexp'
import { isPathMatch } from '../utils'

type PathToken = (Text & { optional?: boolean })
  | (Parameter & { optional?: boolean })
  | (Wildcard & { optional?: boolean })

const tokensCache: Record<string, PathToken[]> = {}

function getTokens(rule: string) {
  if (tokensCache[rule])
    return tokensCache[rule]
  const res: PathToken[] = []
  const flatten = (tokens: Token[], group = false) => {
    for (const token of tokens) {
      if (token.type === 'text') {
        const sub = token.value.split('/').filter(Boolean)
        sub.length && res.push(...sub.map(v => ({ type: 'text', value: v } as PathToken)))
      }
      else if (token.type === 'group') {
        flatten(token.tokens, true)
      }
      else {
        if (group)
          (token as PathToken).optional = true
        res.push(token)
      }
    }
  }
  flatten(parse(rule).tokens)
  tokensCache[rule] = res
  return res
}

function getHighest(rules: string[]) {
  let weights = rules.map(rule => getTokens(rule).length)
  weights = weights.length === 0 ? [1] : weights
  return Math.max(...weights) + 2
}

function sortFn(rule: string) {
  const tokens = getTokens(rule)
  let w = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type !== 'text')
      w += 10 ** (i + 1)

    w += 10 ** (i + 1)
  }
  return w
}

function preSort(rules: string[]) {
  let matched: string[] = []
  const preMatch: string[][] = []

  for (const rule of rules) {
    const tokens = getTokens(rule)

    const len = tokens.filter(token => token.type !== 'text').length
    if (!preMatch[len])
      preMatch[len] = []
    preMatch[len].push(rule)
  }
  // 归类相同参数数量，并根据参数位置进行排序
  for (const match of preMatch.filter(v => v && v.length > 0))
    matched = [...matched, ...sortBy(match, sortFn).reverse()]

  return matched
}

function defaultPriority(rules: string[]) {
  const highest = getHighest(rules)

  return sortBy(rules, (rule) => {
    const tokens = getTokens(rule)
    const dym = tokens.filter(token => token.type !== 'text')
    if (dym.length === 0)
      return 0

    let weight = dym.length
    let exp = 0
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      // 动态参数，包括命名参数、可选参数、剩余参数通配符
      const isDynamic = token.type !== 'text'
      // 通配符 剩余参数 foo/*bar
      //                     ^^^^
      const isWildcard = token.type === 'wildcard'
      // 可选参数: foo{/:bar}  可选剩余参数 foo{/*bar}
      //              ^^^^^^^                  ^^^^^^^
      const isOptional = !!token.optional

      exp += isDynamic ? 1 : 0

      // 如果规则末尾是通配，则优先级最低
      if (i === tokens.length - 1 && isWildcard) {
        weight += (isOptional ? 5 : 4) * 10 ** (tokens.length === 1 ? highest + 1 : highest)
      }
      else {
        // 非末尾的通配，优先级次低
        if (isWildcard) {
          weight += 3 * 10 ** (highest - 1)
        }
        else {
          weight += 2 * 10 ** exp
        }
        // 降低可选参数优先级
        if (isOptional) {
          weight += 10 ** exp
        }
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
    preSort(rules.filter(rule => isPathMatch(rule, url))),
  )

  const { global = [], special = {} } = priority

  // 未配置自定义的排序规则，直接返回匹配结果
  if ((global.length === 0 && isEmptyObject(special)) || matched.length === 0)
    return matched

  const [statics, dynamics] = twoPartMatch(matched)
  const globalMatch = global.filter(rule => dynamics.includes(rule))

  if (globalMatch.length > 0) {
    // 静态规则优先级最高，用户配置的规则插入到静态规则后，保证静态规则优先
    matched = uniq([...statics, ...globalMatch, ...dynamics])
  }
  if (isEmptyObject(special))
    return matched

  // 检查当前匹配规则中是否包含特殊规则，有则需要调整匹配顺序
  const specialRule = Object.keys(special).filter(rule =>
    matched.includes(rule),
  )[0]

  if (!specialRule)
    return matched

  const options = special[specialRule]
  const { rules: lowerRules, when } = isArray(options)
    ? { rules: options, when: [] }
    : options

  if (lowerRules.includes(matched[0])) {
    if (
      when.length === 0
      || when.some(path => pathToRegexp(path).regexp.test(url))
    ) {
      // 特殊规则插入到最前，保证特殊规则优先
      matched = uniq([specialRule, ...matched])
    }
  }

  return matched
}

/**
 * 将规则分为静态和动态两部分
 */
function twoPartMatch(rules: string[]) {
  const statics: string[] = []
  const dynamics: string[] = []
  for (const rule of rules) {
    const tokens = getTokens(rule)
    // 如果 tokens 中包含动态参数，则为动态规则
    const dym = tokens.filter(token => token.type !== 'text')
    if (dym.length > 0)
      dynamics.push(rule)
    else statics.push(rule)
  }
  return [statics, dynamics]
}
