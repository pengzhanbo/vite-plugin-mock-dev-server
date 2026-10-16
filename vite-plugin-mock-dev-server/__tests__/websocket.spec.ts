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
 * @param options - Options overrides / 配置项覆盖
 * @returns Resolved plugin options / 解析后的插件配置
 */
function createOptions(
  options: Partial<ResolvedMockServerPluginOptions> = {},
): ResolvedMockServerPluginOptions {
  return {
    wsProxies: [MOCK_URL],
    cookiesOptions: {},
    activeScene: [],
    priority: {},
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    ...options,
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
 * @param url - Mock url / mock 的 url
 * @returns Mock websocket item / Mock websocket 配置项
 */
function createMockItem(setup: MockWebsocketItem['setup'], url = MOCK_URL): MockWebsocketItem {
  const mock = { url, ws: true, setup } as MockWebsocketItem
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
   * @param options - Options overrides / 配置项覆盖
   * @returns Server context / 服务上下文
   */
  async function start(
    mockData: Record<string, MockOptions>,
    options: Partial<ResolvedMockServerPluginOptions> = {},
  ): Promise<{
    compiler: Compiler
    port: number
  }> {
    const server = http.createServer()
    const compiler = createCompiler(mockData)
    servers.push(server)
    mockWebSocket(compiler, server, createOptions(options))
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
    return { compiler, port: (server.address() as AddressInfo).port }
  }

  /**
   * Connect to the mock websocket server
   *
   * 连接到 Mock WebSocket 服务
   *
   * @param port - Server port / 服务端口
   * @param pathname - Request pathname / 请求路径
   * @returns Connected client / 已连接的客户端
   */
  async function connect(port: number, pathname = MOCK_URL): Promise<WebSocket> {
    const client = new WebSocket(`ws://127.0.0.1:${port}${pathname}`)
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

  describe('rule matching', () => {
    // 与 HTTP 侧一致，websocket 侧的候选规则也需要按匹配权重排序，
    // 命中多条规则时不能依赖 `mockData` 的键插入顺序
    // Same as the HTTP side, the candidate rules of the websocket side must be sorted
    // by matching weight, the winner must not depend on the key insertion order of `mockData`
    const WS_PROXIES = ['/ws']

    /**
     * Create mock data with a dynamic rule inserted before a static rule
     *
     * 创建「动态规则先于静态规则插入」的 mock 数据
     *
     * @param dynamicSetup - Setup of the dynamic rule / 动态规则的 setup
     * @param staticSetup - Setup of the static rule / 静态规则的 setup
     * @returns Mock data / mock 数据
     */
    function createConflictMockData(
      dynamicSetup: MockWebsocketItem['setup'],
      staticSetup: MockWebsocketItem['setup'],
    ): Record<string, MockOptions> {
      return {
        '/ws/:room': [createMockItem(dynamicSetup, '/ws/:room')],
        '/ws/lobby': [createMockItem(staticSetup, '/ws/lobby')],
      }
    }

    it('should match the static rule first when several rules hit the same path', async () => {
      const dynamicSetup = vi.fn()
      const staticSetup = vi.fn()
      const { port } = await start(createConflictMockData(dynamicSetup, staticSetup), {
        wsProxies: WS_PROXIES,
      })

      await connect(port, '/ws/lobby')

      expect(staticSetup).toHaveBeenCalledTimes(1)
      expect(dynamicSetup).not.toHaveBeenCalled()
    })

    it('should still match the dynamic rule for the paths it owns', async () => {
      const dynamicSetup = vi.fn()
      const staticSetup = vi.fn()
      const { port } = await start(createConflictMockData(dynamicSetup, staticSetup), {
        wsProxies: WS_PROXIES,
      })

      await connect(port, '/ws/other')

      expect(dynamicSetup).toHaveBeenCalledTimes(1)
      expect(staticSetup).not.toHaveBeenCalled()
    })

    it('should skip the candidate without a websocket mock', async () => {
      const setup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        '/ws/lobby': [{ url: '/ws/lobby' }],
        '/ws/:room': [createMockItem(setup, '/ws/:room')],
      }
      const { port } = await start(mockData, { wsProxies: WS_PROXIES })

      await connect(port, '/ws/lobby')

      expect(setup).toHaveBeenCalledTimes(1)
    })

    it('should respect the priority config', async () => {
      const dynamicSetup = vi.fn()
      const staticSetup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        '/ws/lobby': [createMockItem(staticSetup, '/ws/lobby')],
        '/ws/:room': [createMockItem(dynamicSetup, '/ws/:room')],
      }
      const { port } = await start(mockData, {
        wsProxies: WS_PROXIES,
        // 将动态规则的优先级提升到静态规则之前
        // Promote the dynamic rule ahead of the static rule
        priority: { special: { '/ws/:room': ['/ws/lobby'] } },
      })

      await connect(port, '/ws/lobby')

      expect(dynamicSetup).toHaveBeenCalledTimes(1)
      expect(staticSetup).not.toHaveBeenCalled()
    })

    it('should clear the sorted result cache when the mock data is updated', async () => {
      const dynamicSetup = vi.fn()
      const staticSetup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        '/ws/:room': [createMockItem(dynamicSetup, '/ws/:room')],
      }
      const { compiler, port } = await start(mockData, { wsProxies: WS_PROXIES })

      await connect(port, '/ws/lobby')
      expect(dynamicSetup).toHaveBeenCalledTimes(1)

      // 通过热更新新增静态规则，排序缓存必须被清空，否则旧的排序结果仍然生效
      // A static rule is added by hot update, the sorted cache must be cleared,
      // otherwise the stale sorted result keeps taking effect
      mockData['/ws/lobby'] = [createMockItem(staticSetup, '/ws/lobby')]
      compiler.emit('mock:update-end', 'mock/ws/lobby.mock.ts')

      await connect(port, '/ws/lobby')

      expect(staticSetup).toHaveBeenCalledTimes(1)
      expect(dynamicSetup).toHaveBeenCalledTimes(1)
    })
  })
})
