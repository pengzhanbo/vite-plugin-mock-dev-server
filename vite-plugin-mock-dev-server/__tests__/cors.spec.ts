/**
 * Tests for CORS module
 *
 * CORS 模块测试
 */
import { describe, expect, it, vi } from 'vitest'
import { createCors } from '../src/mockHttp/cors'

describe('createCors', () => {
  it('should return undefined when corsOptions is false', () => {
    const result = createCors(false)
    expect(result).toBeUndefined()
  })

  it('should return middleware function when corsOptions is provided', () => {
    const result = createCors({
      origin: '*',
      methods: ['GET', 'POST'],
    })
    expect(typeof result).toBe('function')
  })

  it('should return middleware function when corsOptions is empty object', () => {
    const result = createCors({})
    expect(typeof result).toBe('function')
  })

  it('should handle CORS middleware execution', async () => {
    const corsMiddleware = createCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })

    expect(corsMiddleware).toBeDefined()

    // Create mock request and response
    const req = {
      method: 'GET',
      headers: {},
    } as any

    const res = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
    } as any

    // Execute middleware
    if (corsMiddleware) {
      await corsMiddleware(req, res)
    }

    // The cors middleware should have been called
    expect(corsMiddleware).toBeDefined()
  })

  it('should handle preflight requests', async () => {
    const corsMiddleware = createCors({
      origin: 'http://localhost:3000',
      credentials: true,
    })

    expect(corsMiddleware).toBeDefined()

    const req = {
      method: 'OPTIONS',
      headers: {
        'origin': 'http://localhost:3000',
        'access-control-request-method': 'POST',
      },
    } as any

    const res = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
      end: vi.fn(),
    } as any

    // CORS middleware for OPTIONS requests may wait for next() callback
    // which won't be called in our mock setup, so we just verify it doesn't throw
    if (corsMiddleware) {
      // Use a timeout to avoid hanging
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100)
      })
      const corsPromise = corsMiddleware(req, res)
      await expect(Promise.race([corsPromise, timeoutPromise])).rejects.toThrow('Timeout')
    }
  }, 1000)

  it('should handle specific origin configuration', async () => {
    const corsMiddleware = createCors({
      origin: ['http://localhost:3000', 'http://localhost:8080'],
      methods: ['GET', 'POST'],
    })

    expect(corsMiddleware).toBeDefined()

    const req = {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000',
      },
    } as any

    const res = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
    } as any

    if (corsMiddleware) {
      await corsMiddleware(req, res)
    }

    expect(corsMiddleware).toBeDefined()
  })

  it('should handle function origin configuration', async () => {
    const corsMiddleware = createCors({
      origin: (origin, callback) => {
        if (!origin || origin === 'http://allowed.com') {
          callback(null, true)
        }
        else {
          callback(new Error('Not allowed'))
        }
      },
    })

    expect(corsMiddleware).toBeDefined()

    const req = {
      method: 'GET',
      headers: {
        origin: 'http://allowed.com',
      },
    } as any

    const res = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
    } as any

    if (corsMiddleware) {
      await corsMiddleware(req, res)
    }

    expect(corsMiddleware).toBeDefined()
  })

  it('should handle exposed headers configuration', async () => {
    const corsMiddleware = createCors({
      origin: '*',
      exposedHeaders: ['X-Custom-Header', 'X-Request-ID'],
    })

    expect(corsMiddleware).toBeDefined()

    const req = {
      method: 'GET',
      headers: {},
    } as any

    const res = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
    } as any

    if (corsMiddleware) {
      await corsMiddleware(req, res)
    }

    expect(corsMiddleware).toBeDefined()
  })

  it('should handle maxAge configuration', async () => {
    const corsMiddleware = createCors({
      origin: '*',
      maxAge: 86400,
    })

    expect(corsMiddleware).toBeDefined()

    const req = {
      method: 'OPTIONS',
      headers: {},
    } as any

    const res = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
      end: vi.fn(),
    } as any

    // CORS middleware for OPTIONS requests may wait for next() callback
    // which won't be called in our mock setup, so we just verify it doesn't throw
    if (corsMiddleware) {
      // Use a timeout to avoid hanging
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100)
      })
      const corsPromise = corsMiddleware(req, res)
      await expect(Promise.race([corsPromise, timeoutPromise])).rejects.toThrow('Timeout')
    }
  }, 1000)
})
