/**
 * Rule matching priority
 *
 * 规则匹配优先级
 *
 * @see https://github.com/pillarjs/path-to-regexp
 *
 * Since a request may match multiple rules simultaneously, we need to calculate
 * priority and sort from highest to lowest.
 *
 * 由于一个请求可能会同时命中多个匹配规则，需要计算优先级，并根据优先级从高到低排序。
 *
 * Rules:
 * 1. Rules without parameters have the highest priority
 * 2. Rules with fewer parameters have higher priority. For rules with the same number
 *    of parameters, the later the parameter appears, the higher the priority
 * 3. Optional parameters should have lower priority than required parameters
 * 4. Wildcard parameters should have lower priority than other parameters
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
  partition,
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

function computedWeight(rule: string, highest: number): number {
  const tokens = getTokens(rule)
  const dym = tokens.filter(token => token.type !== 'text')
  if (dym.length === 0)
    return 0

  let weight = dym.length
  let exp = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    // Dynamic parameters, including named parameters, optional parameters, and wildcard remaining parameters
    // 动态参数，包括命名参数、可选参数、剩余参数通配符
    const isDynamic = token.type !== 'text'
    // Wildcard remaining parameters: foo/*bar
    // 通配符剩余参数: foo/*bar
    //                     ^^^^
    const isWildcard = token.type === 'wildcard'
    // Optional parameters: foo{/:bar}, optional remaining parameters: foo{/*bar}
    // 可选参数: foo{/:bar}  可选剩余参数 foo{/*bar}
    //              ^^^^^^^                  ^^^^^^^
    const isOptional = !!token.optional

    exp += isDynamic ? 1 : 0

    // If the rule ends with a wildcard, it has the lowest priority
    // 如果规则末尾是通配，则优先级最低
    if (i === tokens.length - 1 && isWildcard) {
      weight += (isOptional ? 5 : 4) * 10 ** (tokens.length === 1 ? highest + 1 : highest)
    }
    else {
      // Non-trailing wildcards have the second lowest priority
      // 非末尾的通配，优先级次低
      if (isWildcard) {
        weight += 3 * 10 ** (highest - 1)
      }
      else {
        weight += 2 * 10 ** exp
      }
      // Lower priority for optional parameters
      // 降低可选参数优先级
      if (isOptional) {
        weight += 10 ** exp
      }
    }
  }
  return weight
}

function defaultPriority(rules: string[]) {
  const highest = getHighest(rules)
  return rules.sort((a, b) => computedWeight(a, highest) - computedWeight(b, highest))
}

/**
 * Calculate matching weight for mock URLs
 *
 * 计算 Mock URL 的匹配权重
 *
 * @param rules - Array of URL patterns / URL 模式数组
 * @param url - Request URL / 请求 URL
 * @param priority - Priority configuration / 优先级配置
 * @returns Sorted array of matched rules / 排序后的匹配规则数组
 */
export function matchingWeight(
  rules: string[],
  url: string,
  priority: MockMatchPriority,
): string[] {
  // Sort by default rules first
  // 基于默认规则下进行优先级排序
  let matched = defaultPriority(rules.filter(rule => isPathMatch(rule, url)))

  const { global = [], special = {} } = priority

  // If no custom sorting rules are configured, return the matching result directly
  // 未配置自定义的排序规则，直接返回匹配结果
  if ((global.length === 0 && isEmptyObject(special)) || matched.length === 0)
    return matched

  // Split matching results into static and dynamic rules
  // 将匹配结果分为静态规则和动态规则
  const [dynamics, statics] = partition(
    matched,
    rule => getTokens(rule).filter(token => token.type !== 'text').length > 0,
  )
  const globalMatch = global.filter(rule => dynamics.includes(rule))

  if (globalMatch.length > 0) {
    // Static rules have the highest priority, user-configured rules are inserted after static rules
    // 静态规则优先级最高，用户配置的规则插入到静态规则后，保证静态规则优先
    matched = uniq([...statics, ...globalMatch, ...dynamics])
  }
  if (isEmptyObject(special))
    return matched

  // Check if the current matching rules contain special rules that need order adjustment
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
      // Insert special rule at the front to ensure it takes priority
      // 特殊规则插入到最前，保证特殊规则优先
      matched = uniq([specialRule, ...matched])
    }
  }

  return matched
}
