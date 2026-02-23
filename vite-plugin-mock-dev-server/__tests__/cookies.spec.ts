import http from 'node:http'
/**
 * Test for cookies functionality
 *
 * Cookie 功能测试
 */
import { describe, expect, it } from 'vitest'
import { Cookies, Keygrip } from '../src/cookies'

/**
 * Test suite for Cookies class
 *
 * Cookies 类测试套件
 */
describe('cookies', () => {
  it('should create a Cookies instance', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    const cookies = new Cookies(req, res)
    expect(cookies).toBeDefined()
  })

  it('should get cookie from request headers', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    req.headers.cookie = 'sessionId=abc123; userName=testUser'
    const cookies = new Cookies(req, res)

    expect(cookies.get('sessionId')).toBe('abc123')
    expect(cookies.get('userName')).toBe('testUser')
  })

  it('should return undefined when cookie not found', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    req.headers.cookie = 'sessionId=abc123'
    const cookies = new Cookies(req, res)

    expect(cookies.get('nonExistent')).toBeUndefined()
  })

  it('should set cookie in response', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    const cookies = new Cookies(req, res)

    cookies.set('sessionId', 'abc123')

    const setCookieHeader = res.getHeader('Set-Cookie')
    expect(setCookieHeader).toBeDefined()
    expect(Array.isArray(setCookieHeader)).toBe(true)
    expect((setCookieHeader as string[])[0]).toContain('sessionId=abc123')
  })

  it('should set cookie with options', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    const cookies = new Cookies(req, res)

    cookies.set('sessionId', 'abc123', {
      path: '/',
      maxAge: 3600,
      httpOnly: true,
    })

    const setCookieHeader = res.getHeader('Set-Cookie') as string[]
    expect(setCookieHeader[0]).toContain('path=/')
    expect(setCookieHeader[0].toLowerCase()).toContain('httponly')
  })

  it('should delete cookie by setting value to null', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    const cookies = new Cookies(req, res)

    cookies.set('sessionId', null)

    const setCookieHeader = res.getHeader('Set-Cookie') as string[]
    expect(setCookieHeader[0]).toContain('expires=Thu, 01 Jan 1970')
  })

  it('should handle multiple cookies', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    const cookies = new Cookies(req, res)

    cookies.set('cookie1', 'value1')
    cookies.set('cookie2', 'value2')

    const setCookieHeader = res.getHeader('Set-Cookie') as string[]
    expect(setCookieHeader).toHaveLength(2)
    expect(setCookieHeader[0]).toContain('cookie1=value1')
    expect(setCookieHeader[1]).toContain('cookie2=value2')
  })

  it('should overwrite existing cookie when overwrite is true', () => {
    const req = new http.IncomingMessage({} as any)
    const res = new http.ServerResponse(req)
    const cookies = new Cookies(req, res)

    cookies.set('sessionId', 'oldValue')
    cookies.set('sessionId', 'newValue', { overwrite: true })

    const setCookieHeader = res.getHeader('Set-Cookie') as string[]
    expect(setCookieHeader).toHaveLength(1)
    expect(setCookieHeader[0]).toContain('sessionId=newValue')
  })
})

/**
 * Test suite for Keygrip class
 *
 * Keygrip 类测试套件
 */
describe('keygrip', () => {
  it('should create a Keygrip instance', () => {
    const keys = ['secret1', 'secret2', 'secret3']
    const keygrip = new Keygrip(keys)
    expect(keygrip).toBeDefined()
  })

  it('should sign and verify data', () => {
    const keys = ['mySecretKey']
    const keygrip = new Keygrip(keys)
    const data = 'sessionId=abc123'

    const signature = keygrip.sign(data)
    expect(signature).toBeDefined()

    const index = keygrip.index(data, signature)
    expect(index).toBe(0)
  })

  it('should return -1 for invalid signature', () => {
    const keys = ['mySecretKey']
    const keygrip = new Keygrip(keys)
    const data = 'sessionId=abc123'

    const index = keygrip.index(data, 'invalidSignature')
    expect(index).toBe(-1)
  })

  it('should support rotating keys', () => {
    const keys = ['newKey', 'oldKey']
    const keygrip = new Keygrip(keys)
    const data = 'sessionId=abc123'

    const signatureWithOldKey = new Keygrip(['oldKey']).sign(data)
    const index = keygrip.index(data, signatureWithOldKey)
    expect(index).toBe(1)
  })

  it('should use first key for signing', () => {
    const keys = ['key1', 'key2', 'key3']
    const keygrip1 = new Keygrip(keys)
    const keygrip2 = new Keygrip(['key1'])
    const data = 'testData'

    const signature1 = keygrip1.sign(data)
    const signature2 = keygrip2.sign(data)
    expect(signature1).toBe(signature2)
  })
})
