import { Buffer } from 'node:buffer'
import { parse as urlParse } from 'node:url'
import Cookies from 'cookies'
import HTTP_STATUS from 'http-status'
import * as mime from 'mime-types'
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
  ResponseBody,
} from './types'
import {
  debug,
  isArray,
  isFunction,
  isReadableStream,
  log,
  parseParams,
  sleep,
} from './utils'
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

    const { query: refererQuery } = urlParse(req.headers.referer || '', true)
    const reqBody = await parseReqBody(req, formidableOptions)
    const cookies = new Cookies(req, res, cookiesOptions)
    const getCookie = cookies.get.bind(cookies)

    const method = req.method!.toUpperCase()
    const mock = fineMock(mockData[mockUrl], {
      pathname,
      method,
      request: {
        query,
        refererQuery,
        body: reqBody,
        headers: req.headers,
        getCookie,
      },
    })

    if (!mock) return next()
    debug('middleware: ', method, pathname)

    const request = req as MockRequest
    const response = res as MockResponse

    /**
     * provide request
     */
    request.body = reqBody
    request.query = query
    request.refererQuery = refererQuery
    request.params = parseParams(mock.url, pathname)
    request.getCookie = getCookie

    /**
     * provide response
     */
    response.setCookie = cookies.set.bind(cookies)

    const {
      body,
      delay,
      type = 'json',
      response: responseFn,
      status = 200,
      statusText,
    } = mock

    responseStatus(response, status, statusText)
    await provideHeaders(request, response, mock)
    await provideCookies(request, response, mock)

    if (body) {
      try {
        const content = isFunction(body) ? await body(request) : body
        await realDelay(startTime, delay)
        sendData(response, content, type)
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
  {
    pathname,
    method,
    request,
  }: {
    pathname: string
    method: string
    request: Omit<ExtraRequest, 'params'>
  },
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
      if (isFunction(mock.validator)) {
        return mock.validator({ params, ...request })
      } else {
        return validate({ params, ...request }, mock.validator)
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
  { headers, type = 'json' }: MockOptionsItem,
) {
  const contentType =
    mime.contentType(type) || mime.contentType(mime.lookup(type) || '')
  contentType && res.setHeader('Content-Type', contentType)

  res.setHeader('Cache-Control', 'no-cache,max-age=0')
  res.setHeader('X-Mock', 'generate by vite:plugin-mock-dev-server')
  if (!headers) return
  try {
    const raw = isFunction(headers) ? await headers(req) : headers
    Object.keys(raw).forEach((key) => {
      res.setHeader(key, raw[key]!)
    })
  } catch (e) {
    log.error(`${colors.red('[headers error]')} ${req.url} \n`, e)
  }
}

async function provideCookies(
  req: MockRequest,
  res: MockResponse,
  { cookies }: MockOptionsItem,
) {
  if (!cookies) return
  try {
    const raw = isFunction(cookies) ? await cookies(req) : cookies
    Object.keys(raw).forEach((key) => {
      const cookie = raw[key]
      if (isArray(cookie)) {
        const [value, options] = cookie
        res.setCookie(key, value, options)
      } else {
        res.setCookie(key, cookie)
      }
    })
  } catch (e) {
    log.error(`${colors.red('[cookies error]')} ${req.url} \n`, e)
  }
}

function sendData(res: MockResponse, raw: ResponseBody, type: string) {
  if (isReadableStream(raw)) {
    raw.pipe(res)
  } else if (Buffer.isBuffer(raw)) {
    res.end(type === 'text' || type === 'json' ? raw.toString('utf-8') : raw)
  } else {
    const content = typeof raw === 'string' ? raw : JSON.stringify(raw)
    res.end(type === 'buffer' ? Buffer.from(content) : content)
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
