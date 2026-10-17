/**
 * Tests for logger
 *
 * 日志实例测试
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLogger } from '../src/core/logger.js'

/**
 * Test suite for logger
 *
 * 日志实例测试套件
 */
describe('createLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not evaluate a lazy message when the level filters it out', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const logger = createLogger('test', 'silent')
    const message = vi.fn(() => 'mock request')

    logger.info(message)
    // `info(msg, false)` 解析为 `error` 级别，同样不应输出
    // `info(msg, false)` resolves to the `error` level, which is filtered out as well
    logger.info(message, false)

    expect(message).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  it('should evaluate a lazy message once when it is output', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const logger = createLogger('test', 'info')
    const message = vi.fn(() => 'mock request')

    logger.info(message)

    expect(message).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledTimes(1)
    expect(String(log.mock.calls[0][0])).toContain('mock request')
  })

  it('should keep supporting plain string messages', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const logger = createLogger('test', 'info')

    logger.info('plain message')

    expect(log).toHaveBeenCalledTimes(1)
    expect(String(log.mock.calls[0][0])).toContain('plain message')
  })
})
