import type { ParsedUrlQuery } from 'node:querystring'
import { parse as queryParse } from 'node:querystring'

/**
 * nodejs 从 19.0.0 开始 弃用 url.parse，因此使用 url.parse 来解析 可能会报错，
 * 使用 URL 来解析
 */
export function urlParse(input: string): {
  pathname: string
  query: ParsedUrlQuery
} {
  const url = new URL(input, 'http://example.com')
  const pathname = decodeURIComponent(url.pathname)
  const query = queryParse(url.search.replace(/^\?/, ''))
  return { pathname, query }
}
