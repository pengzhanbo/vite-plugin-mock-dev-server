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

import type { Buffer } from 'node:buffer'
import type { Connect } from 'vite'
import type { ProxySetup } from '../utils/index.js'

const cache = new WeakMap<Connect.IncomingMessage, Buffer>()

/**
 * Cache request body
 *
 * 缓存请求体数据
 *
 * @param req - Incoming message / 入站消息
 * @param body - Raw request body / 原始请求体
 */
export function cacheRequestBody(req: Connect.IncomingMessage, body?: Buffer): void {
  if (body?.byteLength) {
    cache.set(req, body)
  }
}

/**
 * Proxy setup that restores the consumed request stream via http-proxy's `proxyReq` event.
 *
 * 通过 http-proxy 的 `proxyReq` 事件，重新写入被消费的请求流。
 *
 * @param proxy - http-proxy instance / http-proxy 实例
 */
export const requestRecoverySetup: ProxySetup = (proxy) => {
  proxy.on('proxyReq', (proxyReq, req) => {
    const buffer = cache.get(req)
    if (buffer) {
      cache.delete(req)
      /**
       * Using http-proxy's agent configuration will write to the proxy request stream in advance
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
}
