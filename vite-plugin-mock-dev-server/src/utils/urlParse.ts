import type { ParsedUrlQuery } from 'node:querystring'
import { parse as queryParse } from 'node:querystring'

/**
 * Parsed URL
 *
 * 解析后的 URL
 */
export interface ParsedUrl {
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
  /**
   * Parse error, present only when the input cannot be parsed
   *
   * 解析错误，仅当输入无法解析时存在
   */
  error?: Error
}

/**
 * Parse URL into pathname and query
 *
 * 解析 URL 为 pathname 和 query
 *
 * @param input - URL string to parse / 要解析的 URL 字符串
 * @returns Parsed pathname, query and the parse error / 解析后的 pathname、query 与解析错误
 */
export function urlParse(input: string): ParsedUrl {
  try {
    const url = new URL(input, 'http://example.com')
    const pathname = decodeURIComponent(url.pathname)
    const query = queryParse(url.search.replace(/^\?/, ''))
    return { pathname, query }
  } catch (error) {
    return { pathname: '', query: {}, error: error as Error }
  }
}
