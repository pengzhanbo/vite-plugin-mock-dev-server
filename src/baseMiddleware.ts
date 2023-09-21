import { Buffer } from 'node:buffer'
import {
  isArray,
  isEmptyObject,
  isFunction,
  random,
  sleep,
  timestamp,
} from '@pengzhanbo/utils'
import Cookies from 'cookies'
import HTTP_STATUS from 'http-status'
import * as mime from 'mime-types'
import { pathToRegexp } from 'path-to-regexp'
import colors from 'picocolors'
import type { Connect } from 'vite'
import type { Logger } from './logger'
import { matchingWeight } from './matchingWeight'
import type { MockLoader } from './MockLoader'
import { parseReqBody } from './parseReqBody'
import { collectRequest } from './requestRecovery'
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
  doesProxyContextMatchUrl,
  isReadableStream,
  parseParams,
  urlParse,
} from './utils'
import { validate } from './validator'

export interface BaseMiddlewareOptions {
  formidableOptions: MockServerPluginOptions['formidableOptions']
  cookiesOptions: MockServerPluginOptions['cookiesOptions']
  proxies: string[]
  logger: Logger
  priority: MockServerPluginOptions['priority']
}

export function baseMiddleware(
  mockLoader: MockLoader,
  {
    formidableOptions = {},
    proxies,
    cookiesOptions,
    logger,
    priority = {},
  }: BaseMiddlewareOptions,
): Connect.NextHandleFunction {
  return async function (req, res, next) {
    const startTime = timestamp()
    const { query, pathname } = urlParse(req.url!)

    if (
      !pathname ||
      proxies.length === 0 ||
      !proxies.some((context) => doesProxyContextMatchUrl(context, req.url!))
    ) {
      return next()
    }

    const mockData = mockLoader.mockData
    const mockUrls = matchingWeight(Object.keys(mockData), pathname, priority)

    if (mockUrls.length === 0) return next()

    // #52 由于请求流被消费，vite http-proxy 无法获取已消费的请求，导致请求流无法继续
    // 记录请求流中被消费的数据，形成备份，当当前请求无法继续时，可以从备份中恢复请求流
    collectRequest(req)

    const { query: refererQuery } = urlParse(req.headers.referer || '')
    const reqBody = await parseReqBody(req, formidableOptions)
    const cookies = new Cookies(req, res, cookiesOptions)
    const getCookie = cookies.get.bind(cookies)

    const method = req.method!.toUpperCase()
    let mock: MockHttpItem | undefined
    let _mockUrl: string | undefined
    for (const mockUrl of mockUrls) {
      mock = fineMock(mockData[mockUrl], logger, {
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
      if (mock) {
        _mockUrl = mockUrl
        break
      }
    }

    if (!mock) {
      const matched = mockUrls
        .map((m) =>
          m === _mockUrl ? colors.underline(colors.bold(m)) : colors.dim(m),
        )
        .join(', ')
      logger.warn(
        `${colors.green(
          pathname,
        )} matches  ${matched} , but mock data is not found.`,
      )

      return next()
    }

    const request = req as MockRequest
    const response = res as MockResponse

    // provide request
    request.body = reqBody
    request.query = query
    request.refererQuery = refererQuery
    request.params = parseParams(mock.url, pathname)
    request.getCookie = getCookie

    // provide response
    response.setCookie = cookies.set.bind(cookies)

    const {
      body,
      delay,
      type = 'json',
      response: responseFn,
      status = 200,
      statusText,
      log: logLevel,
      __filepath__: filepath,
    } = mock as MockHttpItem & { __filepath__: string }

    // provide headers
    responseStatus(response, status, statusText)
    await provideHeaders(request, response, mock, logger)
    await provideCookies(request, response, mock, logger)

    logger.info(requestLog(request, filepath), logLevel)
    logger.debug(
      `${colors.magenta('DEBUG')} ${colors.underline(
        pathname,
      )}  matches: [ ${mockUrls
        .map((m) =>
          m === _mockUrl ? colors.underline(colors.bold(m)) : colors.dim(m),
        )
        .join(', ')} ]\n`,
    )

    if (body) {
      try {
        const content = isFunction(body) ? await body(request) : body
        await realDelay(startTime, delay)
        sendData(response, content, type)
      } catch (e) {
        logger.error(
          `${colors.red(
            `mock error at ${pathname}`,
          )}\n${e}\n  at body (${colors.underline(filepath)})`,
          logLevel,
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
        logger.error(
          `${colors.red(
            `mock error at ${pathname}`,
          )}\n${e}\n  at response (${colors.underline(filepath)})`,
          logLevel,
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
  logger: Logger,
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
          const file = (mock as any).__filepath__
          logger.error(
            `${colors.red(
              `mock error at ${pathname}`,
            )}\n${e}\n  at validator (${colors.underline(file)})`,
            mock.log,
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
  logger: Logger,
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
    logger.error(
      `${colors.red(
        `mock error at ${req.url!.split('?')[0]}`,
      )}\n${e}\n  at headers (${colors.underline(filepath)})`,
      mock.log,
    )
  }
}

async function provideCookies(
  req: MockRequest,
  res: MockResponse,
  mock: MockHttpItem,
  logger: Logger,
) {
  const { cookies } = mock
  const filepath = (mock as any).__filepath__ as string
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
    logger.error(
      `${colors.red(
        `mock error at ${req.url!.split('?')[0]}`,
      )}\n${e}\n  at cookies (${colors.underline(filepath)})`,
      mock.log,
    )
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

async function realDelay(startTime: number, delay?: MockHttpItem['delay']) {
  if (
    !delay ||
    (typeof delay === 'number' && delay <= 0) ||
    (isArray(delay) && delay.length !== 2)
  )
    return
  let realDelay = 0
  if (isArray(delay)) {
    const [min, max] = delay
    realDelay = random(min, max)
  } else {
    realDelay = delay - (timestamp() - startTime)
  }
  if (realDelay > 0) await sleep(realDelay)
}

function getHTTPStatusText(status: number): string {
  return HTTP_STATUS[status] || 'Unknown'
}

function requestLog(request: MockRequest, filepath: string): string {
  const { url, method, query, params, body } = request
  let { pathname } = new URL(url!, 'http://example.com')
  pathname = colors.green(decodeURIComponent(pathname))
  const format = (prefix: string, data: any) => {
    return !data || isEmptyObject(data)
      ? ''
      : `  ${colors.gray(`${prefix}:`)}${JSON.stringify(data)}`
  }
  const ms = colors.magenta(colors.bold(method))
  const qs = format('query', query)
  const ps = format('params', params)
  const bs = format('body', body)
  const file = `  ${colors.dim(colors.underline(`(${filepath})`))}`
  return `${ms} ${pathname}${qs}${ps}${bs}${file}`
}
