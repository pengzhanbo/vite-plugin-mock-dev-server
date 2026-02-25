/**
 * Request recovery
 *
 * 请求复原
 *
 * Since parseReqBody consumes the request stream when parsing requests,
 * when the interface does not need to be mocked and is forwarded by vite http-proxy,
 * the request stream cannot continue.
 * To solve this, we record the request data in the request stream as a backup.
 * When the current request cannot continue, the request stream can be restored from the backup.
 *
 * 由于 parseReqBody 在解析请求时，会将请求流消费，
 * 导致当接口不需要被 mock，继而由 vite http-proxy 转发时，请求流无法继续。
 * 为此，我们在请求流中记录请求数据，当当前请求无法继续时，可以从备份中恢复请求流
 */
import type { Connect, UserConfig } from 'vite'
import { Buffer } from 'node:buffer'
import { objectKeys } from '@pengzhanbo/utils'

const cache = new WeakMap<Connect.IncomingMessage, Buffer>()

/**
 * Collect request data
 *
 * 备份请求数据
 *
 * @param req - Incoming message / 入站消息
 */
export function collectRequest(req: Connect.IncomingMessage): void {
  const chunks: Buffer[] = []
  req.addListener('data', (chunk) => {
    chunks.push(Buffer.from(chunk))
  })
  req.addListener('end', () => {
    chunks.length && cache.set(req, Buffer.concat(chunks))
  })
}

/**
 * Recover request for proxy
 *
 * vite 在 proxy 配置中，允许通过 configure 访问 http-proxy 实例，
 * 通过 http-proxy 的 proxyReq 事件，重新写入请求流
 *
 * @param config - Vite user config / Vite 用户配置
 */
export function recoverRequest(config: UserConfig): void {
  if (!config.server)
    return

  const proxies = config.server.proxy || {}

  objectKeys(proxies).forEach((key) => {
    const target = proxies[key]
    const options = typeof target === 'string' ? { target } : target
    if (options.ws)
      return

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
             * Using http-proxy's agent configuration will write to the proxy request stream in advance
             * https://github.com/http-party/node-http-proxy/issues/1287
             */
            if (!proxyReq.headersSent)
              proxyReq.setHeader('Content-Length', buffer.byteLength)

            if (!proxyReq.writableEnded)
              proxyReq.write(buffer)
          }
        })
      },
    }
  })
}
