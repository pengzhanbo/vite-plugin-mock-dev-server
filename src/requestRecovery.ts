/**
 * 请求复原
 *
 * 由于 parseReqBody 在解析请求时，会将请求流消费，
 * 导致当接口不需要被 mock，继而由 vite http-proxy 转发时，请求流无法继续。
 * 为此，我们在请求流中记录请求数据，当当前请求无法继续时，可以从备份中恢复请求流
 */
import { Buffer } from 'node:buffer'
import type { Connect, UserConfig } from 'vite'

const cache = new WeakMap<Connect.IncomingMessage, Buffer>()

// 备份请求数据
export const collectRequest = (req: Connect.IncomingMessage) => {
  const chunks: Buffer[] = []
  req.addListener('data', (chunk) => {
    chunks.push(Buffer.from(chunk))
  })
  req.addListener('end', () => {
    if (chunks.length) {
      cache.set(req, Buffer.concat(chunks))
    }
  })
}

/**
 * vite 在 proxy 配置中，允许通过 configure 访问 http-proxy 实例，
 * 通过 http-proxy 的 proxyReq 事件，重新写入请求流
 */
export const recoverRequest = (config: UserConfig) => {
  if (!config.server) return

  const proxies = config.server.proxy || {}

  Object.keys(proxies).forEach((key) => {
    const target = proxies[key]
    const options = typeof target === 'string' ? { target } : target
    if (options.ws) return

    const { configure, ...rest } = options

    proxies[key] = {
      ...rest,
      configure(proxy, options) {
        configure?.(proxy, options)

        proxy.on('proxyReq', (proxyReq, req) => {
          const buffer = cache.get(req)
          if (buffer) {
            cache.delete(req)
            /**
             * 使用 http-proxy 的 agent 配置会提前写入代理请求流
             * https://github.com/http-party/node-http-proxy/issues/1287
             */
            if (!proxyReq.headersSent) {
              proxyReq.setHeader('Content-Length', buffer.byteLength)
            }
            if (!proxyReq.writableEnded) {
              proxyReq.write(buffer)
            }
          }
        })
      },
    }
  })
}
