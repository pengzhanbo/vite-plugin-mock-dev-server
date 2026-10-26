import type { AddressInfo } from 'node:net'
import { Buffer } from 'node:buffer'
import { once } from 'node:events'
import { Agent, createServer, request } from 'node:http'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import { createSSEStream } from '../src/helpers/index.js'

/**
 * Test for SSE (Server-Sent Events) functionality
 *
 * SSE (Server-Sent Events) 功能测试
 */

/**
 * Create mock request with socket
 *
 * 创建带有 socket 的模拟请求对象
 *
 * @param options - Socket options / socket 选项
 * @returns - 带有 socket 的模拟请求对象
 */
function createMockReq(options: { timeout?: number } = {}) {
  return {
    socket: {
      setKeepAlive: vi.fn(),
      setNoDelay: vi.fn(),
      setTimeout: vi.fn(),
      destroyed: false,
      ...options,
    },
  } as any
}

/**
 * Collect output from SSE stream
 *
 * 从 SSE 流中收集输出
 *
 * @param sseStream - SSE 流
 * @returns - 包含 SSE 流输出的 Promise
 */
function collectStreamOutput(sseStream: any): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    const output = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        callback()
      },
      final(callback) {
        resolve(Buffer.concat(chunks).toString())
        callback()
      },
    })

    sseStream.pipe(output)
  })
}

/**
 * Test suite for SSE functionality
 *
 * SSE 功能测试套件
 */
describe('sSE', () => {
  it('should call socket methods on initialization', () => {
    const req = createMockReq()
    const res = new PassThrough()

    createSSEStream(req, res as any)

    expect(req.socket.setKeepAlive).toHaveBeenCalledWith(true)
    expect(req.socket.setNoDelay).toHaveBeenCalledWith(true)
    expect(req.socket.setTimeout).toHaveBeenCalledWith(0)
  })

  it('should use chunked framing so a finite stream can end on a keep-alive connection', () => {
    const req = createMockReq()
    const res = new PassThrough() as any
    const writeHead = vi.fn()
    const flushHeaders = vi.fn()
    res.writeHead = writeHead
    res.flushHeaders = flushHeaders

    const sse = createSSEStream(req, res)

    expect(writeHead).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }),
    )
    expect(flushHeaders).toHaveBeenCalled()

    sse.end()
  })

  it('should transform message with data', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ data: 'test' })
    sse.end()

    const output = await outputPromise
    expect(output).toContain(':ok\n\n')
    expect(output).toContain('data: test\n')
  })

  it('should transform message with event', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ event: 'message', data: 'test' })
    sse.end()

    const output = await outputPromise
    expect(output).toContain('event: message\n')
    expect(output).toContain('data: test\n')
  })

  it('should transform message with id', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ id: '123', data: 'test' })
    sse.end()

    const output = await outputPromise
    expect(output).toContain('id: 123\n')
  })

  it('should transform message with retry', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ retry: 1000, data: 'test' })
    sse.end()

    const output = await outputPromise
    expect(output).toContain('retry: 1000\n')
  })

  it('should transform message with comment', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ comment: 'this is a comment' })
    sse.end()

    const output = await outputPromise
    expect(output).toContain(': this is a comment\n')
  })

  it('should transform message with object data', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ data: { message: 'hello' } })
    sse.end()

    const output = await outputPromise
    expect(output).toContain('data: {"message":"hello"}\n')
  })

  it('should transform message with multiline data', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const outputPromise = collectStreamOutput(sse)
    sse.write({ data: 'line1\nline2' })
    sse.end()

    const output = await outputPromise
    expect(output).toContain('data: line1\n')
    expect(output).toContain('data: line2\n')
  })

  it('should destroy SSE stream', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const endSpy = vi.spyOn(sse, 'end')
    const closePromise = once(sse, 'close')
    const returned = sse.destroy()

    expect(endSpy).toHaveBeenCalled()
    expect(returned).toBe(sse)

    await closePromise
    expect(sse.destroyed).toBe(true)
  })

  it('should destroy SSE stream with error', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const writeSpy = vi.spyOn(sse, 'write')
    const endSpy = vi.spyOn(sse, 'end')
    const errorSpy = vi.fn()
    sse.on('error', errorSpy)

    const closePromise = once(sse, 'close')
    sse.destroy(new Error('test error'))

    expect(writeSpy).toHaveBeenCalledWith({ event: 'error', data: 'test error' })
    expect(endSpy).toHaveBeenCalled()

    await closePromise
    // An 'error' event on the source stream is never forwarded by `pipe()` and
    // would crash the process when unhandled, so the error is sent as a frame.
    expect(errorSpy).not.toHaveBeenCalled()
    expect(res.read()?.toString()).toContain('event: error\ndata: test error\n')
  })

  it('should restore the socket idle timeout after the stream ends', async () => {
    const req = createMockReq({ timeout: 60_000 })
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    expect(req.socket.setTimeout).toHaveBeenCalledWith(0)

    const finished = once(sse, 'finish')
    sse.end()
    await finished

    expect(req.socket.setTimeout).toHaveBeenLastCalledWith(60_000)
  })

  it('should restore the socket idle timeout after the stream is destroyed', async () => {
    const req = createMockReq({ timeout: 60_000 })
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const closePromise = once(sse, 'close')
    sse.destroy()
    await closePromise

    expect(req.socket.setTimeout).toHaveBeenLastCalledWith(60_000)
  })

  it('should not touch the socket state again when it is already closed', async () => {
    const req = createMockReq({ timeout: 60_000 })
    req.socket.destroyed = true
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)

    const finished = once(sse, 'finish')
    sse.end()
    await finished

    expect(req.socket.setTimeout).toHaveBeenCalledTimes(1)
    expect(req.socket.setTimeout).toHaveBeenCalledWith(0)
  })

  it('should be safe to destroy after the stream ended', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)
    const errorSpy = vi.fn()
    sse.on('error', errorSpy)

    const finished = once(sse, 'finish')
    sse.end()
    await finished

    // Writing an error frame after `end()` would raise `ERR_STREAM_WRITE_AFTER_END`
    expect(() => sse.destroy(new Error('too late'))).not.toThrow()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('should restore the socket timeout of a real keep-alive connection', async () => {
    const observed: Array<number | undefined> = []
    const done = new Promise<void>((resolve) => {
      const server = createServer((req, res) => {
        const socket = req.socket
        // 1. timeout configured by the server before the SSE stream starts
        observed.push(socket.timeout)
        const sse = createSSEStream(req, res)
        // 2. SSE optimises the socket for streaming
        observed.push(socket.timeout)
        sse.once('finish', () => {
          // 3. the stream must restore the previous timeout once it is over
          observed.push(socket.timeout)
        })
        sse.write({ data: 'hello' })
        sse.end()
        res.once('close', resolve)
      })
      // Simulate a server with an idle timeout configured, e.g. `server.timeout`
      server.on('connection', (socket) => socket.setTimeout(60_000))
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as AddressInfo
        const agent = new Agent({ keepAlive: true })
        const clientReq = request({ host: '127.0.0.1', port, path: '/events', agent }, (res) => {
          res.resume()
          res.once('end', () => {
            agent.destroy()
            server.close()
            server.closeAllConnections()
          })
        })
        clientReq.end()
      })
    })

    await done

    expect(observed).toEqual([60_000, 0, 60_000])
  })
})
