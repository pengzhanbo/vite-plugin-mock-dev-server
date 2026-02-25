import type http from 'node:http'
import type { Connect } from 'vite'
import cors from 'cors'

/**
 * Create CORS middleware
 *
 * 创建 CORS 中间件
 *
 * @param corsOptions - CORS options / CORS 配置项
 * @returns CORS middleware function or undefined / CORS 中间件函数或未定义
 */
export function createCors(corsOptions?: cors.CorsOptions | false): ((req: Connect.IncomingMessage, res: http.ServerResponse) => Promise<void>) | undefined {
  const corsMiddleware = corsOptions ? cors(corsOptions) : undefined
  return corsMiddleware
    ? (req: Connect.IncomingMessage, res: http.ServerResponse): Promise<void> =>
        new Promise((resolve, reject) => corsMiddleware(req, res, (err) => {
          err ? reject(err) : resolve()
        }))
    : undefined
}
