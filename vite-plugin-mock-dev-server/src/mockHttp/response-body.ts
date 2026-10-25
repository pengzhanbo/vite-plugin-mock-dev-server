/**
 * Response body writing
 *
 * 响应体写入
 *
 * The response body can be a readable stream, a buffer, a string or any JSON
 * serializable value; the stream case is delegated to the stream lifecycle module.
 *
 * 响应体可以是可读流、Buffer、字符串或其他可被 JSON 序列化的值；
 * 可读流交由流生命周期模块处理。
 */

import type { MockResponse, ResponseBody } from '../types/index.js'
import type { StreamErrorContext } from './response-stream.js'
import { Buffer } from 'node:buffer'
import { isReadableStream } from '../utils/index.js'
import { attachStreamHandlers, pipeStreamData } from './response-stream.js'

/**
 * Send response data
 *
 * 设置响应数据
 *
 * 流式响应的源流错误会被接管：记录错误日志后按响应是否已开始发送分别处理，
 * 避免 `error` 事件无人监听抛出未捕获异常而终止整个 dev server 进程。
 *
 * Errors of a stream response are handled here: the error is logged and handled
 * according to whether the response has started, so that an unhandled `error`
 * event cannot crash the whole dev server process.
 *
 * @param res - Response object / 响应对象
 * @param raw - Response body data / 响应体数据
 * @param type - Response data type / 响应数据类型
 * @param context - Error log context of the stream response / 流式响应的错误日志上下文
 */
export function sendResponseData(
  res: MockResponse,
  raw: ResponseBody,
  type: string,
  context?: StreamErrorContext,
): void {
  if (isReadableStream(raw)) {
    if (attachStreamHandlers(res, raw, context)) {
      pipeStreamData(res, raw)
    }
  } else if (Buffer.isBuffer(raw)) {
    res.end(raw)
  } else {
    const content = typeof raw === 'string' ? raw : JSON.stringify(raw)
    res.end(type === 'buffer' ? Buffer.from(content) : content)
  }
}
