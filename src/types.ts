import type http from 'node:http'
import type formidable from 'formidable'
import type { Connect } from 'vite'

export interface MockServerPluginOptions {
  /**
   * 为 mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
   * 如果 prefix 以 `^` 开头，将被识别为 `RegExp`。
   *
   * @default []
   */
  prefix?: string | string[]
  /**
   * glob 字符串匹配 mock 包含的文件
   * @see https://github.com/micromatch/picomatch#globbing-features
   * @default []
   */
  include?: string | string[]
  /**
   * glob 字符串匹配 mock 过滤的文件
   * @see https://github.com/micromatch/picomatch#globbing-features
   */
  exclude?: string | string[]

  /**
   * formidable options
   * @see https://github.com/node-formidable/formidable#options
   */
  formidableOptions?: formidable.Options

  /**
   * 当需要构建一个小型mock服务时，可配置此项
   *
   * @default false
   */
  build?: boolean | ServerBuildOption
}

export interface ServerBuildOption {
  /**
   * 服务启动端口
   *
   * @default 8080
   */
  serverPort?: number
  /**
   * 服务应用输出目录
   *
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

type ResponseBody = Record<string, any> | any[] | string | number | null

export interface ResponseReq {
  /**
   * 请求地址中位于 `?` 后面的 queryString，已解析为 json
   */
  query: Record<string, any>
  /**
   * 请求体中 body 数据
   */
  body: Record<string, any>
  /**
   * 请求地址中，/api/id/:id 解析后的 params 参数
   */
  params: Record<string, any>

  /**
   * 请求 中的 headers
   */
  headers: Record<string, any>
}

interface ResponseBodyFn {
  (request: ResponseReq): ResponseBody | Promise<ResponseBody>
}

interface ResponseHeaderFn {
  (request: ResponseReq): Headers | Promise<Headers>
}

type Headers = Record<string, any>

export interface MockOptionsItem {
  /**
   * 需要做mock的接口地址，
   * exp: `/api/login`, `/api/login/:id`
   */
  url: string
  /**
   * 该接口支持的 请求方法，默认同时支持 GET 和 POST
   *
   * @default ['POST','GET']
   */
  method?: Method | Method[]
  /**
   * 是否启动对该接口的mock，在多数场景下，我们进需要对部分接口进行 mock，
   * 而不是对所有配置了mock的请求进行全量mock，所以是否能够配置是否启用很重要
   *
   * @default true
   */
  enabled?: boolean
  /**
   * 配置响应体 header
   *
   * @default {'Content-Type':'application/json'}
   */
  headers?: Headers | ResponseHeaderFn
  /**
   * 配置 响应头状态码
   *
   * @default 200
   */
  status?: number
  /**
   * 配置响应头状态文本
   *
   * @default 'OK'
   */
  statusText?: string
  /**
   * 配置响应延迟时间, 单位： `ms`
   *
   * @default 0
   */
  delay?: number
  /**
   * 配置响应体数据内容
   *
   * @default {}
   */
  body?: ResponseBody | ResponseBodyFn
  /**
   * 如果需要设置复杂的响应内容，可以使用 response 方法，
   * 该方法是一个 middleware，你可以在这里拿到 http 请求的 req、res等信息，
   * 然后通过 res.write() | res.end() 返回响应数据， 否则执行 next() 方法。
   *
   * 在 req 中，还可以拿到 query、params、body等已解析的请求信息
   */
  response?: (
    req: Connect.IncomingMessage & ResponseReq,
    res: http.ServerResponse<http.IncomingMessage>,
    next: Connect.NextFunction,
  ) => void | Promise<void>

  /**
   * 请求验证器
   *
   * 有时候，一个相同的API请求，需要根据不同的请求参数，来决定返回数据，
   * 但全部都在单个 mock中的 body或者 response 中写，内容会很庞杂，不好管理，
   * 验证器的功能，允许你同时配置多条相同url的mock，通过验证器来判断使哪个mock生效。
   */
  validator?: Partial<ResponseReq> | ((request: ResponseReq) => boolean)
}

export type MockOptions = MockOptionsItem[]

export type FormidableFile = formidable.File | formidable.File[]
