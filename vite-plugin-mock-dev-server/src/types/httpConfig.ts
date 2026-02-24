import type { Connect } from 'vite'
import type {
  MockBaseItem,
  ResponseBodyFn,
  ResponseCookies,
  ResponseCookiesFn,
  ResponseHeaderFn,
} from './basicConfig'
import type {
  ExtraRequest,
  Headers,
  Method,
  MockRequest,
  MockResponse,
  ResponseBody,
} from './http'

export interface MockErrorConfig {
  /**
   * Error probability (0-1), default is 0.5
   *
   * 错误概率（0-1），默认 0.5
   * @default 0.5
   */
  probability?: number
  /**
   * Error status code, default is 500
   *
   * 错误状态码，默认 500
   * @default 500
   */
  status?: number
  /**
   * Error status text
   *
   * 错误状态文本
   */
  statusText?: string
  /**
   * Custom error response body, suitable for when the status is 200, but the response body needs to simulate an error scenario
   *
   * 自定义错误响应体，适用于 status 为 200，但响应体需要模拟错误场景
   * @example
   * { code: 500, msg: 'Internal Server Error', result: null }
   */
  body?: ResponseBody | ResponseBodyFn
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

  /**
   * Configure error simulation
   *
   * 配置错误模拟
   * @example
   * ```ts
   * export default {
   *   error: {
   *     probability: 0.5,
   *     status: 500,
   *     message: 'Internal Server Error'
   *   }
   * }
   * ```
   */
  error?: MockErrorConfig

  ws?: false
}
