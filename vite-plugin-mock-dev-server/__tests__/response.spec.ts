/**
 * Test for response handling functions
 *
 * 响应处理函数测试
 */
import { describe, expect, it } from 'vitest'
import {
  getHTTPStatusText,
  provideResponseStatus,
  responseRealDelay,
} from '../src/core/response'

/**
 * Test suite for getHTTPStatusText function
 *
 * getHTTPStatusText 函数测试套件
 */
describe('getHTTPStatusText', () => {
  it('should get correct status text for standard codes', () => {
    expect(getHTTPStatusText(200)).toBe('OK')
    expect(getHTTPStatusText(201)).toBe('Created')
    expect(getHTTPStatusText(400)).toBe('Bad Request')
    expect(getHTTPStatusText(404)).toBe('Not Found')
    expect(getHTTPStatusText(500)).toBe('Internal Server Error')
  })

  it('should return Unknown for invalid status code', () => {
    expect(getHTTPStatusText(9999)).toBe('Unknown')
  })
})

/**
 * Test suite for provideResponseStatus function
 *
 * provideResponseStatus 函数测试套件
 */
describe('provideResponseStatus', () => {
  it('should set default status code and text', () => {
    const res = {
      statusCode: 0,
      statusMessage: '',
    } as any
    provideResponseStatus(res)
    expect(res.statusCode).toBe(200)
    expect(res.statusMessage).toBe('OK')
  })

  it('should set custom status code', () => {
    const res = {
      statusCode: 0,
      statusMessage: '',
    } as any
    provideResponseStatus(res, 404)
    expect(res.statusCode).toBe(404)
    expect(res.statusMessage).toBe('Not Found')
  })

  it('should set custom status text', () => {
    const res = {
      statusCode: 0,
      statusMessage: '',
    } as any
    provideResponseStatus(res, 200, 'Custom OK')
    expect(res.statusCode).toBe(200)
    expect(res.statusMessage).toBe('Custom OK')
  })
})

/**
 * Test suite for responseRealDelay function
 *
 * responseRealDelay 函数测试套件
 */
describe('responseRealDelay', () => {
  it('should not delay when delay is not provided', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime)
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should not delay when delay is zero', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, 0)
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should not delay when delay is negative', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, -100)
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })

  it('should delay for specified milliseconds', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, 50)
    const endTime = Date.now()
    expect(endTime - startTime).toBeGreaterThanOrEqual(45)
  })

  it('should handle delay range', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, [30, 50])
    const endTime = Date.now()
    const delay = endTime - startTime
    expect(delay).toBeGreaterThanOrEqual(25)
    expect(delay).toBeLessThanOrEqual(100)
  })

  it('should not delay when delay array is invalid', async () => {
    const startTime = Date.now()
    await responseRealDelay(startTime, [20] as unknown as [number, number])
    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50)
  })
})
