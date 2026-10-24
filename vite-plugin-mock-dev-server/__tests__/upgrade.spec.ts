/**
 * Tests for the websocket upgrade handler
 *
 * websocket 升级处理测试
 */
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Compiler } from '../src/compiler/index.js'
import type { WebSocketServerPool } from '../src/mockWebsocket/pool.js'
import type { UpgradeHandlerOptions } from '../src/mockWebsocket/upgrade.js'
import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import { createMatchingWeightSorter } from '../src/core/matchingWeight.js'
import { handleUpgradeRequest } from '../src/mockWebsocket/upgrade.js'

/**
 * Create a logger whose output can be asserted
 *
 * 创建可断言输出的日志实例
 *
 * @returns Mock logger / 模拟日志实例
 */
function createLogger() {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

/**
 * Create handler options with a minimal compiler and pool
 *
 * 创建带有最小编译器与服务池的处理器配置
 *
 * @param logger - Logger instance / 日志实例
 * @returns Handler options / 处理器配置
 */
function createOptions(logger: ReturnType<typeof createLogger>): UpgradeHandlerOptions {
  return {
    compiler: { mockData: {} } as unknown as Compiler,
    pool: {} as unknown as WebSocketServerPool,
    logger,
    proxies: ['/ws'],
    activeScene: [],
    priority: {},
    cookiesOptions: {},
    sorter: createMatchingWeightSorter(),
    onMatched: vi.fn(),
  }
}

describe('handleUpgradeRequest', () => {
  it('should log a malformed upgrade URL and leave the socket untouched', () => {
    const logger = createLogger()
    const socket = { write: vi.fn(), end: vi.fn(), destroy: vi.fn() }
    const req = { url: '/ws/100%', headers: {} } as IncomingMessage

    // `/ws/100%` 的路径名包含非法的百分号编码，`decodeURIComponent` 会抛出 URIError
    // The pathname of `/ws/100%` holds an illegal percent-encoding, which makes
    // `decodeURIComponent` throw a URIError
    handleUpgradeRequest(createOptions(logger), req, socket as unknown as Duplex, Buffer.alloc(0))

    // 无法解析的 URL 交由 vite 自身的 upgrade 处理器，但必须留下日志，
    // 否则与「不属于 wsPrefix」无法区分
    // An unparsable URL is left to vite's own upgrade handlers, but it must be logged,
    // otherwise it is indistinguishable from a URL outside `wsPrefix`
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0]).toContain('Malformed websocket upgrade URL')
    expect(socket.write).not.toHaveBeenCalled()
    expect(socket.end).not.toHaveBeenCalled()
    expect(socket.destroy).not.toHaveBeenCalled()
  })
})
