import type http from 'node:http'
import type Cookies from 'cookies'
import type formidable from 'formidable'
import type { Connect } from 'vite'

export interface MockServerPluginOptions {
  /**
   * To configure the path matching rules for mock services,
   * any request path starting with prefix will be intercepted and proxied.
   * If the prefix starts with `^`, it will be recognized as a `RegExp`.
   *
   * 为 mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
   * 如果 prefix 以 `^` 开头，将被识别为 `RegExp`。
   * @default []
   * @example ['^/api']
   */
  prefix?: string | string[]
  /**
   * glob string matching mock includes files
   *
   * glob 字符串匹配 mock 包含的文件
   * @see [picomatch](https://github.com/micromatch/picomatch#globbing-features)
   * @default []
   */
  include?: string | string[]
  /**
   * glob string matching mock excluded files
   *
   * glob 字符串匹配 mock 排除的文件
   * @see [picomatch](https://github.com/micromatch/picomatch#globbing-features)
   */
  exclude?: string | string[]

  /**
   * When the mock resource is hot updated, only the data content is updated,
   * but the page is not refreshed by default.
   * If you want to refresh the page every time you modify a mock file,
   * you can open this option.
   *
   * mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。
   * 当你希望每次修改mock文件都刷新页面时，可以打开此选项。
   * @default false
   */
  reload?: boolean

  /**
   * formidable options
   * @see [formidable](https://github.com/node-formidable/formidable#options)
   */
  formidableOptions?: formidable.Options

  /**
   * cookies options
   * @see [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)
   */
  cookiesOptions?: Cookies.Option

  /**
   * When you need to build a small mock service, you can configure this option.
   *
   * 当需要构建一个小型mock服务时，可配置此项
   * @default false
   */
  build?: boolean | ServerBuildOption
}

export interface ServerBuildOption {
  /**
   * Service startup port
   *
   * 服务启动端口
   * @default 8080
   */
  serverPort?: number
  /**
   * Service application output directory
   *
   * 服务应用输出目录
   * @default 'dist/mockServer'
   */
  dist?: string
}

export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'TRACE'
  | 'OPTIONS'

type Headers = http.IncomingHttpHeaders

type ResponseBody = Record<string, any> | any[] | string | number | null

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
}

export type MockRequest = Connect.IncomingMessage &
  ExtraRequest & {
    /**
     * @see [cookies](https://github.com/pillarjs/cookies#cookiesgetname--options)
     */
    getCookie: (name: string, option?: Cookies.GetOption) => string | undefined
  }

export type MockResponse = http.ServerResponse<http.IncomingMessage> & {
  /**
   * @see [cookies](https://github.com/pillarjs/cookies#cookiessetname--values--options)
   */
  setCookie: (
    name: string,
    value?: string | null,
    option?: Cookies.SetOption,
  ) => void
}

type ResponseBodyFn = (
  request: MockRequest,
) => ResponseBody | Promise<ResponseBody>

type ResponseHeaderFn = (request: MockRequest) => Headers | Promise<Headers>

type CookieValue = string | [string, Cookies.SetOption]
type ResponseCookies = Record<string, CookieValue>
type ResponseCookiesFn = (
  request: MockRequest,
) => ResponseCookies | Promise<ResponseCookies>

export interface MockOptionsItem {
  /**
   * The interface address that needs to be mocked,
   * supported by `path-to-regexp` for path matching.
   *
   * 需要进行 mock 的接口地址, 由 `path-to-regexp` 提供路径匹配支持
   * @see [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
   * @example
   * ```txt
   * /api/login
   * /api/post/:id
   * /api/post/:id
   * ```
   */
  url: string
  /**
   * The interface allows request methods, and by default allows both GET and POST.
   *
   * 该接口允许的 请求方法，默认同时支持 GET 和 POST
   * @default ['POST','GET']
   */
  method?: Method | Method[]
  /**
   * Whether to enable mock for this interface.
   * In most scenarios, we only need to mock some interfaces instead of all requests that
   * have been configured with mock.
   * Therefore, it is important to be able to configure whether to enable it or not.
   *
   * 是否启动对该接口的mock，在多数场景下，我们进需要对部分接口进行 mock，
   * 而不是对所有配置了mock的请求进行全量mock，所以是否能够配置是否启用很重要
   * @default true
   */
  enabled?: boolean
  /**
   * Configure the response body headers
   *
   * 配置响应体 headers
   * @default
   * ```json
   * { "Content-Type": "application/json" }
   * ```
   */
  headers?: Headers | ResponseHeaderFn
  /**
   * Configure Response Header Status Code
   *
   * 配置 响应头状态码
   * @default 200
   */
  status?: number
  /**
   * Configure response header status text
   *
   * 配置响应头状态文本
   * @default 'OK'
   */
  statusText?: string
  /**
   * Configure response delay time, unit: `ms`
   *
   * 配置响应延迟时间, 单位： `ms`
   * @default 0
   */
  delay?: number

  /**
   * Configure response body cookies
   *
   * 设置响应体 cookies
   * @example
   * ```ts
   * export default {
   *   cookies: {
   *     'token1': '1234567',
   *     'token2': ['1234567', { path: '/' }],
   *   },
   * }
   * ```
   * @example
   * ```ts
   * export default {
   *   cookies: function (request) {
   *     return {
   *       'token1': '1234567',
   *       'token2': ['1234567', { path: '/' }],
   *     }
   *   },
   * }
   * ```
   */
  cookies?: ResponseCookies | ResponseCookiesFn
  /**
   * Configure response body data content
   *
   * 配置响应体数据内容
   * @default ''
   * @example
   * ```ts
   * export default {
   *   body: { a: 1 },
   * }
   * ```
   * @example
   * ```ts
   * export default {
   *   body: function(request) {
   *     return { a: 1, query: request.query }
   *   },
   * }
   * ```
   */
  body?: ResponseBody | ResponseBodyFn
  /**
   * If you need to set complex response content, you can use the response method,
   * which is a middleware. Here, you can get information such as req
   * and res of the http request,
   * and then return response data through res.write() | res.end().
   * Otherwise, you need to execute next() method.
   * In `req`, you can also get parsed request information such as
   * `query`, `params`, `body` and `refererQuery`.
   *
   * 如果需要设置复杂的响应内容，可以使用 response 方法，
   * 该方法是一个 middleware，你可以在这里拿到 http 请求的 req、res等信息，
   * 然后通过 res.write() | res.end() 返回响应数据， 否则需要执行 next() 方法。
   * 在 `req` 中，还可以拿到 query、params、body, refererQuery 等已解析的请求信息。
   *
   * @see [connect](https://github.com/senchalabs/connect#appusefn)
   * @example
   * ```ts
   * export default {
   *   response(req, res) {
   *     res.setHeader('Content-Type', 'application/json')
   *     res.end(JSON.stringify({ a: 1 }))
   *   },
   * }
   * ```
   *
   */
  response?: (
    req: MockRequest,
    res: MockResponse,
    next: Connect.NextFunction,
  ) => void | Promise<void>

  /**
   * Request Validator
   *
   * Sometimes, for the same API request, data needs to be returned based
   * on different request parameters.
   * However, if all of this is written in a single mock's body or response,
   * the content can become cumbersome and difficult to manage.
   * The function of a validator allows you to configure multiple mocks with
   * the same URL simultaneously and determine which mock should be used through validation.
   *
   * 请求验证器
   *
   * 有时候，一个相同的API请求，需要根据不同的请求参数，来决定返回数据，
   * 但全部都在单个 mock中的 body或者 response 中写，内容会很庞杂，不好管理，
   * 验证器的功能，允许你同时配置多条相同url的mock，通过验证器来判断使哪个mock生效。
   * @example
   * ```ts
   * export default {
   *   validator: {
   *     query: { id: 123 }
   *   }
   * }
   * ```
   * @example
   * ```ts
   * export default {
   *   validator: function(request) {
   *     return request.query.id === 123
   *   }
   * }
   * ```
   */
  validator?: Partial<ExtraRequest> | ((request: ExtraRequest) => boolean)
}

export type MockOptions = MockOptionsItem[]

export type FormidableFile = formidable.File | formidable.File[]
