/**
 * Request extras of the mock websocket server
 *
 * Mock WebSocket 服务的请求扩展
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ParsedUrlQuery } from 'node:querystring'
import type { CookiesOption, MockRequest } from '../types/index.js'
import Cookies from 'cookies'
import { parseRequestParams } from '../mockHttp/index.js'
import { urlParse } from '../utils/index.js'

/**
 * Options of `createWebSocketRequest`
 *
 * `createWebSocketRequest` 的选项
 */
export interface CreateWebSocketRequestOptions {
  /**
   * Key of the matched mock url / 命中的 mock url 的键
   */
  mockUrl: string
  /**
   * Request pathname / 请求路径
   */
  pathname: string
  /**
   * Parsed query of the upgrade request / 升级请求解析后的 query
   */
  query: ParsedUrlQuery
  /**
   * Cookie options of the plugin / 插件的 cookie 配置
   */
  cookiesOptions: CookiesOption
}

/**
 * 为升级请求附加 mock 所需的请求信息
 *
 * 与 HTTP 侧保持一致，`setup()` 的 `connection` 处理函数可以从 `req` 上读取
 * `query`、`refererQuery`、`params` 与 `getCookie`。
 *
 * Attach the request information needed by the mock to an upgrade request.
 *
 * Consistent with the HTTP side, the `connection` handler of `setup()` can read
 * `query`, `refererQuery`, `params` and `getCookie` from `req`.
 *
 * @param req - Upgrade request / 升级请求
 * @param options - Request extras / 请求扩展信息
 * @returns Extended request / 扩展后的请求
 */
export function createWebSocketRequest(
  req: IncomingMessage,
  { mockUrl, pathname, query, cookiesOptions }: CreateWebSocketRequestOptions,
): MockRequest {
  const request = req as MockRequest
  // 升级请求没有 `ServerResponse`，这里复用 `req`：`getCookie()` 只读取请求，
  // 不会写入响应
  const cookies = new Cookies(req, req as unknown as ServerResponse, cookiesOptions)
  const { query: refererQuery } = urlParse(req.headers.referer ?? '')

  request.query = query
  request.refererQuery = refererQuery
  request.params = parseRequestParams(mockUrl, pathname)
  request.getCookie = cookies.get.bind(cookies)

  return request
}
