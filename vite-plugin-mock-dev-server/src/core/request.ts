import type { MatchFunction } from 'path-to-regexp'
import type { Connect } from 'vite'
import type { BodyParserOptions, ExtraRequest, MockRequest } from '../types'
import type { Logger } from '../utils'
import { isEmptyObject } from '@pengzhanbo/utils'
import ansis from 'ansis'
import bodyParser from 'co-body'
import formidable from 'formidable'
import { match } from 'path-to-regexp'
import { isObjectSubset } from '../utils'

/**
 * Parse request body
 *
 * 解析请求体 request.body
 *
 * @param req - Incoming message object / 入站消息对象
 * @param logger - Logger instance / 日志实例
 * @param formidableOptions - Formidable options for multipart form data / 用于 multipart 表单数据的 Formidable 配置项
 * @param bodyParserOptions - Body parser options / 请求体解析配置项
 * @returns Parsed request body / 解析后的请求体
 */
export async function parseRequestBody(
  req: Connect.IncomingMessage,
  logger: Logger,
  formidableOptions: formidable.Options,
  bodyParserOptions: BodyParserOptions = {},
): Promise<any> {
  const method = req.method!.toUpperCase()
  if (['HEAD', 'OPTIONS'].includes(method))
    return undefined
  const type = req.headers['content-type']?.toLocaleLowerCase() || ''
  const { limit, formLimit, jsonLimit, textLimit, ...rest } = bodyParserOptions
  try {
    if (type.startsWith('application/json')) {
      return await bodyParser.json(req, {
        limit: jsonLimit || limit,
        ...rest,
      })
    }

    if (type.startsWith('application/x-www-form-urlencoded')) {
      return await bodyParser.form(req, {
        limit: formLimit || limit,
        ...rest,
      })
    }

    if (type.startsWith('text/plain')) {
      return await bodyParser.text(req, {
        limit: textLimit || limit,
        ...rest,
      })
    }

    if (type.startsWith('multipart/form-data'))
      return await parseRequestBodyWithMultipart(req, formidableOptions)
  }
  catch (e) {
    logger.error(e)
  }
  return undefined
}

/**
 * Default formidable options
 *
 * 默认的 formidable 配置项
 */
const DEFAULT_FORMIDABLE_OPTIONS: formidable.Options = {
  keepExtensions: true,
  filename(name, ext, part) {
    return part?.originalFilename || `${name}.${Date.now()}${ext ? `.${ext}` : ''}`
  },
}

/**
 * Parse request body with multipart form data
 *
 * 解析 request form multipart body
 *
 * @param req - Incoming message object / 入站消息对象
 * @param options - Formidable options / Formidable 配置项
 * @returns Parsed request body / 解析后的请求体
 */
async function parseRequestBodyWithMultipart(
  req: Connect.IncomingMessage,
  options: formidable.Options,
): Promise<any> {
  const form = formidable({ ...DEFAULT_FORMIDABLE_OPTIONS, ...options })

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ ...fields, ...files })
    })
  })
}

/**
 * Cache for path-to-regexp match functions
 *
 * path-to-regexp 匹配函数缓存
 */
const matcherCache: Map<string, MatchFunction<Partial<Record<string, string | string[]>>>> = new Map()

/**
 * Parse request URL dynamic parameters
 *
 * 解析请求 url 中的动态参数 params
 *
 * @param pattern - URL pattern / URL 模式
 * @param url - Request URL / 请求 URL
 * @returns Parsed parameters / 解析后的参数
 */
export function parseRequestParams(
  pattern: string,
  url: string,
): Partial<Record<string, string | string[]>> {
  let matcher = matcherCache.get(pattern)
  if (!matcher) {
    matcher = match(pattern, { decode: decodeURIComponent })
    matcherCache.set(pattern, matcher)
  }
  const matched = matcher(url)
  return matched ? matched.params : {}
}

/**
 * Validate request against validator
 *
 * 验证请求是否符合 validator
 *
 * @param request - Request object / 请求对象
 * @param validator - Validator object / 验证器对象
 * @returns Whether the request is valid / 请求是否有效
 */
export function requestValidate(
  request: ExtraRequest,
  validator: Partial<ExtraRequest>,
): boolean {
  return (
    isObjectSubset(request.headers, validator.headers)
    && isObjectSubset(request.body, validator.body)
    && isObjectSubset(request.params, validator.params)
    && isObjectSubset(request.query, validator.query)
    && isObjectSubset(request.refererQuery, validator.refererQuery)
  )
}

/**
 * Format log data
 *
 * 格式化日志数据
 *
 * @param prefix - Log prefix / 日志前缀
 * @param data - Data to format / 要格式化的数据
 * @returns Formatted log string / 格式化后的日志字符串
 */
function formatLog(prefix: string, data: any) {
  return !data || isEmptyObject(data)
    ? ''
    : `  ${ansis.gray(`${prefix}:`)}${JSON.stringify(data)}`
}

/**
 * Generate request log
 *
 * 生成请求日志
 *
 * @param request - Request object / 请求对象
 * @param filepath - Mock file path / Mock 文件路径
 * @returns Formatted log string / 格式化后的日志字符串
 */
export function requestLog(request: MockRequest, filepath: string): string {
  const { url, method, query, params, body } = request
  let { pathname } = new URL(url!, 'http://example.com')
  pathname = ansis.green(decodeURIComponent(pathname))
  const ms = ansis.magenta.bold(method)
  const qs = formatLog('query', query)
  const ps = formatLog('params', params)
  const bs = formatLog('body', body)
  const file = `  ${ansis.dim.underline(`(${filepath})`)}`
  return `${ms} ${pathname}${qs}${ps}${bs}${file}`
}
