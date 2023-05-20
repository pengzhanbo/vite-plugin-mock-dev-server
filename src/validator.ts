import type { ExtraRequest } from './types'
import { isArray, isObject } from './utils'

export function validate(
  request: ExtraRequest,
  validator: Partial<ExtraRequest>,
): boolean {
  return (
    includeObject(request.headers, validator.headers) &&
    includeObject(request.body, validator.body) &&
    includeObject(request.params, validator.params) &&
    includeObject(request.query, validator.query) &&
    includeObject(request.refererQuery, validator.refererQuery)
  )
}

/**
 * 深度比较两个对象之间，target 是否属于 source 的子集，
 * 即 target 的所有属性和对应的值，都在 source 中，
 */
export function includeObject(
  source: Record<string, any>,
  target?: Record<string, any>,
): boolean {
  if (!target) return true
  return isObjectInclude(source, target)
}

function isObjectInclude<T extends object>(source: T, target: T): boolean {
  for (const key in target) {
    if (!isInclude(source[key], target[key])) {
      return false
    }
  }
  return true
}

function isInclude(source: unknown, target: unknown): boolean {
  if (isArray(source) && isArray(target)) {
    // 避免 target 中的重复项，而在 source 中仅出现一次
    // 同时使得数组的包含关系需要较弱的先后顺序，具体表现在 项为对象时，先排序的先比较
    const seen = new Set()
    return target.every((ti) =>
      source.some((si, i) => {
        if (seen.has(i)) return false
        const include = isInclude(si, ti)
        if (include) seen.add(i)
        return include
      }),
    )
  }
  if (isObject(source) && isObject(target)) {
    return isObjectInclude(source, target)
  }
  return source === target
}
