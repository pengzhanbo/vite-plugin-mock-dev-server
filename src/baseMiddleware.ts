import { parse as urlParse } from 'node:url'
import Cookies from 'cookies'
import HTTP_STATUS from 'http-status'
import { pathToRegexp } from 'path-to-regexp'
import colors from 'picocolors'
import type { Connect } from 'vite'
import type { MockLoader } from './MockLoader'
import { parseReqBody } from './parseReqBody'
import type {
  ExtraRequest,
  Method,
  MockOptions,
  MockOptionsItem,
  MockRequest,
  MockResponse,
  MockServerPluginOptions,
} from './types'
import { debug, isArray, isFunction, log, parseParams, sleep } from './utils'
import { validate } from './validator'

export interface BaseMiddlewareOptions {
  formidableOptions: MockServerPluginOptions['formidableOptions']
  cookiesOptions: MockServerPluginOptions['cookiesOptions']
  proxies: string[]
}

export function baseMiddleware(
  mockLoader: MockLoader,
  { formidableOptions = {}, proxies, cookiesOptions }: BaseMiddlewareOptions,
): Connect.NextHandleFunction {
  return async function (req, res, next) {
    const startTime = Date.now()
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
    if (!mockUrl) return next()

    const reqBody = await parseReqBody(req, formidableOptions)

    const method = req.method!.toUpperCase()
    const mock = fineMock(mockData[mockUrl], pathname, method, {
      query,
      refererQuery,
      body: reqBody,
      headers: req.headers,
    })

    if (!mock) return next()
    debug('middleware: ', method, pathname)

    const cookies = new Cookies(req, res, cookiesOptions)
    const request = req as MockRequest
    const response = res as MockResponse

    /**
     * provide request
     */
    request.body = reqBody
    request.query = query
    request.refererQuery = refererQuery
    request.params = parseParams(mock.url, pathname)
    request.getCookie = cookies.get.bind(cookies)

    /**
     * provide response
     */
    response.setCookie = cookies.set.bind(cookies)

    responseStatus(response, mock.status, mock.statusText)
    await provideHeaders(request, response, mock.headers)
    await provideCookies(request, response, mock.cookies)

    const { body, delay, response: responseFn } = mock

    if (body) {
      try {
        const result = isFunction(body) ? await body(request) : mock.body
        await realDelay(startTime, delay)
        res.end(JSON.stringify(result))
      } catch (e) {
        log.error(`${colors.red('[body error]')} ${req.url} \n`, e)
        responseStatus(response, 500)
        res.end('')
      }
      return
    }

    if (responseFn) {
      try {
        await realDelay(startTime, delay)
        await responseFn(request, response, next)
      } catch (e) {
        log.error(`${colors.red('[response error]')} ${req.url} \n`, e)
        responseStatus(response, 500)
        res.end('')
      }
      return
    }

    res.end('')
  }
}

function fineMock(
  mockList: MockOptions,
  pathname: string,
  method: string,
  request: Omit<ExtraRequest, 'params'>,
): MockOptionsItem | undefined {
  return mockList.find((mock) => {
    if (!pathname || !mock || !mock.url) return false
    const methods: Method[] = mock.method
      ? isArray(mock.method)
        ? mock.method
        : [mock.method]
      : ['GET', 'POST']
    // 判断发起的请求方法是否符合当前 mock 允许的方法
    if (!methods.includes(method as Method)) return false

    const hasMock = pathToRegexp(mock.url).test(pathname)

    if (hasMock && mock.validator) {
      const params = parseParams(mock.url, pathname)
      const extraRequest: ExtraRequest = { params, ...request }
      if (isFunction(mock.validator)) {
        return mock.validator(extraRequest)
      } else {
        return validate(extraRequest, mock.validator)
      }
    }
    return hasMock
  })
}

function responseStatus(
  response: MockResponse,
  status = 200,
  statusText?: string,
) {
  response.statusCode = status
  response.statusMessage = statusText || getHTTPStatusText(status)
}

async function provideHeaders(
  req: MockRequest,
  res: MockResponse,
  headersOption: MockOptionsItem['headers'],
) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-cache,max-age=0')
  res.setHeader('X-Mock', 'generate by vite:plugin-mock-dev-server')
  if (!headersOption) return
  try {
    const headers = isFunction(headersOption)
      ? await headersOption(req)
      : headersOption
    Object.keys(headers).forEach((key) => {
      res.setHeader(key, headers[key]!)
    })
  } catch (e) {
    log.error(`${colors.red('[headers error]')} ${req.url} \n`, e)
  }
}

async function provideCookies(
  req: MockRequest,
  res: MockResponse,
  cookiesOption: MockOptionsItem['cookies'],
) {
  if (!cookiesOption) return
  try {
    const cookies = isFunction(cookiesOption)
      ? await cookiesOption(req)
      : cookiesOption
    Object.keys(cookies).forEach((key) => {
      const optional = cookies[key]
      if (isArray(optional)) {
        const [value, options] = optional
        res.setCookie(key, value, options)
      } else {
        res.setCookie(key, optional)
      }
    })
  } catch (e) {
    log.error(`${colors.red('[cookies error]')} ${req.url} \n`, e)
  }
}

async function realDelay(startTime: number, delay?: number) {
  if (!delay || delay <= 0) return
  const diff = Date.now() - startTime
  const realDelay = delay - diff
  if (realDelay > 0) await sleep(realDelay)
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
