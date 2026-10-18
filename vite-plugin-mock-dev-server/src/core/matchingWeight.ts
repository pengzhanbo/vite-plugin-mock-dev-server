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
import type { MockMatchPriority } from '../types/index.js'
import { isArray, isEmptyObject, LRUCache, partition, uniq } from '@pengzhanbo/utils'
import { parse, pathToRegexp } from 'path-to-regexp'
import { isPathMatch } from '../utils/index.js'

type PathToken =
  | (Text & { optional?: boolean })
  | (Parameter & { optional?: boolean })
  | (Wildcard & { optional?: boolean })

/**
 * URL 规则的 token 缓存
 *
 * 使用 `LRUCache` 而非普通对象，避免原型链上的 `constructor` / `toString` / `__proto__`
 * 等键造成语义混乱，同时限制 mock 文件频繁增删改时的缓存增长
 *
 * Token cache of URL rules.
 *
 * `LRUCache` is used instead of a plain object to avoid the confusing semantics of
 * keys inherited from the prototype chain (`constructor` / `toString` / `__proto__`),
 * and to bound the cache growth when mock files are frequently added, removed or edited.
 */
const tokensCache = new LRUCache<string, PathToken[]>({ maxSize: 1024 })

function getTokens(rule: string): PathToken[] {
  const cached = tokensCache.get(rule)
  if (cached) {
    return cached
  }
  const res: PathToken[] = []
  const flatten = (tokens: Token[], group = false): void => {
    for (const token of tokens) {
      if (token.type === 'text') {
        const sub = token.value.split('/').filter(Boolean)
        sub.length && res.push(...sub.map((v) => ({ type: 'text' as const, value: v })))
      } else if (token.type === 'group') {
        flatten(token.tokens, true)
      } else {
        if (group) {
          ;(token as PathToken).optional = true
        }
        res.push(token)
      }
    }
  }
  flatten(parse(rule).tokens)
  tokensCache.set(rule, res)
  return res
}

function getHighest(rules: string[]): number {
  let weights = rules.map((rule) => getTokens(rule).length)
  weights = weights.length === 0 ? [1] : weights
  return Math.max(...weights) + 2
}

function computedWeight(rule: string, highest: number): number {
  const tokens = getTokens(rule)
  const dym = tokens.filter((token) => token.type !== 'text')
  if (dym.length === 0) {
    return 0
  }

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
    } else {
      // Non-trailing wildcards have the second lowest priority
      // 非末尾的通配，优先级次低
      if (isWildcard) {
        weight += 3 * 10 ** (highest - 1)
      } else {
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

function defaultPriority(rules: string[]): string[] {
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
  priority: MockMatchPriority = {},
): string[] {
  // Sort by default rules first
  // 基于默认规则下进行优先级排序
  let matched = defaultPriority(rules.filter((rule) => isPathMatch(rule, url)))

  const { global = [], special = {} } = priority

  // If no custom sorting rules are configured, return the matching result directly
  // 未配置自定义的排序规则，直接返回匹配结果
  if ((global.length === 0 && isEmptyObject(special)) || matched.length === 0) {
    return matched
  }

  // Split matching results into static and dynamic rules
  // 将匹配结果分为静态规则和动态规则
  const [dynamics, statics] = partition(
    matched,
    (rule) => getTokens(rule).filter((token) => token.type !== 'text').length > 0,
  )
  const globalMatch = global.filter((rule) => dynamics.includes(rule))

  if (globalMatch.length > 0) {
    // Static rules have the highest priority, user-configured rules are inserted after static rules
    // 静态规则优先级最高，用户配置的规则插入到静态规则后，保证静态规则优先
    matched = uniq([...statics, ...globalMatch, ...dynamics])
  }
  if (isEmptyObject(special)) {
    return matched
  }

  // Check if the current matching rules contain special rules that need order adjustment.
  //
  // Every applicable special rule is promoted, not only the first configured one:
  // a request may hit several special rules at once, and the ones declared later
  // must not be silently ignored. The configuration order is kept, so a rule
  // declared earlier ends up in front of the ones declared later.
  //
  // 检查当前匹配规则中是否包含需要调整顺序的特殊规则。
  //
  // 所有满足条件的特殊规则都会被提升，而不是只处理配置中首个命中的规则：
  // 一次请求可能同时命中多条特殊规则，配置靠后的规则不应被静默忽略。
  // 提升后保持配置顺序，即配置靠前的规则排在靠后的规则之前。
  const top = matched[0]
  const promoted: string[] = []

  for (const rule of Object.keys(special)) {
    // The special rule itself has to match the current request
    // 特殊规则本身必须命中当前请求
    if (!matched.includes(rule)) {
      continue
    }

    const options = special[rule]
    const { rules: lowerRules, when } = isArray(options) ? { rules: options, when: [] } : options

    // The rule is only promoted when one of its competing rules is currently on top,
    // and the optional `when` condition matches
    // 仅当与其竞争的规则当前位于首位，且满足可选的 `when` 条件时才提升
    if (!lowerRules.includes(top)) {
      continue
    }
    if (when.length > 0 && !when.some((path) => pathToRegexp(path).regexp.test(url))) {
      continue
    }

    promoted.push(rule)
  }

  if (promoted.length === 0) {
    return matched
  }

  // Insert the promoted rules at the front to ensure they take priority
  // 将提升的规则插入到最前，保证特殊规则优先
  return uniq([...promoted, ...matched])
}

/**
 * 带排序结果缓存的匹配权重排序器
 *
 * 以请求路径为键缓存排序结果，避免每个请求都重新排序全部候选规则。
 * 缓存结果依赖 `rules`（全部 mock url）与 `priority` 配置：
 * 前者随 mock 数据热更新而变化，后者由插件配置决定、运行时不变，
 * 因此 mock 数据更新后（`mock:update-end`）需要调用返回函数的 `clear()` 清空缓存。
 *
 * Matching weight sorter with a sorted result cache.
 *
 * The sorted result is cached by request pathname to avoid re-sorting all candidate
 * rules on every request. The result depends on `rules` (all mock urls) and the
 * `priority` config: the former changes when mock data is hot-reloaded, the latter is
 * fixed by the plugin options at runtime. So the cache must be cleared by calling
 * `clear()` on the returned sorter once mock data is updated (`mock:update-end`).
 *
 * 每个中间件实例持有独立的排序器，避免不同 mock 数据集之间相互影响
 *
 * Each middleware instance owns its own sorter, so different mock datasets never
 * interfere with each other
 *
 * @param maxSize - Cache size / 缓存容量
 * @returns Cached sorter function / 带缓存的排序函数
 */
export interface MatchingWeightSorter {
  (rules: string[], url: string, priority?: MockMatchPriority): string[]
  /**
   * Clear the sorted result cache
   *
   * 清空排序结果缓存
   */
  clear: () => void
}

/**
 * Create a matching weight sorter with sorted result cache
 *
 * 创建一个带排序结果缓存的匹配权重排序器
 *
 * @param maxSize - Cache size / 缓存容量
 * @returns Cached sorter function / 带缓存的排序函数
 */
export function createMatchingWeightSorter(maxSize = 1024): MatchingWeightSorter {
  const sortedCache = new LRUCache<string, string[]>({ maxSize })
  const sorter: MatchingWeightSorter = (rules, url, priority = {}) => {
    const cached = sortedCache.get(url)
    if (cached) {
      return cached
    }
    const matched = matchingWeight(rules, url, priority)
    if (matched.length > 0) {
      sortedCache.set(url, matched)
    }
    return matched
  }
  sorter.clear = () => sortedCache.clear()
  return sorter
}
