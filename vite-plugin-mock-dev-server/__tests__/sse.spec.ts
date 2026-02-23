/**
 * Test for SSE (Server-Sent Events) functionality
 *
 * SSE (Server-Sent Events) 功能测试
 */
import { describe, expect, it, vi } from 'vitest'
import { PassThrough, Writable } from 'node:stream'
import { createSSEStream } from '../src/helper'

/**
 * Create mock request with socket
 *
 * 创建带有 socket 的模拟请求对象
 */
function createMockReq() {
  return {
    socket: {
      setKeepAlive: vi.fn(),
      setNoDelay: vi.fn(),
      setTimeout: vi.fn(),
    },
  } as any
}

/**
 * Collect output from SSE stream
 *
 * 从 SSE 流中收集输出
 */
function collectStreamOutput(sseStream: any): Promise<string> {
  return new Promise((resolve, reject) => {
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
describe('SSE', () => {
  it('should call socket methods on initialization', () => {
    const req = createMockReq()
    const res = new PassThrough()
    
    createSSEStream(req, res as any)
    
    expect(req.socket.setKeepAlive).toHaveBeenCalledWith(true)
    expect(req.socket.setNoDelay).toHaveBeenCalledWith(true)
    expect(req.socket.setTimeout).toHaveBeenCalledWith(0)
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
    sse.destroy()
    
    expect(endSpy).toHaveBeenCalled()
  })

  it('should destroy SSE stream with error', async () => {
    const req = createMockReq()
    const res = new PassThrough()
    const sse = createSSEStream(req, res as any)
    
    const writeSpy = vi.spyOn(sse, 'write')
    const endSpy = vi.spyOn(sse, 'end')
    sse.destroy(new Error('test error'))
    
    expect(writeSpy).toHaveBeenCalledWith({ event: 'error', data: 'test error' })
    expect(endSpy).toHaveBeenCalled()
  })
})
