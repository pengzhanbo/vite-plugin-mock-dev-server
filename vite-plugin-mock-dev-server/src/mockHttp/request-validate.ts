/**
 * Request validation against `validator`
 *
 * 使用 `validator` 校验请求
 */

import type { ExtraRequest, Headers } from '../types/index.js'
import { isObjectSubset } from '../utils/index.js'

/**
 * Normalize header names to lowercase for case-insensitive comparison
 *
 * 将请求头名称归一化为小写，用于大小写不敏感的比较
 *
 * @param headers - Header object to normalize / 需要归一化的请求头对象
 * @returns Normalized header object / 归一化后的请求头对象
 */
function normalizeHeaderNames(headers?: Headers): Headers | undefined {
  if (!headers) {
    return undefined
  }
  const normalized: Headers = {}
  for (const name in headers) {
    normalized[name.toLowerCase()] = headers[name]
  }
  return normalized
}

/**
 * Validate request against validator
 *
 * 验证请求是否符合 validator
 *
 * @param request - Request object / 请求对象
 * @param validator - Validator object / 验证器对象
 * @returns Whether the request is valid / 请求是否有效
 */
export function requestValidate(request: ExtraRequest, validator: Partial<ExtraRequest>): boolean {
  return (
    isObjectSubset(request.headers, normalizeHeaderNames(validator.headers)) &&
    isObjectSubset(request.body, validator.body) &&
    isObjectSubset(request.params, validator.params) &&
    isObjectSubset(request.query, validator.query) &&
    isObjectSubset(request.refererQuery, validator.refererQuery)
  )
}
