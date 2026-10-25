/**
 * Response status
 *
 * 响应状态
 *
 * Status code and status text are resolved here, so every place answering a request
 * (mock response, error simulation, fallback error) shares the same mapping.
 *
 * 状态码与状态文本在此统一解析，使所有结束请求的位置（mock 响应、错误模拟、兜底错误）
 * 共用同一份映射关系。
 */

import type { MockResponse } from '../types/index.js'
import HTTP_STATUS from 'http-status'

/**
 * Get HTTP status text by status code
 *
 * 根据状态码获取状态文本
 *
 * @param status - HTTP status code / HTTP 状态码
 * @returns HTTP status text / HTTP 状态文本
 */
export function getHTTPStatusText(status: number): string {
  return (HTTP_STATUS[status as keyof typeof HTTP_STATUS] as string) || 'Unknown'
}

/**
 * Set response status
 *
 * 设置响应状态
 *
 * @param response - Response object / 响应对象
 * @param status - HTTP status code / HTTP 状态码
 * @param statusText - HTTP status text / HTTP 状态文本
 */
export function provideResponseStatus(
  response: MockResponse,
  status = 200,
  statusText?: string,
): void {
  response.statusCode = status
  response.statusMessage = statusText ?? getHTTPStatusText(status)
}
