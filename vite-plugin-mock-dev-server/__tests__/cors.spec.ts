/**
 * Test for CORS middleware
 *
 * CORS 中间件测试
 */
import { describe, expect, it, vi } from 'vitest'
import { createCorsMiddleware } from '../src/core/cors'

/**
 * Mock compiler
 *
 * 模拟编译器
 */
const createMockCompiler = (mockData: any = {}) => ({
  mockData,
})

/**
 * Test suite for CORS middleware
 *
 * CORS 中间件测试套件
 */
describe('CORS middleware', () => {
  it('should return undefined when cors is disabled', () => {
    const compiler = createMockCompiler()
    const middleware = createCorsMiddleware(compiler, {
      proxies: ['/api'],
      cors: false,
    } as any)
    
    expect(middleware).toBeUndefined()
  })

  it('should create middleware when cors is enabled', () => {
    const compiler = createMockCompiler()
    const middleware = createCorsMiddleware(compiler, {
      proxies: ['/api'],
      cors: {},
    } as any)
    
    expect(middleware).toBeDefined()
    expect(typeof middleware).toBe('function')
  })

  it('should call next when URL does not match proxy context', () => {
    const compiler = createMockCompiler()
    const middleware = createCorsMiddleware(compiler, {
      proxies: ['/api'],
      cors: {},
    } as any)!
    
    const req = { url: '/other/path' } as any
    const res = {} as any
    const next = vi.fn()
    
    middleware(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })

  it('should call next when proxy list is empty', () => {
    const compiler = createMockCompiler()
    const middleware = createCorsMiddleware(compiler, {
      proxies: [],
      cors: {},
    } as any)!
    
    const req = { url: '/api/users' } as any
    const res = {} as any
    const next = vi.fn()
    
    middleware(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })

  it('should call next when URL pathname is missing', () => {
    const compiler = createMockCompiler()
    const middleware = createCorsMiddleware(compiler, {
      proxies: ['/api'],
      cors: {},
    } as any)!
    
    const req = { url: '' } as any
    const res = {} as any
    const next = vi.fn()
    
    middleware(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })

  it('should call next when no matching mock URL found', () => {
    const compiler = createMockCompiler({
      '/api/posts': [],
    })
    const middleware = createCorsMiddleware(compiler, {
      proxies: ['/api'],
      cors: {},
    } as any)!
    
    const req = { url: '/api/users' } as any
    const res = {} as any
    const next = vi.fn()
    
    middleware(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })
})
