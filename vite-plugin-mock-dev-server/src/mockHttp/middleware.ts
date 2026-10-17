// oxlint-disable max-lines-per-function

import type { CorsOptions } from 'cors'
import type { ServerResponse } from 'node:http'
import type { Connect } from 'vite'
import type { Logger, ResolvedMockServerPluginOptions } from '../core/index.js'
import type {
  ExtraRequest,
  MockHttpItem,
  MockOptions,
  MockRequest,
  MockResponse,
} from '../types/index.js'
import type { MatchingWeightSorter } from './matchingWeight.js'
import {
  attempt,
  attemptAsync,
  isFunction,
  isNil,
  omit,
  timestamp,
  toArray,
} from '@pengzhanbo/utils'
import ansis from 'ansis'
import Cookies from 'cookies'
import { recordRequestWithRawReq, replayRecordedRequest } from '../recorder/index.js'
import { doesProxyContextMatchUrl, isReadableStream, urlParse } from '../utils/index.js'
import { createCors } from './cors.js'
import { findMockData, hasMockMethod } from './matcher.js'
import { createMatchingWeightSorter } from './matchingWeight.js'
import { parseRequestBodyWithRaw, parseRequestParams, requestLog } from './request.js'
import { cacheRequestBody } from './requestRecovery.js'
import {
  attachStreamHandlers,
  pipeStreamData,
  provideResponseCookies,
  provideResponseHeaders,
  provideResponseStatus,
  responseRealDelay,
  sendResponseData,
} from './response.js'

export interface MockDataProvider {
  mockData: Record<string, MockOptions>
}

export interface CreateMockMiddlewareOptions extends Pick<
  ResolvedMockServerPluginOptions,
  | 'formidableOptions'
  | 'cookiesOptions'
  | 'bodyParserOptions'
  | 'priority'
  | 'record'
  | 'replay'
  | 'activeScene'
> {
  proxies: string[]
  logger: Logger
  cors: false | CorsOptions
}

/**
 * Create mock middleware
 *
 * 创建 Mock 中间件
 *
 * @param provider - Mock data provider / Mock 数据提供者
 * @param options - Middleware options / 中间件配置项
 * @param sortMockUrls - Mock URLs sorter / Mock URLs 排序器
 *
 * 排序器由调用方注入，便于调用方在 mock 数据热更新后清理排序缓存；
 * 未注入时使用独立的排序器实例（用于独立 mock server 等数据不会变更的场景）。
 *
 * The sorter is injected by the caller so that it can clear the sorted result cache
 * once mock data is hot-reloaded. When it is not injected, a private sorter instance
 * is used (for scenarios such as the standalone mock server, where data never changes).
 *
 * @returns Connect middleware function / Connect 中间件函数
 */
export function createMockMiddleware(
  provider: MockDataProvider,
  {
    formidableOptions,
    bodyParserOptions,
    proxies,
    cookiesOptions,
    logger,
    priority,
    cors: corsOptions,
    record,
    replay,
    activeScene,
  }: CreateMockMiddlewareOptions,
  sortMockUrls: MatchingWeightSorter = createMatchingWeightSorter(),
): (
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) => Promise<void> {
  const cors = createCors(corsOptions)

  /**
   * 在匹配 mock 数据之前处理 CORS 预检请求
   *
   * 预检请求（`OPTIONS` + `Access-Control-Request-Method`）不对应任何 mock 规则，
   * `cors` 又会直接结束响应而不调用 `next`，因此不能放在「匹配到 mock 之后」处理。
   * 仅当该路径存在支持预检方法的 mock 时才由插件响应，否则交回后续中间件（如代理）。
   *
   * @param req - Request object / 请求对象
   * @param res - Response object / 响应对象
   * @param next - Next middleware / 下一个中间件
   * @param mockData - Mock data / Mock 数据
   * @param mockUrls - Mock URLs matching the request pathname / 命中请求路径的 Mock URL
   * @returns Whether the preflight request is handled / 预检请求是否已被处理
   */
  async function handleCorsPreflight(
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction,
    mockData: Record<string, MockOptions>,
    mockUrls: string[],
  ): Promise<boolean> {
    if (!cors || req.method?.toUpperCase() !== 'OPTIONS') {
      return false
    }

    const preflightMethod = (toArray(req.headers['access-control-request-method'])[0] ?? '')
      .trim()
      .toUpperCase()
    if (
      !preflightMethod ||
      !mockUrls.some((mockUrl) => hasMockMethod(mockData[mockUrl], preflightMethod))
    ) {
      return false
    }

    const [corsError] = await attemptAsync(cors, req, res)
    if (corsError) {
      logger.error(`CORS error: ${corsError}`)
      next(corsError)
      return true
    }

    // 默认配置下 `cors` 已结束响应；`preflightContinue: true` 时由插件收尾
    if (!res.writableEnded) {
      const optionsSuccessStatus =
        typeof corsOptions === 'object' ? corsOptions.optionsSuccessStatus : undefined
      res.statusCode = optionsSuccessStatus ?? 204
      res.end()
    }
    return true
  }

  async function handleMockRequest(
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction,
  ): Promise<void> {
    const startTime = timestamp()
    const { query, pathname } = urlParse(req.url!)

    // 预先过滤不符合路径前缀的请求
    if (
      !pathname ||
      proxies.length === 0 ||
      !proxies.some((context) => doesProxyContextMatchUrl(context, req.url!))
    ) {
      return next()
    }

    const mockData = provider.mockData
    // 对满足匹配规则的配置进行优先级排序
    // mock 数据或优先级配置中若存在非法 url 模式，解析时会抛出异常，
    // 此处降级为 `next()`，将请求交给后续中间件处理
    const [weightError, mockUrls] = attempt(sortMockUrls, getMockUrls(mockData), pathname, priority)
    if (weightError) {
      logger.error(`${ansis.red(`Invalid mock url pattern at ${pathname}`)}\n  ${weightError}`)
      return next()
    }

    // 如果没有匹配到 mock 数据，且录制、回放功能均未启用，则直接跳过
    // 录制功能需要额外记录请求，回放功能需要从录制记录中查找请求，
    // 因此二者任一启用时都不能直接在这里跳过
    if (mockUrls.length === 0 && !record.enabled && !replay) {
      return next()
    }

    const method = req.method!.toUpperCase()

    // 预检请求需要在匹配 mock 之前处理，详见 `handleCorsPreflight`
    if (await handleCorsPreflight(req, res, next, mockData, mockUrls)) {
      return
    }

    const cookies = new Cookies(req, res, cookiesOptions)
    const { body: parsedBody, rawBody } = await parseRequestBodyWithRaw(
      req,
      logger,
      formidableOptions,
      bodyParserOptions,
    )
    cacheRequestBody(req, rawBody)

    let mock: MockHttpItem | undefined
    let _mockUrl: string | undefined

    const extraReq: Omit<ExtraRequest, 'params'> = {
      query,
      refererQuery: req.headers.referer ? urlParse(req.headers.referer).query : {},
      body: parsedBody,
      headers: req.headers,
      getCookie: cookies.get.bind(cookies),
    }

    // Resolve effective active scenario: X-Mock-Scene header overrides config
    // X-Mock-Scene 头部覆盖配置
    const headerScene = req.headers['x-mock-scene']
    const effectiveScene: string[] = headerScene
      ? toArray(headerScene)
          .map((item) => item.split(',').map((s) => s.trim()))
          .flat()
          .filter(Boolean)
      : activeScene

    // 查找匹配的mock，仅找出首个匹配的配置项后立即结束
    for (const mockUrl of mockUrls) {
      mock = findMockData(mockData[mockUrl], logger, {
        pathname,
        method,
        request: extraReq,
        activeScene: effectiveScene,
      })
      if (mock) {
        _mockUrl = mockUrl
        break
      }
    }

    // 如果没有匹配到 mock 数据，且回放功能已启用，则尝试从录制记录中回放
    if (replay && !mock) {
      mock = await replayRecordedRequest(req, pathname, extraReq.body, record)
    }

    if (!mock) {
      // 请求体录制时，需要记录请求体，以便后续回放时使用
      if (record.enabled) {
        recordRequestWithRawReq(req, pathname, extraReq.body)
      }
      const matched = mockUrls
        .map((m) => (m === _mockUrl ? ansis.underline.bold(m) : ansis.dim(m)))
        .join(', ')
      if (matched.length > 0) {
        logger.warn(`${ansis.green(pathname)} matches ${matched}, but mock data is not found.`)
      }

      return next()
    }

    // 处理 CORS - 仅对匹配到 mock 数据的请求应用
    if (cors) {
      const [error] = await attemptAsync(cors, req, res)
      if (error) {
        logger.error(`CORS error: ${error}`)
        return next(error)
      }
    }

    const request = req as MockRequest
    const response = res as MockResponse

    // provide request 往请求实例中注入额外的请求信息
    Object.assign(request, omit(extraReq, ['headers']))
    request.params = parseRequestParams(mock.url, pathname)

    // provide response
    response.setCookie = cookies.set.bind(cookies)

    const {
      delay,
      type = 'json',
      response: responseFn,
      log: logLevel,
      error: errorConfig,
      __filepath__: filepath,
    } = mock as MockHttpItem & { __filepath__: string }
    let { body, status = 200, statusText } = mock

    // 计算是否需要使接口返回错误
    const shouldSimulateError = errorConfig && (errorConfig.probability ?? 0.5) > Math.random()

    // error simulation
    if (shouldSimulateError) {
      status = errorConfig.status ?? 500
      statusText = errorConfig.statusText
      body = errorConfig.body
    }

    // provide headers
    provideResponseStatus(response, status, statusText)
    await provideResponseHeaders(request, response, mock, logger)
    await provideResponseCookies(request, response, mock, logger)

    logger.info(() => requestLog(request, filepath, shouldSimulateError), logLevel)
    logger.debug(
      () =>
        `${ansis.magenta('DEBUG')} ${ansis.underline(pathname)} matches: [ ${mockUrls
          .map((m) => (m === _mockUrl ? ansis.underline.bold(m) : ansis.dim(m)))
          .join(', ')} ]\n`,
    )

    if (!isNil(body)) {
      const [error] = await attemptAsync(async () => {
        const content = isFunction(body) ? await body(request) : body
        // 流式响应先注册错误与关闭处理器，再等待延迟：流可能在延迟阶段就读取失败，
        // 客户端也可能在延迟阶段提前断开，延迟结束后才开始传输流。
        if (isReadableStream(content)) {
          const canPipe = attachStreamHandlers(response, content, {
            logger,
            url: pathname,
            filepath,
            level: logLevel,
          })
          if (!canPipe) {
            return
          }
          await responseRealDelay(startTime, delay)
          pipeStreamData(response, content)
          return
        }

        await responseRealDelay(startTime, delay)
        sendResponseData(response, content, type)
      })

      if (error) {
        logger.error(
          `${ansis.red(`mock error at ${pathname}`)}\n  ${error}\n  at body (${ansis.underline.gray(filepath)})`,
          logLevel,
        )
        provideResponseStatus(response, 500)
        res.end('')
      }
      return
    }

    if (responseFn) {
      const [error] = await attemptAsync(async () => {
        await responseRealDelay(startTime, delay)
        await responseFn(request, response, next)
      })
      if (error) {
        logger.error(
          `${ansis.red(
            `mock error at ${pathname}`,
          )}\n  ${error}\n  at response (${ansis.underline.gray(filepath)})`,
          logLevel,
        )
        provideResponseStatus(response, 500)
        res.end('')
      }
      return
    }

    res.end('')
  }

  return async function mockMiddleware(req, res, next) {
    try {
      await handleMockRequest(req, res, next)
    } catch (error) {
      logger.error(
        `${ansis.red(`mock middleware error at ${ansis.underline(req.url!)}`)}\n  ${error}\n  at ${ansis.underline.gray('vite-plugin-mock-dev-server')}`,
      )
      if (res.writableEnded) {
        return
      }
      // 响应已经开始发送，无法再输出错误页，直接结束本次响应
      if (res.headersSent) {
        res.end()
        return
      }
      next(error)
    }
  }
}

const keysCache = new WeakMap<Record<string, MockOptions>, string[]>()

function getMockUrls(mockData: Record<string, MockOptions>): string[] {
  let mockUrls = keysCache.get(mockData)
  if (!mockUrls) {
    mockUrls = Object.keys(mockData)
    keysCache.set(mockData, mockUrls)
  }
  return mockUrls
}
