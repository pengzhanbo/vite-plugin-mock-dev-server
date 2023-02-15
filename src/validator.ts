import type { ResponseReq } from './types'

export function validate(
  request: ResponseReq,
  validator: Partial<ResponseReq>,
): boolean {
  return (
    equalObj(request.headers, validator.headers) &&
    equalObj(request.body, validator.body) &&
    equalObj(request.params, validator.params) &&
    equalObj(request.query, validator.query) &&
    equalObj(request.refererQuery, validator.refererQuery)
  )
}

function equalObj(
  left: Record<string, any>,
  right?: Record<string, any>,
): boolean {
  if (!right) return true
  for (const key in right) {
    if (right[key] !== left[key]) return false
  }
  return true
}
