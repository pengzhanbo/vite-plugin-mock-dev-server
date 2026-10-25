/**
 * Stream response lifecycle
 *
 * 流式响应生命周期
 *
 * The source stream of a stream response is bound to the response: its errors are
 * taken over here and answered according to whether the response has started, so an
 * unhandled `error` event can never crash the whole dev server process.
 *
 * 流式响应的源流与响应绑定：源流错误在此接管，并按响应是否已开始发送分别处理，
 * 避免无人监听的 `error` 事件终止整个 dev server 进程。
 */

import type { Readable } from 'node:stream'
import type { Logger } from '../core/index.js'
import type { MockHttpItem, MockResponse } from '../types/index.js'
import ansis from 'ansis'
import { getHTTPStatusText } from './response-status.js'

/**
 * Context used to report the errors of a stream response
 *
 * 用于输出流式响应错误的上下文
 */
export interface StreamErrorContext {
  logger: Logger
  url: string
  filepath?: string
  level?: MockHttpItem['log']
}

/**
 * Attach the error and close handlers of a stream response
 *
 * 为流式响应注册错误与关闭处理器
 *
 * 需要在开始传输流之前调用：`body` 函数返回的流可能在延迟阶段就读取失败，
 * 客户端也可能在延迟阶段提前断开，提前注册才能接管这些情况。
 * 同时监听源流的关闭：源流未正常结束（`readableEnded` 为 `false`）就被关闭时，
 * 响应不会收到结束信号，需要主动结束或销毁响应，避免客户端一直等待。
 * 响应此时已销毁时不会再注册处理器，并直接销毁源流。
 *
 * Must be called before piping the stream: the stream returned by a `body` function
 * may fail during the response delay, and the client may disconnect during it as
 * well, so the handlers have to be attached in advance. The close of the source
 * stream is handled too: when it is closed without ending (`readableEnded` is
 * `false`), the response never gets an end signal, so it is ended or destroyed to
 * keep the client from waiting forever. When the response is already destroyed, no
 * handler is attached and the source stream is destroyed instead.
 *
 * @param res - Response object / 响应对象
 * @param raw - Readable stream / 可读流
 * @param context - Error log context / 错误日志上下文
 * @returns Whether the stream can be piped to the response / 是否可以继续传输流
 */
export function attachStreamHandlers(
  res: MockResponse,
  raw: Readable,
  context?: StreamErrorContext,
): boolean {
  // 响应已销毁（如客户端提前断开）时不再连接源流
  // The response is already destroyed (e.g. the client disconnected early)
  if (res.destroyed) {
    if (!raw.destroyed) {
      raw.destroy()
    }
    return false
  }

  raw.once('error', (error: Error) => {
    if (context) {
      context.logger.error(
        `${ansis.red(`mock error at ${context.url}`)}\n  ${error}\n  at stream (${ansis.underline.gray(context.filepath ?? '')})`,
        context.level,
      )
    }

    // 源流已不可用，停止向响应写入剩余数据
    // The source stream is not usable anymore, stop writing to the response
    if (!raw.destroyed) {
      raw.destroy()
    }

    // 响应体已经开始写出，无法再改写状态码：销毁响应，让客户端感知响应不完整，
    // 而不是一直等待剩余字节。不传入 error，避免再触发未监听的 `error` 事件。
    // The response has already started, so the status cannot be changed anymore:
    // destroy it so the client notices the incomplete response instead of waiting
    // for the remaining bytes. No error is passed to avoid emitting an unhandled
    // `error` event on the response.
    if (res.headersSent || res.writableEnded) {
      res.destroy()
      return
    }

    // 尚未写出任何响应体，按 500 结束本次响应
    // Nothing has been written yet, end the response with 500
    res.removeHeader('content-length')
    res.statusCode = 500
    res.statusMessage = getHTTPStatusText(500)
    res.end('')
  })

  // 客户端提前断开时销毁源流，避免文件句柄 / 上游连接泄漏；
  // `pipe` 会在目标流关闭时自动 unpipe，但不会销毁源流
  // Destroy the source stream when the client disconnects early to avoid leaking
  // file handles / upstream connections; `pipe` unpipes but does not destroy it
  res.once('close', () => {
    if (!raw.destroyed) {
      raw.destroy()
    }
  })

  // 源流未正常结束就被关闭（如 mock 代码主动 destroy、上游连接被重置）时，
  // 响应不会收到结束信号，客户端会一直等待剩余字节，此时主动结束或销毁响应。
  // A source stream closed without ending (e.g. destroyed by the mock code or an
  // upstream reset) never ends the response, leaving the client waiting for the
  // remaining bytes; end or destroy the response in that case.
  raw.once('close', () => {
    if (raw.readableEnded || res.destroyed || res.writableEnded) {
      return
    }

    // 响应头已发出时无法改写状态码，销毁连接让客户端感知响应不完整
    // The headers have been sent, so destroy the connection to notify the client
    if (res.headersSent) {
      res.destroy()
      return
    }

    res.removeHeader('content-length')
    res.statusCode = 500
    res.statusMessage = getHTTPStatusText(500)
    res.end('')
  })

  return true
}

/**
 * Pipe a prepared stream to the response
 *
 * 将已注册处理器的可读流写入响应
 *
 * 注册处理器与开始传输之间可能存在响应延迟，期间响应可能已经结束或销毁，
 * 此时不再连接源流，避免向已关闭的响应写入数据。
 *
 * The response delay may elapse between attaching the handlers and starting the pipe;
 * the response may have finished or been destroyed in the meantime, in which case the
 * source stream is not connected to avoid writing to a closed response.
 *
 * @param res - Response object / 响应对象
 * @param raw - Readable stream / 可读流
 */
export function pipeStreamData(res: MockResponse, raw: Readable): void {
  if (res.destroyed || res.writableEnded) {
    if (!raw.destroyed) {
      raw.destroy()
    }
    return
  }
  raw.pipe(res)
}
