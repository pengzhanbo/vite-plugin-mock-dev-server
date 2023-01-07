import type * as http from 'node:http'
import { parse as urlParse } from 'node:url'
import { match, pathToRegexp } from 'path-to-regexp'
import type { Connect, ResolvedConfig } from 'vite'
import { MockLoader } from './MockLoader'
import { parseReqBody } from './parseReqBody'
import type { Method, MockServerPluginOptions, ResponseReq } from './types'
import { debug, isArray, isFunction, sleep } from './utils'
import { validate } from './validator'

export async function mockServerMiddleware(
  httpServer: http.Server | null,
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>,
): Promise<Connect.NextHandleFunction> {
  const include = isArray(options.include) ? options.include : [options.include]
  const exclude = isArray(options.exclude) ? options.exclude : [options.exclude]

  const define: ResolvedConfig['define'] = {}
  if (config.define) {
    for (const key in config.define) {
      const val = config.define[key]
      define[key] = typeof val === 'string' ? val : JSON.stringify(val)
    }
  }

  const loader = new MockLoader({
    include,
    exclude,
    define,
  })

  await loader.load()
  httpServer?.on('close', () => loader.close())

  /**
   * 获取 服务代理配置中，配置的 请求前缀，
   * 作为判断接口是否需要mock的首要条件。
   *
   * 在一般开发场景中，我们也只需要对通过 vite server 进行代理的请求 进行 mock
   */
  const proxies: string[] = Object.keys(config.server.proxy || {})

  return async function (req, res, next) {
    if (
      proxies.length === 0 ||
      !proxies.some((context) => doesProxyContextMatchUrl(context, req.url!))
    ) {
      return next()
    }
    const method = req.method!.toUpperCase()
    const { query, pathname } = urlParse(req.url!, true)
    const reqBody = await parseReqBody(req, options.formidableOptions)

    const currentMock = loader.mockList.find((mock) => {
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
          pathname!,
        ) || { params: {} }
        const params = urlMatch.params || {}
        const request = {
          query,
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
     * 接口响应延迟
     */
    if (currentMock.delay && currentMock.delay > 0) {
      await sleep(currentMock.delay)
    }

    res.statusCode = currentMock.status || 200
    res.statusMessage = currentMock.statusText || 'OK'

    const urlMatch = match(currentMock.url, { decode: decodeURIComponent })(
      pathname!,
    ) || { params: {} }
    const params = urlMatch.params || {}

    /**
     * 在 请求对象中，注入信息
     */
    ;(req as any).body = reqBody
    ;(req as any).query = query
    ;(req as any).params = params

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-Mock', 'generate by vite:mock-dev-server')
    if (currentMock.headers) {
      const headers = isFunction(currentMock.headers)
        ? await currentMock.headers({
            query,
            body: reqBody,
            params,
            headers: req.headers,
          })
        : currentMock.headers
      Object.keys(headers).forEach((key) => {
        res.setHeader(key, headers[key])
      })
    }

    if (currentMock.body) {
      let body: any
      if (isFunction(currentMock.body)) {
        body = await currentMock.body({
          query,
          body: reqBody,
          params,
          headers: req.headers,
        })
      } else {
        body = currentMock.body
      }
      res.end(JSON.stringify(body))
      return
    }

    if (currentMock.response) {
      await currentMock.response(
        req as Connect.IncomingMessage & ResponseReq,
        res,
        next,
      )
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
