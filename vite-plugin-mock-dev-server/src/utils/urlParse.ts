import type { ParsedUrlQuery } from 'node:querystring'
import { parse as queryParse } from 'node:querystring'

/**
 * Parse URL into pathname and query
 *
 * 解析 URL 为 pathname 和 query
 *
 * nodejs 从 19.0.0 开始 弃用 url.parse，因此使用 url.parse 来解析 可能会报错，
 * 使用 URL 来解析
 *
 * @param input - URL string to parse / 要解析的 URL 字符串
 * @returns Object with pathname and query properties / 带有 pathname 和 query 属性的对象
 */
export function urlParse(input: string): {
  /**
   * Parsed pathname
   *
   * 解析后的路径名
   */
  pathname: string
  /**
   * Parsed query
   *
   * 解析后的查询参数
   */
  query: ParsedUrlQuery
} {
  const url = new URL(input, 'http://example.com')
  const pathname = decodeURIComponent(url.pathname)
  const query = queryParse(url.search.replace(/^\?/, ''))
  return { pathname, query }
}
