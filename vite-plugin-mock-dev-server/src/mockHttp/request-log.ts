/**
 * Request logging
 *
 * 请求日志
 */

import type { MockRequest } from '../types/index.js'
import { isEmptyObject } from '@pengzhanbo/utils'
import ansis from 'ansis'

/**
 * Format log data
 *
 * 格式化日志数据
 *
 * @param prefix - Log prefix / 日志前缀
 * @param data - Data to format / 要格式化的数据
 * @returns Formatted log string / 格式化后的日志字符串
 */
function formatLog(prefix: string, data: any): string {
  return !data || isEmptyObject(data) ? '' : `  ${ansis.gray(`${prefix}:`)}${JSON.stringify(data)}`
}

/**
 * Generate request log
 *
 * 生成请求日志
 *
 * @param request - Request object / 请求对象
 * @param filepath - Mock file path / Mock 文件路径
 * @param shouldSimulateError - Whether to simulate error / 是否模拟错误
 * @returns Formatted log string / 格式化后的日志字符串
 */
export function requestLog(
  request: MockRequest,
  filepath: string,
  shouldSimulateError?: boolean,
): string {
  const { url, method, query, params, body } = request
  let { pathname } = new URL(url!, 'http://example.com')
  pathname = ansis.green(decodeURIComponent(pathname))
  const ms = ansis.magenta.bold(method)
  const qs = formatLog('query', query)
  const ps = formatLog('params', params)
  const bs = formatLog('body', body)
  const es = shouldSimulateError ? ` 🎲 ${ansis.bgYellow('ERR')}` : ''
  const file = `  ${ansis.dim.underline(`(${filepath})`)}`
  return `${ms}${es} ${pathname}${qs}${ps}${bs}${file}`
}
