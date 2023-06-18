import type { ExtraRequest } from './types'
import { isArray, isObject } from './utils'

export function validate(
  request: ExtraRequest,
  validator: Partial<ExtraRequest>,
): boolean {
  return (
    isObjectSubset(request.headers, validator.headers) &&
    isObjectSubset(request.body, validator.body) &&
    isObjectSubset(request.params, validator.params) &&
    isObjectSubset(request.query, validator.query) &&
    isObjectSubset(request.refererQuery, validator.refererQuery)
  )
}

/**
 * Checks if target object is a subset of source object.
 * That is, all properties and their corresponding values in target exist in source.
 *
 * 深度比较两个对象之间，target 是否属于 source 的子集，
 * 即 target 的所有属性和对应的值，都在 source 中，
 */
export function isObjectSubset<T extends object>(
  source: T,
  target?: T,
): boolean {
  if (!target) return true
  for (const key in target) {
    if (!isIncluded(source[key], target[key])) {
      return false
    }
  }
  return true
}

function isIncluded(source: unknown, target: unknown): boolean {
  if (isArray(source) && isArray(target)) {
    // 避免 target 中的重复项，而在 source 中仅出现一次
    // 同时使得数组的包含关系需要较弱的先后顺序，具体表现在 项为对象时，先排序的先比较
    const seen = new Set<number>()
    return target.every((ti) =>
      source.some((si, i) => {
        if (seen.has(i)) return false
        const included = isIncluded(si, ti)
        if (included) seen.add(i)
        return included
      }),
    )
  }
  if (isObject(source) && isObject(target)) {
    return isObjectSubset(source, target)
  }
  // 相比于 === ， 该方法能够正确的处理 NaN、 0、 +0、 -0 等特殊情况
  return Object.is(source, target)
}
