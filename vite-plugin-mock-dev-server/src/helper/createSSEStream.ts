import type { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'node:http'
import { Transform } from 'node:stream'

/**
 * Server-sent events message interface
 *
 * Server-sent events 消息接口
 */
export interface SSEMessage {
  /**
   * Message data
   *
   * 消息数据
   */
  data?: string | object
  /**
   * Comment
   *
   * 注释
   */
  comment?: string
  /**
   * Event name
   *
   * 事件名称
   */
  event?: string
  /**
   * Event ID
   *
   * 事件 ID
   */
  id?: string
  /**
   * Retry interval
   *
   * 重试间隔
   */
  retry?: number
}

/**
 * Write headers interface
 *
 * 写入头信息接口
 */
interface WriteHeaders {
  /**
   * Write HTTP headers
   *
   * 写入 HTTP 头信息
   */
  writeHead?: (statusCode: number, headers?: OutgoingHttpHeaders) => WriteHeaders
  /**
   * Flush headers
   *
   * 刷新头信息
   */
  flushHeaders?: () => void
}

/**
 * Header stream type
 *
 * 头信息流类型
 */
export type HeaderStream = NodeJS.WritableStream & WriteHeaders

/**
 * Transforms "messages" to W3C event stream content.
 * See https://html.spec.whatwg.org/multipage/server-sent-events.html
 * A message is an object with one or more of the following properties:
 * - data (String or object, which gets turned into JSON)
 * - event
 * - id
 * - retry
 * - comment
 *
 * If constructed with a HTTP Request, it will optimise the socket for streaming.
 * If this stream is piped to an HTTP Response, it will set appropriate headers.
 *
 * 将 "messages" 转换为 W3C 事件流内容。
 * 参见 https://html.spec.whatwg.org/multipage/server-sent-events.html
 * 消息是一个具有以下一个或多个属性的对象：
 * - data (字符串或对象，会被转换为 JSON)
 * - event
 * - id
 * - retry
 * - comment
 *
 * 如果使用 HTTP 请求构造，它将优化套接字以进行流式传输。
 * 如果此流被管道传输到 HTTP 响应，它将设置适当的头信息。
 */
class SSEStream extends Transform {
  /**
   * Constructor
   *
   * 构造函数
   *
   * @param req - HTTP request object / HTTP 请求对象
   */
  constructor(req: IncomingMessage) {
    super({ objectMode: true })
    req.socket.setKeepAlive(true)
    req.socket.setNoDelay(true)
    req.socket.setTimeout(0)
  }

  /**
   * Pipe the stream to a destination
   *
   * 将流管道传输到目标
   *
   * @template T - Type of destination stream / 目标流的类型
   * @param destination - Destination stream / 目标流
   * @param options - Pipe options / 管道选项
   * @returns Destination stream / 目标流
   */
  pipe<T extends HeaderStream>(destination: T, options?: { end?: boolean }): T {
    if (destination.writeHead) {
      destination.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Transfer-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      })
      destination.flushHeaders?.()
    }
    // Some clients (Safari) don't trigger onopen until the first frame is received.
    destination.write(':ok\n\n')
    return super.pipe(destination, options)
  }

  /**
   * Transform message to SSE format
   *
   * 将消息转换为 SSE 格式
   *
   * @param message - SSE message / SSE 消息
   * @param encoding - Encoding / 编码
   * @param callback - Callback function / 回调函数
   */
  _transform(message: SSEMessage, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    if (message.comment)
      this.push(`: ${message.comment}\n`)
    if (message.event)
      this.push(`event: ${message.event}\n`)
    if (message.id)
      this.push(`id: ${message.id}\n`)
    if (message.retry)
      this.push(`retry: ${message.retry}\n`)
    if (message.data)
      this.push(dataString(message.data))
    this.push('\n')
    callback()
  }

  /**
   * Write message to the stream
   *
   * 向流写入消息
   *
   * @param message - SSE message / SSE 消息
   * @param encoding - Encoding / 编码
   * @param cb - Callback function / 回调函数
   * @returns Whether the write was successful / 写入是否成功
   */
  write(message: SSEMessage, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean
  /**
   * Write message to the stream
   *
   * 向流写入消息
   *
   * @param message - SSE message / SSE 消息
   * @param cb - Callback function / 回调函数
   * @returns Whether the write was successful / 写入是否成功
   */
  write(message: SSEMessage, cb?: (error: Error | null | undefined) => void): boolean
  /**
   * Write message to the stream
   *
   * 向流写入消息
   *
   * @param message - SSE message / SSE 消息
   * @param args - Additional arguments / 附加参数
   * @returns Whether the write was successful / 写入是否成功
   */
  write(message: SSEMessage, ...args: any[]): boolean {
    return super.write(message, ...args)
  }

  /**
   * Destroy the stream
   *
   * 销毁流
   *
   * @param error - Error object / 错误对象
   * @returns This stream / 此流
   */
  destroy(error?: Error): this {
    if (error) {
      this.write({ event: 'error', data: error.message })
    }
    this.end()
    return this
  }
}

/**
 * Convert data to SSE data string format
 *
 * 将数据转换为 SSE 数据字符串格式
 *
 * @param data - Data to convert / 要转换的数据
 * @returns SSE data string / SSE 数据字符串
 */
function dataString(data: string | object): string {
  if (typeof data === 'object')
    return dataString(JSON.stringify(data))
  return data.split(/\r\n|\r|\n/).map(line => `data: ${line}\n`).join('')
}

/**
 * Create a Server-sent events write stream for simulating EventSource
 *
 * 创建一个 Server-sent events 写入流，用于支持模拟 EventSource
 *
 * @example
 * ```ts
 * import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'
 *
 * export default defineMock({
 *   url: '/api',
 *   response: (req, res) => {
 *     const sse = createSSEStream(req, res)
 *     sse.write({ event: 'message', data: { message: 'hello world' } })
 *   }
 * })
 * ```
 *
 * @param req - HTTP request object / HTTP 请求对象
 * @param res - HTTP response object / HTTP 响应对象
 * @returns SSE stream instance / SSE 流实例
 */
export function createSSEStream(req: IncomingMessage, res: ServerResponse): SSEStream {
  const sse = new SSEStream(req)
  sse.pipe(res)
  return sse
}
