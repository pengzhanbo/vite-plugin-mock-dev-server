import type { SetCookieOption } from './cookies'
import type { Headers, MockRequest, ResponseBody } from './http'
import type { LogLevel } from './options'

export type ResponseBodyFn = (
  request: MockRequest,
) => ResponseBody | Promise<ResponseBody>

export type ResponseHeaderFn = (request: MockRequest) => Headers | Promise<Headers>

export type CookieValue = string | [string, SetCookieOption]

export type ResponseCookies = Record<string, CookieValue>

export type ResponseCookiesFn = (
  request: MockRequest,
) => ResponseCookies | Promise<ResponseCookies>

export interface MockBaseItem {
  /**
   * The interface address that needs to be mocked,
   * supported by `path-to-regexp@8.3.0` for path matching.
   *
   * 需要进行 mock 的接口地址, 由 `path-to-regexp@8.3.0` 提供路径匹配支持
   * @see [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
   * @example
   * ```txt
   * /api/login
   * /api/post/:id
   * /api/users{/:id}
   * /api/files/*path
   * ```
   */
  url: string
  /**
   * Enable WebSocket interface simulation
   *
   * 开启 websocket 接口模拟
   *
   * @default false
   */
  ws?: boolean
  /**
   * Whether to enable mock for this interface.
   * In most scenerios, we only need to mock some interfaces instead of all requests that
   * have been configured with mock.
   * Therefore, it is important to be able to configure whether to enable it or not.
   *
   * 是否启动对该接口的mock，在多数场景下，我们仅需要对部分接口进行 mock，
   * 而不是对所有配置了mock的请求进行全量mock，所以是否能够配置是否启用很重要
   * @default true
   */
  enabled?: boolean

  /**
   * Enable log and configure log level
   *
   * 开启日志，或配置 日志级别
   * @default 'info'
   */
  log?: boolean | LogLevel
  /**
   * Scenario identifier for this mock.
   * When not configured, the mock is universal and always matches regardless of active scenario.
   * When configured, the mock only matches when at least one of its scenarios matches
   * one of the active scenarios.
   *
   * 该 mock 的场景标识。
   * 未配置时，该 mock 为全场景通用，不受 activeScene 限制。
   * 配置后，只有 scene 中任意一项与 activeScene 中任意一项匹配时，该 mock 才会激活。
   */
  scene?: string | string[]
}
