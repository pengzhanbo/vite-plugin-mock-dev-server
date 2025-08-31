import type { MatchFunction } from 'path-to-regexp'
import type { Connect } from 'vite'
import type { BodyParserOptions, ExtraRequest, MockRequest } from '../types'
import { isEmptyObject } from '@pengzhanbo/utils'
import ansis from 'ansis'
import bodyParser from 'co-body'
import formidable from 'formidable'
import { match } from 'path-to-regexp'
import { isObjectSubset } from '../utils'

/**
 * 解析请求体 request.body
 */
export async function parseRequestBody(
  req: Connect.IncomingMessage,
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
    console.error(e)
  }
  return undefined
}

const DEFAULT_FORMIDABLE_OPTIONS: formidable.Options = {
  keepExtensions: true,
  filename(name, ext, part) {
    return part?.originalFilename || `${name}.${Date.now()}${ext ? `.${ext}` : ''}`
  },
}

/**
 * 解析 request form multipart body
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

const matcherCache: Map<string, MatchFunction<Partial<Record<string, string | string[]>>>> = new Map()

/**
 * 解析请求 url 中的动态参数 params
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
 * 验证请求是否符合 validator
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

function formatLog(prefix: string, data: any) {
  return !data || isEmptyObject(data)
    ? ''
    : `  ${ansis.gray(`${prefix}:`)}${JSON.stringify(data)}`
}

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
