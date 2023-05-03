import type { ExtraRequest } from './types'

export function validate(
  request: ExtraRequest,
  validator: Partial<ExtraRequest>,
): boolean {
  return (
    equalObj(request.headers, validator.headers) &&
    // TODO: body deep equal
    // 在实际的场景中，body的情况是比较复杂的，仅当做json 浅层对比并不能完全满足需求
    equalObj(request.body, validator.body) &&
    equalObj(request.params, validator.params) &&
    equalObj(request.query, validator.query) &&
    equalObj(request.refererQuery, validator.refererQuery)
  )
}

export function equalObj(
  left: Record<string, any>,
  right?: Record<string, any>,
): boolean {
  if (!right) return true
  for (const key in right) {
    if (right[key] !== left[key]) return false
  }
  return true
}
