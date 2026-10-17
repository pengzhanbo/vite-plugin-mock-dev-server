import type http from 'node:http'
import type { Connect } from 'vite'
import cors from 'cors'

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
