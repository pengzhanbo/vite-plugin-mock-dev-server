import type http from 'node:http'
import type { ServerResponse } from 'node:http'
import type { Connect } from 'vite'
import type { Logger } from '../core/logger.js'
import type { MockOptions } from '../types/index.js'
import { attemptAsync, toArray } from '@pengzhanbo/utils'
import cors from 'cors'
import { hasMockMethod } from './matcher.js'

/**
 * Create CORS middleware
 *
 * 创建 CORS 中间件
 *
 * `cors` 在预检请求（`preflightContinue` 为 `false`，默认值）或其他直接结束响应的场景下
 * 不会调用 `next`，仅依赖回调会让返回的 Promise 永远处于 pending 状态，
 * 因此同时监听响应结束与连接关闭，确保 Promise 一定 settle。
 *
 * `cors` does not call `next` for preflight requests (`preflightContinue` is `false` by
 * default) or other cases where it ends the response directly. Relying on the callback
 * alone would leave the returned Promise pending forever, so the response `finish` and
 * `close` events are watched to make sure the Promise always settles.
 *
 * @param corsOptions - CORS options / CORS 配置项
 * @returns CORS middleware function or undefined / CORS 中间件函数或未定义
 */
export function createCors(
  corsOptions?: cors.CorsOptions | false,
): ((req: Connect.IncomingMessage, res: http.ServerResponse) => Promise<void>) | undefined {
  const corsMiddleware = corsOptions ? cors(corsOptions) : undefined
  if (!corsMiddleware) {
    return undefined
  }
  return (req: Connect.IncomingMessage, res: http.ServerResponse): Promise<void> =>
    new Promise((resolve, reject) => {
      let settled = false
      const done = (err?: unknown): void => {
        if (settled) {
          return
        }
        settled = true
        // oxlint-disable-next-line promise/no-multiple-resolved typescript/prefer-promise-reject-errors
        err ? reject(err) : resolve()
      }

      // 响应被 `cors` 直接结束时不会调用 `next`，通过结束 / 关闭事件收尾
      res.once('finish', () => done())
      res.once('close', () => done())

      try {
        corsMiddleware(req, res, (err) => done(err))
      } catch (error) {
        done(error)
      }
    })
}

export interface CorsPreflightOptions {
  cors: ReturnType<typeof createCors>
  corsOptions: cors.CorsOptions | false
  mockData: Record<string, MockOptions>
  mockUrls: string[]
  scene: string[]
}

/**
 * 在匹配 mock 数据之前处理 CORS 预检请求
 *
 * 预检请求（`OPTIONS` + `Access-Control-Request-Method`）不对应任何 mock 规则，
 * `cors` 又会直接结束响应而不调用 `next`，因此不能放在「匹配到 mock 之后」处理。
 * 仅当该路径存在支持预检方法、且场景匹配（与正常匹配相同的 `activeScene`）的 mock
 * 时才由插件响应，否则交回后续中间件（如代理）。
 *
 * @param req - Request object / 请求对象
 * @param res - Response object / 响应对象
 * @param next - Next middleware / 下一个中间件
 * @param options - CORS preflight options / CORS 预检选项
 * @param logger - Logger instance / 日志实例
 * @returns Whether the preflight request is handled / 预检请求是否已被处理
 */
export async function handleCorsPreflight(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
  { cors: corsMiddleware, corsOptions, mockData, mockUrls, scene }: CorsPreflightOptions,
  logger: Logger,
): Promise<boolean> {
  if (!corsMiddleware || req.method?.toUpperCase() !== 'OPTIONS') {
    return false
  }

  const preflightMethod = (toArray(req.headers['access-control-request-method'])[0] ?? '')
    .trim()
    .toUpperCase()
  if (
    !preflightMethod ||
    !mockUrls.some((mockUrl) => hasMockMethod(mockData[mockUrl], preflightMethod, scene))
  ) {
    return false
  }

  const [corsError] = await attemptAsync(corsMiddleware, req, res)
  if (corsError) {
    logger.error(`CORS error: ${corsError}`)
    next(corsError)
    return true
  }

  // 默认配置下 `cors` 已结束预检响应；
  // `preflightContinue: true` 时 `cors` 只设置响应头并调用 next，
  // 这里同样将请求交给后续 handler，保持与 cors 一致的语义。
  if (typeof corsOptions === 'object' && corsOptions.preflightContinue) {
    next()
  } else if (!res.writableEnded) {
    const optionsSuccessStatus =
      typeof corsOptions === 'object' ? corsOptions.optionsSuccessStatus : undefined
    res.statusCode = optionsSuccessStatus ?? 204
    res.end()
  }
  return true
}
