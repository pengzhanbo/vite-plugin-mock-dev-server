/**
 * Tests for the mock websocket server
 *
 * Mock WebSocket 服务测试
 */
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { Compiler } from '../src/compiler/index.js'
import type { ResolvedMockServerPluginOptions } from '../src/core/options.js'
import type { MockOptions, MockWebsocketItem } from '../src/types/index.js'
import { EventEmitter } from 'node:events'
import http from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebSocket } from 'ws'
import { mockWebSocket } from '../src/mockWebsocket/server.js'

const FILEPATH = 'mock/ws/demo.mock.ts'
const MOCK_URL = '/ws/demo'

/**
 * Create resolved plugin options for the mock websocket server
 *
 * 创建用于 Mock WebSocket 服务的插件解析配置
 *
 * @returns Resolved plugin options / 解析后的插件配置
 */
function createOptions(): ResolvedMockServerPluginOptions {
  return {
    wsProxies: [MOCK_URL],
    cookiesOptions: {},
    activeScene: [],
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  } as unknown as ResolvedMockServerPluginOptions
}

/**
 * Create a mock compiler with an event emitter
 *
 * 创建带事件派发能力的模拟编译器
 *
 * @param mockData - Mock data of the compiler / 编译器的 mock 数据
 * @returns Mock compiler instance / 模拟编译器实例
 */
function createCompiler(mockData: Record<string, MockOptions>): Compiler {
  return Object.assign(new EventEmitter(), { mockData }) as unknown as Compiler
}

/**
 * Create a websocket mock item
 *
 * 创建 websocket mock 配置项
 *
 * @param setup - Setup function of the mock / mock 的 setup 函数
 * @returns Mock websocket item / Mock websocket 配置项
 */
function createMockItem(setup: MockWebsocketItem['setup']): MockWebsocketItem {
  const mock = { url: MOCK_URL, ws: true, setup } as MockWebsocketItem
  // `__filepath__` is stamped by the compiler
  // `__filepath__` 由编译器注入
  ;(mock as any).__filepath__ = FILEPATH
  return mock
}

describe('mockWebSocket', () => {
  const clients: WebSocket[] = []
  const servers: Server[] = []

  afterEach(async () => {
    clients.splice(0).forEach((client) => client.terminate())
    await Promise.all(
      servers
        .splice(0)
        .map((server) => new Promise<void>((resolve) => server.close(() => resolve()))),
    )
  })

  /**
   * Start a http server with the mock websocket server attached
   *
   * 启动挂载了 Mock WebSocket 服务的 http 服务
   *
   * @param mockData - Mock data of the compiler / 编译器的 mock 数据
   * @returns Server context / 服务上下文
   */
  async function start(mockData: Record<string, MockOptions>): Promise<{
    compiler: Compiler
    port: number
  }> {
    const server = http.createServer()
    const compiler = createCompiler(mockData)
    servers.push(server)
    mockWebSocket(compiler, server, createOptions())
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
    return { compiler, port: (server.address() as AddressInfo).port }
  }

  /**
   * Connect to the mock websocket server
   *
   * 连接到 Mock WebSocket 服务
   *
   * @param port - Server port / 服务端口
   * @returns Connected client / 已连接的客户端
   */
  async function connect(port: number): Promise<WebSocket> {
    const client = new WebSocket(`ws://127.0.0.1:${port}${MOCK_URL}`)
    clients.push(client)
    await new Promise<void>((resolve, reject) => {
      client.once('open', () => resolve())
      client.once('error', reject)
    })
    return client
  }

  it('should not throw when the hmr recorded mock url has been removed', async () => {
    const setup = vi.fn()
    const mockData: Record<string, MockOptions> = { [MOCK_URL]: [createMockItem(setup)] }
    const { compiler, port } = await start(mockData)
    const client = await connect(port)

    expect(setup).toHaveBeenCalledTimes(1)

    // Simulate deleting the mock file or changing its `url`
    // 模拟删除 mock 文件或其 `url` 被修改
    delete mockData[MOCK_URL]
    expect(() => compiler.emit('mock:update-end', FILEPATH)).not.toThrow()
    expect(client.readyState).toBe(WebSocket.OPEN)

    // The stale hmr record has been removed, so restoring the mock url
    // must not restart the websocket server again
    // 失效的热更新记录已被移除，恢复 mock url 后不应再次重启 websocket 服务
    mockData[MOCK_URL] = [createMockItem(setup)]
    compiler.emit('mock:update-end', FILEPATH)
    expect(setup).toHaveBeenCalledTimes(1)
  })

  it('should remove the hmr record when the mock file is deleted', async () => {
    const setup = vi.fn()
    const mockData: Record<string, MockOptions> = { [MOCK_URL]: [createMockItem(setup)] }
    const { compiler, port } = await start(mockData)
    await connect(port)

    expect(setup).toHaveBeenCalledTimes(1)

    compiler.emit('mock:unlink', FILEPATH)

    // The hmr record has been removed, so the websocket server is no longer restarted
    // 热更新记录已被移除，websocket 服务不再被重启
    compiler.emit('mock:update-end', FILEPATH)
    expect(setup).toHaveBeenCalledTimes(1)
  })
})
