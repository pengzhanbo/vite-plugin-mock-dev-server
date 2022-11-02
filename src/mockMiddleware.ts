// import fs from 'node:fs/promises'
import type * as http from 'node:http'
import { parse as urlParse } from 'node:url'
import { match, pathToRegexp } from 'path-to-regexp'
import type { Connect, ResolvedConfig } from 'vite'
import { MockLoader } from './MockLoader'
import { parseReqBody } from './parseReqBody'
import type { Method, MockServerPluginOptions, ResponseReq } from './types'
import { debug, getPackageDeps, isArray, isFunction, sleep } from './utils'
import { validate } from './validator'

export async function mockServerMiddleware(
  httpServer: http.Server | null,
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>
): Promise<Connect.NextHandleFunction> {
  const include = isArray(options.include) ? options.include : [options.include]
  const exclude = isArray(options.exclude) ? options.exclude : [options.exclude]
  const external = await getPackageDeps(process.cwd())

  const loader = new MockLoader({
    include,
    exclude,
    external,
    define: config.define || {},
  })

  await loader.load()
  httpServer?.on('close', () => loader.close())

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
    const reqBody = await parseReqBody(req)

    const currentMock = loader.mockList.find((mock) => {
      if (!pathname || !mock || !mock.url) return false
      const methods: Method[] = mock.method
        ? isArray(mock.method)
          ? mock.method
          : [mock.method]
        : ['GET', 'POST']
      if (!methods.includes(req.method!.toUpperCase() as Method)) return false
      const hasMock = pathToRegexp(mock.url).test(pathname)

      if (hasMock && mock.validator) {
        const urlMatch = match(mock.url, { decode: decodeURIComponent })(
          pathname!
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

    if (currentMock.delay && currentMock.delay > 0) {
      await sleep(currentMock.delay)
    }

    res.statusCode = currentMock.status || 200
    res.statusMessage = currentMock.statusText || 'OK'

    const urlMatch = match(currentMock.url, { decode: decodeURIComponent })(
      pathname!
    ) || { params: {} }
    const params = urlMatch.params || {}

    ;(req as any).body = reqBody
    ;(req as any).query = query
    ;(req as any).params = params

    res.setHeader('Content-Type', 'application/json')
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
        next
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
