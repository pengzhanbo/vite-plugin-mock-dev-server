import { parse as urlParse } from 'node:url'
import HTTP_STATUS from 'http-status'
import { match, pathToRegexp } from 'path-to-regexp'
import colors from 'picocolors'
import type { Connect } from 'vite'
import type { MockLoader } from './MockLoader'
import { parseReqBody } from './parseReqBody'
import type {
  ExtraRequest,
  Method,
  MockRequest,
  MockServerPluginOptions,
} from './types'
import { debug, isArray, isFunction, log, sleep } from './utils'
import { validate } from './validator'

export interface BaseMiddlewareOptions {
  formidableOptions: MockServerPluginOptions['formidableOptions']
  proxies: string[]
}

export function baseMiddleware(
  mockLoader: MockLoader,
  { formidableOptions = {}, proxies }: BaseMiddlewareOptions,
): Connect.NextHandleFunction {
  return async function (req, res, next) {
    const method = req.method!.toUpperCase()
    const { query, pathname } = urlParse(req.url!, true)
    const { query: refererQuery } = urlParse(req.headers.referer || '', true)

    if (
      !pathname ||
      proxies.length === 0 ||
      !proxies.some((context) => doesProxyContextMatchUrl(context, req.url!))
    ) {
      return next()
    }

    const mockData = mockLoader.mockData
    const mockUrl = Object.keys(mockData).find((key) => {
      return pathToRegexp(key).test(pathname)
    })
    if (!mockUrl) {
      return next()
    }
    const mockList = mockData[mockUrl]

    const reqBody = await parseReqBody(req, formidableOptions)

    const currentMock = mockList.find((mock) => {
      if (!pathname || !mock || !mock.url) return false
      const methods: Method[] = mock.method
        ? isArray(mock.method)
          ? mock.method
          : [mock.method]
        : ['GET', 'POST']
      // 判断发起的请求方法是否符合当前 mock 允许的方法
      if (!methods.includes(req.method!.toUpperCase() as Method)) return false

      const hasMock = pathToRegexp(mock.url).test(pathname)

      if (hasMock && mock.validator) {
        const urlMatch = match(mock.url, { decode: decodeURIComponent })(
          pathname,
        ) || { params: {} }
        const params = urlMatch.params || {}
        const request: ExtraRequest = {
          query,
          refererQuery,
          params,
          body: reqBody,
          headers: req.headers,
        }
        if (isFunction(mock.validator)) {
          return mock.validator(request)
        } else {
          return validate(request, mock.validator)
        }
      }
      return hasMock
    })

    if (!currentMock) return next()

    debug('middleware: ', method, pathname)

    /**
     * response delay
     */
    if (currentMock.delay && currentMock.delay > 0) {
      await sleep(currentMock.delay)
    }

    res.statusCode = currentMock.status || 200
    res.statusMessage =
      currentMock.statusText || getHTTPStatusText(res.statusCode)

    const urlMatch = match(currentMock.url, { decode: decodeURIComponent })(
      pathname!,
    ) || { params: {} }
    const params = urlMatch.params || {}

    const request = req as MockRequest

    /**
     * provide mock data
     */
    request.body = reqBody
    request.query = query
    request.refererQuery = refererQuery
    request.params = params

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-cache,max-age=0')
    res.setHeader('X-Mock', 'generate by vite:plugin-mock-dev-server')

    if (currentMock.headers) {
      try {
        const headers = isFunction(currentMock.headers)
          ? await currentMock.headers(request)
          : currentMock.headers
        Object.keys(headers).forEach((key) => {
          res.setHeader(key, headers[key]!)
        })
      } catch (e) {
        log.error(`${colors.red('[headers error]')} ${req.url} \n`, e)
      }
    }

    if (currentMock.body) {
      try {
        let body: any
        if (isFunction(currentMock.body)) {
          body = await currentMock.body(request)
        } else {
          body = currentMock.body
        }
        res.end(JSON.stringify(body))
      } catch (e) {
        log.error(`${colors.red('[body error]')} ${req.url} \n`, e)
        res.statusCode = 500
        res.statusMessage = getHTTPStatusText(res.statusCode)
        res.end('')
      }
      return
    }

    if (currentMock.response) {
      try {
        await currentMock.response(request, res, next)
      } catch (e) {
        log.error(`${colors.red('[response error]')} ${req.url} \n`, e)
        res.statusCode = 500
        res.statusMessage = getHTTPStatusText(res.statusCode)
        res.end('')
      }
      return
    }

    res.end('')
  }
}

function doesProxyContextMatchUrl(context: string, url: string): boolean {
  return (
    (context.startsWith('^') && new RegExp(context).test(url)) ||
    url.startsWith(context)
  )
}

function getHTTPStatusText(status: number): string {
  return HTTP_STATUS[status] || 'Unknown'
}
