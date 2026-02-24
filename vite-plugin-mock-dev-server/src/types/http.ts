import type { Buffer } from 'node:buffer'
import type http from 'node:http'
import type { Readable } from 'node:stream'
import type { Connect } from 'vite'
import type { GetCookieOption, SetCookieOption } from './cookies'

export type Method
  = | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'TRACE'
    | 'OPTIONS'

export type Headers = http.IncomingHttpHeaders

export type ResponseBody
  = | Record<string, any>
    | any[]
    | string
    | number
    | Readable
    | Buffer
    | null

/**
 * 扩展 request，添加额外的属性和方法
 */
export interface ExtraRequest {
  /**
   * The query string located after `?` in the request address has been parsed into JSON.
   *
   * 请求地址中位于 `?` 后面的 queryString，已解析为 json
   */
  query: Record<string, any>
  /**
   * The queryString located after `?` in the referer request has been parsed as JSON.
   *
   * 请求 referer 中位于 `?` 后面的 queryString，已解析为 json
   */
  refererQuery: Record<string, any>
  /**
   * Body data in the request
   *
   * 请求体中 body 数据
   */
  body: Record<string, any>
  /**
   * The params parameter parsed from the `/api/id/:id` in the request address.
   *
   * 请求地址中，`/api/id/:id` 解析后的 params 参数
   */
  params: Record<string, any>
  /**
   * headers data in the request
   * 请求体中 headers
   */
  headers: Headers
  /**
   * Get the cookie carried in the request.
   *
   * 获取 请求中携带的 cookie
   * @see [cookies](https://github.com/pillarjs/cookies#cookiesgetname--options)
   */
  getCookie: (name: string, options?: GetCookieOption) => string | void
}

export type MockRequest = Connect.IncomingMessage & ExtraRequest

export type MockResponse = http.ServerResponse<http.IncomingMessage> & {
  /**
   * Set cookie in response
   *
   * 向请求响应中设置 cookie
   * @see [cookies](https://github.com/pillarjs/cookies#cookiessetname--values--options)
   */
  setCookie: (name: string, value: string, options?: SetCookieOption) => void
}
