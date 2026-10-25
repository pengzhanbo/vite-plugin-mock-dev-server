import type { ServerResponse } from 'node:http'
import type { MockResponse } from '../types/index.js'
import { provideResponseStatus } from './response-status.js'

/**
 * Answer a request whose mock response failed
 *
 * 兜底处理 mock 响应执行失败
 *
 * @param res - Response object / 响应对象
 */
export function abortMockResponse(res: ServerResponse): void {
  if (res.writableEnded || res.destroyed) {
    return
  }
  if (res.headersSent) {
    res.destroy()
    return
  }

  res.removeHeader('content-length')
  provideResponseStatus(res as MockResponse, 500)
  res.end('')
}
