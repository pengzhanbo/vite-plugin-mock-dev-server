import { Buffer } from 'node:buffer'
import { parse as urlParse } from 'node:url'
import Cookies from 'cookies'
import HTTP_STATUS from 'http-status'
import sortBy from 'lodash.sortby'
import * as mime from 'mime-types'
import { pathToRegexp } from 'path-to-regexp'
import colors from 'picocolors'
import type { Connect } from 'vite'
import type { MockLoader } from './MockLoader'
import { parseReqBody } from './parseReqBody'
import type {
  ExtraRequest,
  Method,
  MockHttpItem,
  MockOptions,
  MockRequest,
  MockResponse,
  MockServerPluginOptions,
  ResponseBody,
} from './types'
import {
  debug,
  doesProxyContextMatchUrl,
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

const RE_DYNAMIC_URL = /:/g

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

    // 非动态匹配优先前置匹配，动态匹配以参数个数少的优先匹配
    const mockUrl = sortBy(
      Object.keys(mockData),
      (url) => url.match(RE_DYNAMIC_URL)?.length || 0,
    ).find((key) => pathToRegexp(key).test(pathname))

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
    debug('middleware: ', method, req.url)

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
        log.error(
          `${colors.red('[body error]')} ${req.url} \n`,
          `file: ${colors.cyan((mock as any).__filepath__)}`,
          e,
        )
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
        log.error(
          `${colors.red('[response error]')} ${req.url} \n`,
          `file: ${colors.cyan((mock as any).__filepath__)}`,
          e,
        )
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
): MockHttpItem | undefined {
  return mockList.find((mock) => {
    if (!pathname || !mock || !mock.url || mock.ws === true) return false
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
        try {
          return validate({ params, ...request }, mock.validator)
        } catch (e) {
          log.error(
            `${colors.red('[validator error]')} ${pathname} \n`,
            `file: ${colors.cyan((mock as any).__filepath__)}`,
            e,
          )
          return false
        }
      }
    }
    return hasMock
  }) as MockHttpItem | undefined
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
  mock: MockHttpItem,
) {
  const { headers, type = 'json' } = mock
  const filepath = (mock as any).__filepath__ as string
  const contentType =
    mime.contentType(type) || mime.contentType(mime.lookup(type) || '')
  contentType && res.setHeader('Content-Type', contentType)

  res.setHeader('Cache-Control', 'no-cache,max-age=0')
  res.setHeader('X-Mock-Power-By', 'vite-plugin-mock-dev-server')
  res.setHeader('X-File-Path', filepath)

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
  { cookies }: MockHttpItem,
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

function getHTTPStatusText(status: number): string {
  return HTTP_STATUS[status] || 'Unknown'
}
