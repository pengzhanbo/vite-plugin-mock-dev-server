/**
 * Tests for the mock websocket server
 *
 * Mock WebSocket 服务测试
 */
import type { Server } from 'node:http'
import type { AddressInfo, Socket } from 'node:net'
import type { WebSocketServer } from 'ws'
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
 * @param filepath - Path of the mock file / mock 文件的路径
 * @returns Mock websocket item / Mock websocket 配置项
 */
function createMockItem(
  setup: MockWebsocketItem['setup'],
  url = MOCK_URL,
  filepath = FILEPATH,
): MockWebsocketItem {
  const mock = { url, ws: true, setup } as MockWebsocketItem
  // `__filepath__` is stamped by the compiler
  // `__filepath__` 由编译器注入
  ;(mock as any).__filepath__ = filepath
  return mock
}

describe('mockWebSocket', () => {
  const clients: WebSocket[] = []
  const servers: Server[] = []
  // 作为兜底：被忽略的 upgrade 连接（如放行给 vite 的 hmr 请求）既不会自行关闭，
  // 也无法由 `server.closeAllConnections()` 回收，会让 `server.close()` 一直等待，
  // 因此需要在连接建立时记录下来手动销毁，保证用例是「失败」而不是「卡住」
  // As a safety net: a connection whose upgrade was ignored (such as the hmr request
  // that is left to vite) is neither closed on its own nor reclaimed by
  // `server.closeAllConnections()`, which keeps `server.close()` waiting. Tracking the
  // sockets makes a regression fail instead of hanging the suite
  const connections = new Set<Socket>()

  afterEach(async () => {
    clients.splice(0).forEach((client) => {
      // `terminate()` 一个尚未完成握手的连接会让 `ws` 派发 `error`，
      // 没有监听时它会成为未捕获异常
      // `terminate()` on a connection whose handshake never completed makes `ws`
      // dispatch an `error` event, which becomes an uncaught exception when unhandled
      client.on('error', () => {})
      client.terminate()
    })
    connections.forEach((socket) => socket.destroy())
    connections.clear()
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
    server.on('connection', (socket) => {
      connections.add(socket)
      socket.on('close', () => connections.delete(socket))
    })
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
   * @param timeout - Handshake timeout in ms / 握手超时时间（毫秒）
   * @returns Connected client / 已连接的客户端
   */
  async function connect(port: number, pathname = MOCK_URL, timeout = 3000): Promise<WebSocket> {
    const client = new WebSocket(`ws://127.0.0.1:${port}${pathname}`)
    clients.push(client)
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        // 超时的客户端必须释放连接，避免用例结束后仍持有 TCP 连接
        // A timed out client must release its connection, so that no TCP connection
        // is still held once the case is over
        client.terminate()
        reject(new Error(`Timed out connecting to ${pathname}`))
      }, timeout)
      client.once('open', () => {
        clearTimeout(timer)
        resolve()
      })
      client.once('error', (error) => {
        clearTimeout(timer)
        reject(error)
      })
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

  // 删除 ws mock 文件后，该文件创建的 websocket 服务与客户端连接必须被回收：
  // 提供 `setup` 的文件已不存在，保留它们会让客户端继续与已删除的 mock 逻辑通信
  // A deleted ws mock file must have its websocket servers and client connections
  // recycled: the file that provided `setup` is gone, keeping them would let the
  // clients keep talking to mock logic that has been deleted
  describe('mock file deletion', () => {
    const FIRST_FILE = 'mock/ws/first.mock.ts'
    const SECOND_FILE = 'mock/ws/second.mock.ts'

    it('should close the server and disconnect the clients when the mock file is deleted', async () => {
      const setup = vi.fn()
      const cleanup = vi.fn()
      const mockSetup: MockWebsocketItem['setup'] = (wss, context) => {
        context.onCleanup(cleanup)
        setup(wss)
      }
      const mockData: Record<string, MockOptions> = { [MOCK_URL]: [createMockItem(mockSetup)] }
      const { compiler, port } = await start(mockData)
      const client = await connect(port)

      expect(setup).toHaveBeenCalledTimes(1)

      let closeCode: number | undefined
      client.once('close', (code) => {
        closeCode = code
      })

      compiler.emit('mock:unlink', FILEPATH)
      // 真实流程中编译器会在删除后继续派发 `mock:update-end`（并清空排序缓存）
      // In the real flow the compiler dispatches `mock:update-end` after the deletion
      // (and clears the sorted cache)
      delete mockData[MOCK_URL]
      compiler.emit('mock:update-end', FILEPATH)

      // `onCleanup` 注册的定时器/循环等资源随文件删除一起释放
      // The resources registered by `onCleanup` (timers / loops) are released with the file
      expect(cleanup).toHaveBeenCalledTimes(1)
      // 客户端被断开（1001 表示服务端离开），服务端不残留连接
      // The client is disconnected (1001 means going away) and no connection is left
      await vi.waitFor(() => expect(client.readyState).toBe(WebSocket.CLOSED))
      expect(closeCode).toBe(1001)
      await vi.waitFor(() => expect(connections.size).toBe(0))
    })

    it('should report a throwing cleanup and keep recycling', async () => {
      const cleanup = vi.fn()
      const errorLog = vi.fn()
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: errorLog,
      } as unknown as ResolvedMockServerPluginOptions['logger']
      const mockSetup: MockWebsocketItem['setup'] = (wss, context) => {
        context.onCleanup(() => {
          throw new Error('cleanup failed')
        })
        context.onCleanup(cleanup)
      }
      const mockData: Record<string, MockOptions> = { [MOCK_URL]: [createMockItem(mockSetup)] }
      const { compiler, port } = await start(mockData, { logger })
      const client = await connect(port)

      compiler.emit('mock:unlink', FILEPATH)
      delete mockData[MOCK_URL]
      compiler.emit('mock:update-end', FILEPATH)

      // 抛错的清理被记录，且不会中断其余清理与回收流程
      // The throwing cleanup is reported, and does not interrupt the remaining cleanups
      // nor the recycling
      expect(cleanup).toHaveBeenCalledTimes(1)
      expect(errorLog).toHaveBeenCalledTimes(1)
      expect(String(errorLog.mock.calls[0][0])).toContain('cleanup failed')
      await vi.waitFor(() => expect(client.readyState).toBe(WebSocket.CLOSED))
      await vi.waitFor(() => expect(connections.size).toBe(0))
    })

    it('should not affect the websocket servers of other mock files', async () => {
      const firstSetup = vi.fn()
      const secondSetup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        '/ws/first': [createMockItem(firstSetup, '/ws/first', FIRST_FILE)],
        '/ws/second': [createMockItem(secondSetup, '/ws/second', SECOND_FILE)],
      }
      const { compiler, port } = await start(mockData, { wsProxies: ['/ws'] })
      const firstClient = await connect(port, '/ws/first')
      const secondClient = await connect(port, '/ws/second')

      compiler.emit('mock:unlink', FIRST_FILE)
      delete mockData['/ws/first']
      compiler.emit('mock:update-end', FIRST_FILE)

      // 只回收被删除文件创建的服务：其他 mock 文件的连接不受影响
      // Only the server created by the deleted file is recycled, the connections of
      // the other mock files are left untouched
      await vi.waitFor(() => expect(firstClient.readyState).toBe(WebSocket.CLOSED))
      expect(secondClient.readyState).toBe(WebSocket.OPEN)
      expect(secondSetup).toHaveBeenCalledTimes(1)
    })

    it('should build a new websocket server when another rule keeps the mock url', async () => {
      const firstSetup = vi.fn()
      const secondSetup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        [MOCK_URL]: [createMockItem(firstSetup, MOCK_URL, FIRST_FILE)],
      }
      const { compiler, port } = await start(mockData)
      const client = await connect(port)

      expect(firstSetup).toHaveBeenCalledTimes(1)

      // 删除第一个 mock 文件，同时另一个文件的规则接管了同一个 url
      // The first mock file is deleted while a rule of another file takes over the url
      compiler.emit('mock:unlink', FIRST_FILE)
      mockData[MOCK_URL] = [createMockItem(secondSetup, MOCK_URL, SECOND_FILE)]

      await vi.waitFor(() => expect(client.readyState).toBe(WebSocket.CLOSED))

      // 旧的 websocket 服务已关闭且不再被复用（否则 `handleUpgrade` 会以 503 失败），
      // 新连接基于当前 mock 数据重建服务并执行新的 setup
      // The old server is closed and no longer reused (otherwise `handleUpgrade` fails
      // with 503), the new connection builds a server from the current mock data and
      // runs the new setup
      const reconnected = await connect(port)
      expect(secondSetup).toHaveBeenCalledTimes(1)
      expect(reconnected.readyState).toBe(WebSocket.OPEN)
    })

    it('should not reuse the closing server while a client is still closing', async () => {
      const firstSetup = vi.fn()
      const secondSetup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        [MOCK_URL]: [createMockItem(firstSetup, MOCK_URL, FIRST_FILE)],
      }
      const { compiler, port } = await start(mockData)
      const client = await connect(port)

      // 暂停客户端 socket：它不会回应关闭帧，旧服务因此会停留在「正在关闭」状态
      // （websocket 服务只有在客户端全部断开后才会派发 `close`）
      // Pause the socket of the client: it never answers the close frame, so the old
      // server stays in the closing state (a websocket server only dispatches `close`
      // once every client is gone)
      client.pause()

      compiler.emit('mock:unlink', FIRST_FILE)
      mockData[MOCK_URL] = [createMockItem(secondSetup, MOCK_URL, SECOND_FILE)]

      // 连接池条目在删除时就已被丢弃，新连接不会命中正在关闭的服务
      // （否则 `handleUpgrade` 会以 503 失败）
      // The pool entry was dropped on deletion, so the new connection does not hit the
      // closing server (otherwise `handleUpgrade` fails with 503)
      const reconnected = await connect(port)

      expect(secondSetup).toHaveBeenCalledTimes(1)
      expect(reconnected.readyState).toBe(WebSocket.OPEN)
    })

    it('should serve the connections again when the mock file is created back', async () => {
      const setup = vi.fn()
      const mockData: Record<string, MockOptions> = { [MOCK_URL]: [createMockItem(setup)] }
      const { compiler, port } = await start(mockData)
      const client = await connect(port)

      expect(setup).toHaveBeenCalledTimes(1)

      // 删除 mock 文件：规则被移除，服务与连接被回收
      // The mock file is deleted: the rule is removed, the server and its clients are recycled
      compiler.emit('mock:unlink', FILEPATH)
      delete mockData[MOCK_URL]
      compiler.emit('mock:update-end', FILEPATH)
      await vi.waitFor(() => expect(client.readyState).toBe(WebSocket.CLOSED))

      // 规则已被移除，新的连接被直接拒绝
      // The rule is gone, a new connection is rejected right away
      await expect(connect(port)).rejects.toThrow(/Unexpected server response: 404/)

      // 文件重新创建：新连接重建服务并重新执行 setup
      // The file is created back: the next connection rebuilds the server and runs setup again
      mockData[MOCK_URL] = [createMockItem(setup)]
      const reconnected = await connect(port)

      expect(reconnected.readyState).toBe(WebSocket.OPEN)
      expect(setup).toHaveBeenCalledTimes(2)
    })
  })

  // mock 注册的监听需要能被精确移除：热更新时旧监听被移除、`setup` 重新执行；
  // 而插件自身的监听（同步 `connectionList`）与 `ws` 内部的监听（维护 `wss.clients`）
  // 必须保留 —— 否则已断开的连接会一直留在 `wss.clients` 中
  describe('listener lifecycle', () => {
    it('should replace the listeners of the mock and keep the internal ones on hot update', async () => {
      let received = 0
      let wssRef: WebSocketServer | undefined
      const mockSetup: MockWebsocketItem['setup'] = (wss) => {
        wssRef = wss
        wss.on('connection', (ws) => {
          ws.on('message', () => {
            received += 1
          })
        })
      }
      const mockData: Record<string, MockOptions> = { [MOCK_URL]: [createMockItem(mockSetup)] }
      const { compiler, port } = await start(mockData)
      const client = await connect(port)

      // 热更新：mock 的旧监听被移除，`setup` 重新执行并注册新监听
      compiler.emit('mock:update-end', FILEPATH)

      client.send('hello')
      // 旧监听已被移除，消息只会被处理一次（未移除时会收到两次）
      await vi.waitFor(() => expect(received).toBe(1))

      // `ws` 内部维护 `wss.clients` 的监听没有被移除：客户端断开后集合回到空
      client.close()
      await vi.waitFor(() => expect(wssRef?.clients.size).toBe(0))
    })
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

    it('should match the rules loaded after an earlier connection', async () => {
      const setup = vi.fn()
      // 初次加载完成前 `mockData` 为空 / `mockData` is empty until the first load ends
      const mockData: Record<string, MockOptions> = {}
      const { port } = await start(mockData, { wsProxies: WS_PROXIES })

      // 此时没有任何规则，握手被直接拒绝（并非悬挂等待），
      // 同时也不会凭空命中缓存的空结果
      // No rule exists yet, the handshake is rejected right away instead of hanging,
      // and no cached empty result is hit
      await expect(connect(port, '/ws/lobby')).rejects.toThrow(/Unexpected server response: 404/)

      // 初次加载完成：mock 数据就绪，期间不派发任何热更新事件
      // The first load completes and the mock data becomes available, without any
      // hot-update event being dispatched
      mockData['/ws/lobby'] = [createMockItem(setup, '/ws/lobby')]

      await connect(port, '/ws/lobby')

      expect(setup).toHaveBeenCalledTimes(1)
    })

    it('should reject the upgrade when no rule matches the path', async () => {
      const setup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        '/ws/other': [createMockItem(setup, '/ws/other')],
      }
      const { port } = await start(mockData, { wsProxies: WS_PROXIES })

      // 命中 wsPrefix 但没有匹配的规则：握手被直接拒绝，客户端立即失败，
      // 服务端也不会残留连接（若只返回不响应，该连接会一直挂在 http 服务上，
      // 并且让 `server.close()` 永不回调）
      // The path matched a `wsPrefix` without a matching rule, so the handshake is
      // rejected right away and the client fails fast. Simply returning instead would
      // leave the connection on the http server forever and block `server.close()`
      await expect(connect(port, '/ws/lobby')).rejects.toThrow(/Unexpected server response: 404/)

      expect(setup).not.toHaveBeenCalled()
      await vi.waitFor(() => expect(connections.size).toBe(0))
    })

    it('should leave the vite hmr upgrade request to vite', async () => {
      const setup = vi.fn()
      const mockData: Record<string, MockOptions> = {
        '/ws/lobby': [createMockItem(setup, '/ws/lobby')],
      }
      const { port } = await start(mockData, { wsProxies: WS_PROXIES })

      // `vite-hmr` 子协议属于 vite 自身：即使路径能命中 mock 规则也不能被接管，
      // 否则 HMR 客户端会收到 mock 数据；而在没有规则的路径上放行，
      // 也保证了下方的「直接拒绝」不会切断 HMR 连接
      // The `vite-hmr` sub protocol belongs to vite itself: the request must not be taken
      // over even when its path matches a mock rule, otherwise the HMR client would
      // receive mock data. Leaving it alone in paths without a rule also makes sure the
      // rejection above never cuts the HMR connection
      const hmrClient = new WebSocket(`ws://127.0.0.1:${port}/ws/lobby`, 'vite-hmr')
      clients.push(hmrClient)

      // 普通连接仍然命中 mock，说明放行只针对 hmr 协议
      // A regular connection still matches the mock, the bypass only covers the hmr protocol
      await connect(port, '/ws/lobby')

      expect(setup).toHaveBeenCalledTimes(1)
      // 该请求没有被接管（始终没有握手响应），保留给 vite 的 upgrade 处理器
      // The request was not taken over (its handshake is never answered), it is left to
      // the upgrade handler of vite
      expect(hmrClient.readyState).toBe(WebSocket.CONNECTING)
    })

    it('should reject the handshake when a url pattern cannot be parsed', async () => {
      const setup = vi.fn()
      const errorLog = vi.fn()
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: errorLog,
      } as unknown as ResolvedMockServerPluginOptions['logger']
      const mockData: Record<string, MockOptions> = {
        // `path-to-regexp` 无法解析的规则（旧的 `:param?` 写法）。
        // 正常情况下会被 `processMockData` 丢弃，这里用于覆盖兜底分支
        // A pattern `path-to-regexp` cannot parse (the legacy `:param?` syntax).
        // `processMockData` usually drops such a rule, it is injected here on purpose
        // to cover the fallback branch
        '/ws/:room?': [createMockItem(setup, '/ws/:room?')],
        '/ws/:room': [createMockItem(setup, '/ws/:room')],
      }
      const { port } = await start(mockData, { wsProxies: WS_PROXIES, logger })

      // 排序失败时连接被拒绝：客户端收到服务端返回的错误响应后立即失败，
      // 而不是一直等待一个永远不会到来的握手响应
      // The connection is rejected when the sorting fails: the client fails right away
      // with the error response of the server, instead of waiting for a handshake
      // response that never comes
      await expect(connect(port, '/ws/lobby')).rejects.toThrow(/Unexpected server response: 500/)

      expect(setup).not.toHaveBeenCalled()
      expect(errorLog).toHaveBeenCalledTimes(1)
      expect(String(errorLog.mock.calls[0][0])).toContain('Invalid mock url pattern')
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
