import type http from 'node:http'
import type { Connect } from 'vite'
import cors from 'cors'

export function createCors(corsOptions?: cors.CorsOptions | false): ((req: Connect.IncomingMessage, res: http.ServerResponse) => Promise<void>) | undefined {
  const corsMiddleware = corsOptions ? cors(corsOptions) : undefined
  return corsMiddleware
    ? (req: Connect.IncomingMessage, res: http.ServerResponse): Promise<void> =>
        new Promise((resolve, reject) => corsMiddleware(req, res, (err) => {
          err ? reject(err) : resolve()
        }))
    : undefined
}
