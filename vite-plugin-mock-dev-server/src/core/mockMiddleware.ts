import type { Connect } from 'vite'
import type { Compiler } from '../compiler'
import type {
  MockHttpItem,
  MockRequest,
  MockResponse,
  MockServerPluginOptions,
} from '../types'
import type { Logger } from '../utils'
import { isFunction, timestamp } from '@pengzhanbo/utils'
import ansis from 'ansis'
import Cookies from 'cookies'
import { doesProxyContextMatchUrl, urlParse } from '../utils'
import { fineMockData } from './findMockData'
import { matchingWeight } from './matchingWeight'
import {
  parseRequestBody,
  parseRequestParams,
  requestLog,
} from './request'
import { collectRequest } from './requestRecovery'
import {
  provideResponseCookies,
  provideResponseHeaders,
  provideResponseStatus,
  responseRealDelay,
  sendResponseData,
} from './response'

export interface CreateMockMiddlewareOptions extends Pick<MockServerPluginOptions, 'formidableOptions' | 'cookiesOptions' | 'bodyParserOptions' | 'priority'> {
  proxies: string[]
  logger: Logger
}

export function createMockMiddleware(
  compiler: Compiler,
  {
    formidableOptions = {},
    bodyParserOptions = {},
    proxies,
    cookiesOptions,
    logger,
    priority = {},
  }: CreateMockMiddlewareOptions,
): Connect.NextHandleFunction {
  return async function mockMiddleware(req, res, next) {
    const startTime = timestamp()
    const { query, pathname } = urlParse(req.url!)

    // 预先过滤不符合路径前缀的请求
    if (
      !pathname
      || proxies.length === 0
      || !proxies.some(context => doesProxyContextMatchUrl(context, req.url!))
    ) {
      return next()
    }

    const mockData = compiler.mockData
    // 对满足匹配规则的配置进行优先级排序
    const mockUrls = matchingWeight(Object.keys(mockData), pathname, priority)

    if (mockUrls.length === 0) {
      return next()
    }

    // #52 由于请求流被消费，vite http-proxy 无法获取已消费的请求，导致请求流无法继续
    // 记录请求流中被消费的数据，形成备份，当当前请求无法继续时，可以从备份中恢复请求流
    collectRequest(req)

    const { query: refererQuery } = urlParse(req.headers.referer || '')
    const reqBody = await parseRequestBody(req, formidableOptions, bodyParserOptions)
    const cookies = new Cookies(req, res, cookiesOptions)
    const getCookie = cookies.get.bind(cookies)

    const method = req.method!.toUpperCase()
    let mock: MockHttpItem | undefined
    let _mockUrl: string | undefined

    // 查找匹配的mock，仅找出首个匹配的配置项后立即结束
    for (const mockUrl of mockUrls) {
      mock = fineMockData(mockData[mockUrl], logger, {
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
        .map(m =>
          m === _mockUrl ? ansis.underline.bold(m) : ansis.dim(m),
        )
        .join(', ')
      logger.warn(
        `${ansis.green(
          pathname,
        )} matches  ${matched} , but mock data is not found.`,
      )

      return next()
    }

    const request = req as MockRequest
    const response = res as MockResponse

    // provide request 往请求实例中注入额外的请求信息
    request.body = reqBody
    request.query = query
    request.refererQuery = refererQuery
    request.params = parseRequestParams(mock.url, pathname)
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
    provideResponseStatus(response, status, statusText)
    await provideResponseHeaders(request, response, mock, logger)
    await provideResponseCookies(request, response, mock, logger)

    logger.info(requestLog(request, filepath), logLevel)
    logger.debug(
      `${ansis.magenta('DEBUG')} ${ansis.underline(
        pathname,
      )}  matches: [ ${mockUrls
        .map(m => m === _mockUrl ? ansis.underline.bold(m) : ansis.dim(m))
        .join(', ')} ]\n`,
    )

    if (body) {
      try {
        const content = isFunction(body) ? await body(request) : body
        await responseRealDelay(startTime, delay)
        sendResponseData(response, content, type)
      }
      catch (e) {
        logger.error(
          `${ansis.red(
            `mock error at ${pathname}`,
          )}\n${e}\n  at body (${ansis.underline(filepath)})`,
          logLevel,
        )
        provideResponseStatus(response, 500)
        res.end('')
      }
      return
    }

    if (responseFn) {
      try {
        await responseRealDelay(startTime, delay)
        await responseFn(request, response, next)
      }
      catch (e) {
        logger.error(
          `${ansis.red(
            `mock error at ${pathname}`,
          )}\n${e}\n  at response (${ansis.underline(filepath)})`,
          logLevel,
        )
        provideResponseStatus(response, 500)
        res.end('')
      }
      return
    }

    res.end('')
  }
}
