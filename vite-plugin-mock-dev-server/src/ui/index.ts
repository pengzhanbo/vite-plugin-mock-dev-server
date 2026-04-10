import type { AddressInfo } from 'node:net'
import type { Connect, HttpServer, Logger } from 'vite'
import type { Compiler } from '../compiler'
import type { ResolvedMockServerPluginOptions } from '../core'
import path from 'node:path'
import { clearUndefined, isBuffer, isFunction, omit } from '@pengzhanbo/utils'
import ansis from 'ansis'
import HTTP_STATUS from 'http-status'
import launchEditor from 'launch-editor'
import sirv from 'sirv'
import { getDirname, isStream, normalizePath, urlParse } from '../utils'

type MiddlewareParams = Parameters<Connect.Server['use']>

export function uiMiddleware(
  compiler: Compiler,
  options: ResolvedMockServerPluginOptions,
): MiddlewareParams[] {
  const prefix = normalizePath(`${options.base}/.vite-mock`)
  return [
    [
      `${prefix}/api/list`,
      ((_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'max-age=0')
        const data = Object.values(compiler.mockData)
          .flat()
          .filter(item => !item.ws)
          .map(item => clearUndefined({
            ...item,
            enabled: item.enabled ?? true,
            statusText: item.statusText ?? HTTP_STATUS[(item.status || 200) as keyof typeof HTTP_STATUS] ?? 'Unknown',
            headers: isFunction(item.headers) ? '<function>' : item.headers,
            body: isFunction(item.body)
              ? '<function>'
              : isBuffer(item.body)
                ? '<buffer>'
                : isStream(item.body)
                  ? '<stream>'
                  : item.body,
            validator: isFunction(item.validator) ? '<function>' : item.validator,
            cookies: isFunction(item.cookies) ? '<function>' : item.cookies,
            response: isFunction(item.response) ? '<function>' : undefined,
            error: item.error
              ? {
                  ...omit(item.error, ['body']),
                  body: isFunction(item.error.body) ? '<function>' : item.error.body,
                }
              : undefined,
          }))

        res.end(JSON.stringify(data))
      }) as Connect.NextHandleFunction,
    ],
    [
      `${prefix}/api/launch-editor`,
      ((req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'max-age=0')
        const { query } = urlParse(req.url!)
        if (query.file) {
          launchEditor(
            String(decodeURIComponent(String(query.file))),
          )
          res.end(JSON.stringify({ success: true }))
        }
      }) as Connect.NextHandleFunction,
    ],
    [
      prefix,
      sirv(path.join(getDirname(import.meta.url), 'ui'), {
        single: true,
        dev: true,
      }),
    ],
  ]
}

export function logUIInfo(httpServer: HttpServer, logger: Logger): void {
  httpServer.once('listening', () => {
    const address = httpServer.address() as AddressInfo
    setImmediate(() => logger.info(`  ${ansis.green('➜')}  ${ansis.bold.gray('Mock')}:    ${ansis.cyan(`http://localhost:${address.port}/.vite-mock/`)}`))
  })
}
