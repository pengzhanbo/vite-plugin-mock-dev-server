import type { Buffer } from 'node:buffer'
import type http from 'node:http'
import type { Readable } from 'node:stream'
import type Cookies from 'cookies'
import type { CorsOptions } from 'cors'
import type formidable from 'formidable'
import type { Connect } from 'vite'
import type { WebSocketServer } from 'ws'

/**
 * Configure plugin
 *
 * 插件配置项
 */
export interface MockServerPluginOptions {
  /**
   * To configure the path matching rules for http mock services,
   * any request path starting with prefix will be intercepted and proxied.
   * If the prefix starts with `^`, it will be recognized as a `RegExp`.
   *
   * 为 http mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
   * 如果 prefix 以 `^` 开头，将被识别为 `RegExp`。
   * @default []
   * @example ['^/api']
   */
  prefix?: string | string[]

  /**
   * Configure path matching rules for WebSocket mock service.
   * Any ws/wss requests with a request path starting with wsPrefix
   * will be intercepted by the proxy.
   * If wsPrefix starts with `^`, it will be recognized as a `RegExp`.
   *
   * 为 websocket mock 服务配置 路径匹配规则， 任何请求路径以 wsPrefix 开头的 ws/wss请求，
   * 都将被代理拦截。
   * 如果 wsPrefix 以 `^` 开头，将被识别为 `RegExp`。
   * @default []
   * @example ['/socket.io']
   */
  wsPrefix?: string | string[]
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
   * Enable log and configure log level
   *
   * 开启日志，或配置 日志级别
   * @default 'info'
   */
  log?: boolean | LogLevel

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
   * Configure to `cors`
   *
   * 配置 `cors`
   * @default true
   * @see [cors](https://github.com/expressjs/cors#configuration-options)
   */
  cors?: boolean | CorsOptions

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

  /**
   * Priority sorting for path matching rules is valid only for rules containing dynamic parameters.
   * In most cases, the default sorting rules can meet the needs.
   * However, in some cases where custom sorting rules are required, this option can be used.
   *
   * 路径匹配规则优先级排序，仅对包含动态参数的规则有效。
   * 大部分情况下默认的排序规则都可以满足需求。
   * 但有些情况下，需要自定义排序规则时，可以使用此选项。
   *
   * @example
   * ```ts
   * export default {
   *   priority: {
   *     global: ['/api/:a/b/c', '/api/a/:b/c', '/api/a/b/:c'],
   *     special: {
   *       '/api/:a/:b/c': {
   *         rules: ['/api/a/:b/:c', '/api/a/b/:c'],
   *         when: ['/api/a/b/c']
   *        }
   *     }
   *   }
   * }
   * ```
   */
  priority?: MockMatchPriority
}

export interface MockMatchPriority {
  /**
   * The priority of matching rules is global.
   * The rules declared in this option will take priority over the default rules.
   * The higher the position of the rule in the array, the higher the priority.
   *
   * Do not declare general rules in this option, such as /api/(.*),
   * as it will prevent subsequent rules from taking effect.
   * Unless you are clear about the priority of the rules,
   * most of the time you do not need to configure this option.
   *
   * 匹配规则优先级, 全局生效。
   * 声明在该选项中的规则将优先于默认规则生效。
   * 规则在数组越靠前的位置，优先级越高。
   *
   * 不要在此选项中声明通用性的规则，比如 `/api/(.*)`，这将导致后续的规则无法生效。
   * 除非你明确知道规则的优先级，否则大多数情况下都不需要配置该选项。
   * @default []
   */
  global?: string[]
  /**
   * For some special cases where the priority of certain rules needs to be adjusted,
   * this option can be used. For example, when a request matches both Rule A and Rule B,
   * and Rule A has a higher priority than Rule B, but it is desired for Rule B to take effect.
   *
   * 对于一些特殊情况，需要调整部分规则的优先级，可以使用此选项。
   * 比如一个请求同时命中了规则 A 和 B，且 A 比 B 优先级高， 但期望规则 B 生效时。
   */
  special?: MockMatchSpecialPriority
}

export interface MockMatchSpecialPriority {
  /**
   * When both A and B or C match, and B or C is at the top of the sort order,
   * insert A into the top position.The `when` option is used to further constrain
   * the priority adjustment to be effective only for certain requests.
   *
   * 当 A 与 B或 C 同时满足匹配，且 B或 C在排序首位时，将A插入到首位。
   * when 选项用于进一步约束该优先级调整仅针对哪些请求有效。
   *
   * @example
   * ```ts
   * {
   *   A: ['B', 'C'],
   *   A: { rules: ['B', 'C'], when: ['/api/a/b/c'] }
   * }
   * ```
   */
  [key: string]: string[] | { rules: string[], when: string[] }
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

export type ResponseBody =
  | Record<string, any>
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
  getCookie: (name: string, option?: Cookies.GetOption) => string | undefined
}

export type MockRequest = Connect.IncomingMessage & ExtraRequest

export type MockResponse = http.ServerResponse<http.IncomingMessage> & {
  /**
   * Set cookie in response
   *
   * 向请求响应中设置 cookie
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

interface MockBaseItem {
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
   * Enable WebSocket interface simulation
   *
   * 开启 websocket 接口模拟
   *
   * @default false
   */
  ws?: boolean
  /**
   * Whether to enable mock for this interface.
   * In most scenarios, we only need to mock some interfaces instead of all requests that
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
}

export interface MockHttpItem extends MockBaseItem {
  /**
   * The interface allows request methods, and by default allows both GET and POST.
   *
   * 该接口允许的 请求方法，默认同时支持 GET 和 POST
   * @default ['POST','GET']
   */
  method?: Method | Method[]
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
   * Configure response delay time,
   * If an array is passed in, it represents the range of delay time.
   * unit: `ms`
   *
   * 配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围
   * 单位： `ms`
   * @default 0
   */
  delay?: number | [number, number]

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
   * Response body data type, optional values include `text, json, buffer`.
   *
   * And also support types included in `mime-db`.
   * When the response body returns a file and you are not sure which type to use,
   * you can pass the file name as the value. The plugin will internally search for matching
   * `content-type` based on the file name suffix.
   *
   * However, if it is a TypeScript file such as `a.ts`, it may not be correctly matched
   * as a JavaScript script. You need to modify `a.ts` to `a.js` as the value passed
   * in order to recognize it correctly.
   *
   * 响应体数据类型, 可选值包括 `text, json, buffer`，
   *
   * 还支持`mime-db`中的包含的类型。
   * 当响应体返回的是一个文件，而你不确定应该使用哪个类型时，可以将文件名作为值传入，
   * 插件内部会根据文件名后缀查找匹配的`content-type`。
   *
   * 但如果是 `typescript`文件如 `a.ts`，可能不会被正确匹配为 `javascript`脚本，
   * 你需要将 `a.ts` 修改为 `a.js`作为值传入才能正确识别。
   * @see [mime-db](https://github.com/jshttp/mime-db)
   * @default 'json'
   * @example
   * ```txt
   * json
   * buffer
   * my-app.dmg
   * music.mp4
   * ```
   */
  type?: 'text' | 'json' | 'buffer' | string
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
  validator?:
    | Partial<Omit<ExtraRequest, 'getCookie'>>
    | ((request: ExtraRequest) => boolean)

  ws?: false
}

export interface MockWebsocketItem extends MockBaseItem {
  ws: true
  /**
   * Configure Websocket Server
   *
   * 配置 Websocket Server
   * @example
   * ```ts
   * export default {
   *   ws: true
   *   setup: (wss, { onCleanup }) => {
   *     wss.on('connection', (ws,req) => {
   *       ws.on('message', (raw) => console.log(raw))
   *       const timer = setInterval(
   *         () => ws.send(JSON.stringify({ type: 'connected' })),
   *         1000,
   *       )
   *       onCleanup(() => clearInterval(timer))
   *     })
   *     wss.on('error', (error) => console.error(error))
   *   }
   * }
   * ```
   */
  setup: (wss: WebSocketServer, context: WebSocketSetupContext) => void
}

export interface WebSocketSetupContext {
  /**
   * When defining WSS, you may perform some automatic or looping tasks.
   * However, when hot updating, the plugin will re-execute `setup()`,
   * which may result in duplicate registration of listening events and looping tasks
   * such as setTimeout. You can use `onCleanup()` to clear these automatic or looping tasks.
   *
   * 当你在定义 WSS 时，可能会执行一些自动任务或循环任务，
   * 但是当热更新时，插件内部会重新执行 setup() ，
   * 这可能导致出现 重复注册监听事件 和 循环任务如 `setTimeout` 等。
   * 通过 `onCleanup()` 可以来清除这些自动任务或循环任务。
   * @example
   * ``` ts
   * onCleanup(() => clearTimeout(timeId))
   * ```
   */
  onCleanup: (cleanup: () => void) => void
}

export type MockOptions = (MockHttpItem | MockWebsocketItem)[]

export type FormidableFile = formidable.File | formidable.File[]

export type LogType = 'info' | 'warn' | 'error' | 'debug'

export type LogLevel = LogType | 'silent'
