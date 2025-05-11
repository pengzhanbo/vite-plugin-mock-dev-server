import type { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'node:http'
import { Transform } from 'node:stream'

export interface SSEMessage {
  data?: string | object
  comment?: string
  event?: string
  id?: string
  retry?: number
}

interface WriteHeaders {
  writeHead?: (statusCode: number, headers?: OutgoingHttpHeaders) => WriteHeaders
  flushHeaders?: () => void
}

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
 */
class SSEStream extends Transform {
  constructor(req: IncomingMessage) {
    super({ objectMode: true })
    req.socket.setKeepAlive(true)
    req.socket.setNoDelay(true)
    req.socket.setTimeout(0)
  }

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

  write(message: SSEMessage, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean
  write(message: SSEMessage, cb?: (error: Error | null | undefined) => void): boolean
  write(message: SSEMessage, ...args: any[]): boolean {
    return super.write(message, ...args)
  }
}

function dataString(data: string | object): string {
  if (typeof data === 'object')
    return dataString(JSON.stringify(data))
  return data.split(/\r\n|\r|\n/).map(line => `data: ${line}\n`).join('')
}

export function createSSEStream(req: IncomingMessage, res: ServerResponse): SSEStream {
  const sse = new SSEStream(req)
  sse.pipe(res)
  return sse
}
