/**
 * Pool of the websocket servers created by the mock files
 *
 * Mock 文件创建的 websocket 服务池
 *
 * 每个实际请求路径都会创建一个 websocket 服务（动态规则如 `/ws/room/:id` 会为每个
 * `:id` 创建独立的服务），若不回收会随着开发过程不断累积 `WebSocketServer`、
 * `setup()` 注册的定时器与房间状态。
 *
 * 采用延时回收而不是「最后一个客户端断开即回收」，是为了让页面刷新、短暂断网重连
 * 等场景继续复用同一个服务，保留 mock 在 `setup()` 中维护的状态。
 *
 * Every request pathname gets its own websocket server (a dynamic rule such as
 * `/ws/room/:id` creates one per `:id`), they have to be recycled or they would keep
 * accumulating `WebSocketServer` instances, timers registered by `setup()` and room state
 * during development.
 *
 * Recycling is delayed instead of running as soon as the last client leaves, so that a
 * page reload or a short reconnect keeps reusing the same server and the state maintained
 * by the mock in `setup()`.
 */

import type { WebSocket } from 'ws'
import type { Logger } from '../core/index.js'
import type { MockRequest, MockWebsocketItem, WebSocketSetupContext } from '../types/index.js'
import type { Connection, PoolMap, WSSContext, WSSContextMap, WSSMap } from './types.js'
import { findFirstThen, remove } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { WebSocketServer } from 'ws'
import { clearIdleTimer, runCleanups } from './cleanup.js'
import { emitConnection, trackMockListeners } from './listener.js'

/**
 * 无客户端连接后保留 websocket 服务的时长（毫秒）
 *
 * How long a websocket server is kept after its last client left, in milliseconds.
 */
const WSS_IDLE_TIMEOUT = 60 * 1000

/**
 * Websocket server created by a mock file
 *
 * 某个 mock 文件创建的 websocket 服务
 */
export interface WSSEntry {
  /**
   * Key of the mock url / mock url 的键
   */
  mockUrl: string
  /**
   * Request pathname / 请求路径
   */
  pathname: string
  /**
   * Websocket server / websocket 服务
   */
  wss: WebSocketServer
  /**
   * Context of the websocket server / websocket 服务的上下文
   */
  wssContext: WSSContext
}

/**
 * Pool of the websocket servers
 *
 * websocket 服务池
 *
 * 负责 websocket 服务的创建、重启、回收与空闲回收，并保证 `setup()` 注册的资源
 * 在热更新、删除 mock 文件与开发服务关闭时都被释放。
 *
 * It creates, restarts and recycles the websocket servers, and makes sure the resources
 * registered by `setup()` are released on hot update, on mock file deletion and when the
 * dev server is closed.
 */
export class WebSocketServerPool {
  private readonly logger: Logger
  private readonly poolMap: PoolMap = new Map()
  private readonly wssContextMap: WSSContextMap = new WeakMap()

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 获取（必要时创建）某个请求路径的 websocket 服务
   *
   * 首次获取时会创建服务的上下文、注册插件自身的监听并执行 mock 的 `setup()`；
   * 之后的连接复用同一个服务，不会重复执行 `setup()`。
   *
   * Acquire the websocket server of a request path, creating it on first use.
   *
   * The first acquisition creates the context of the server, registers the listeners of
   * the plugin and runs `setup()` of the mock. Later connections reuse the same server
   * without running `setup()` again.
   *
   * @param mockUrl - Key of the mock url / mock url 的键
   * @param pathname - Request pathname / 请求路径
   * @param mock - Websocket mock item / websocket mock 配置项
   * @param filepath - Path of the mock file / mock 文件路径
   * @returns Websocket server / websocket 服务
   */
  acquire(
    mockUrl: string,
    pathname: string,
    mock: MockWebsocketItem,
    filepath: string,
  ): WebSocketServer {
    const wssMap = this.getWssMap(mockUrl)
    let wss = wssMap.get(pathname)
    if (!wss) {
      wss = new WebSocketServer({ noServer: true })
      wssMap.set(pathname, wss)
    }

    if (!this.wssContextMap.has(wss)) {
      this.createContext(wss, wssMap, pathname, mock, filepath)
    }

    return wss
  }

  /**
   * 跟踪新建立的客户端连接
   *
   * 新连接会取消可能在计时中的空闲回收，并在连接关闭后同步连接列表；
   * 最后一个客户端断开时会安排空闲回收。
   *
   * Track a newly established client connection.
   *
   * A new connection cancels a pending idle recycling and keeps the connection list in
   * sync once it is closed; the last client leaving schedules the idle recycling.
   *
   * @param wss - Websocket server / websocket 服务
   * @param req - Request of the connection / 连接的请求
   * @param ws - Client connection / 客户端连接
   * @param mockUrl - Key of the mock url / mock url 的键
   * @param pathname - Request pathname / 请求路径
   * @returns Tracked connection / 被跟踪的连接
   */
  addConnection(
    wss: WebSocketServer,
    req: MockRequest,
    ws: WebSocket,
    mockUrl: string,
    pathname: string,
  ): Connection {
    const connection: Connection = { req, ws, cleanupList: [] }
    const wssContext = this.wssContextMap.get(wss)
    // 服务必然由 `acquire()` 创建，这里的兜底只用于避免异常泄漏到 `upgrade` 事件
    if (!wssContext) {
      return connection
    }

    wssContext.connectionList.push(connection)

    // 有新连接建立：取消可能在计时中的空闲回收
    clearIdleTimer(wssContext)

    // 插件自身的监听：每条连接只注册一次，也不会被 mock 的清理移除
    // （它负责让 `connectionList` 保持同步）
    ws.on('close', () => {
      // 连接已关闭，mock 在其上注册的监听随连接一起消失：
      // 清空记录，避免已关闭的连接被清理列表持有
      connection.cleanupList.length = 0
      findFirstThen(
        wssContext.connectionList,
        (item) => item.ws === ws,
        (v) => remove(wssContext.connectionList, v),
      )
      // 最后一个客户端也断开了：空闲一段时间后回收该服务（见 `scheduleIdleRecycle`）。
      // 该实例可能已被回收、并由同路径的新服务接管（此时该上下文已不再登记在
      // `wssContextMap` 中），只有上下文仍属于这个实例时才安排回收，
      // 否则会把新服务当作旧服务回收
      if (wssContext.connectionList.length === 0 && this.wssContextMap.get(wss) === wssContext) {
        this.scheduleIdleRecycle(mockUrl, pathname, wss, wssContext)
      }
    })

    return connection
  }

  /**
   * 用最新的 mock 配置重启 websocket 服务
   *
   * 重启/热更新时需要重新执行 `setup()`，在执行前需要清除旧的循环/自动任务/监听；
   * 多个客户端连接中，每个连接都需要清除旧的监听，并手动触发一次 `connection` 监听。
   *
   * Restart a websocket server with the latest mock config.
   *
   * `setup()` has to run again on restart/hot update, after the old loops, automatic
   * tasks and listeners are cleared. For every connected client, the old listeners are
   * removed and the `connection` handler is dispatched once again.
   *
   * @param wss - Websocket server / websocket 服务
   * @param mock - Latest websocket mock item / 最新的 websocket mock 配置项
   * @param filepath - Path of the mock file / mock 文件路径
   */
  restart(wss: WebSocketServer, mock: MockWebsocketItem, filepath: string): void {
    const wssContext = this.wssContextMap.get(wss)
    if (!wssContext) {
      return
    }

    const { connectionList, context } = wssContext
    // 本次更新所对应的 mock 从现在起提供 `setup`：同步记录归属者，
    // 以便删除该文件时可以回收这个 websocket 服务，错误日志也能指向正确的 mock 文件。
    wssContext.mock = mock
    wssContext.filepath = filepath
    // 这里只执行 mock 的清理（含它注册的监听）：插件自身的监听与 `ws` 内部的监听
    // 会被保留，正是它们让已有连接在重启后继续可用。
    this.runCleanup(wssContext)

    this.setupWss(wss, mock, context, filepath)
    connectionList.forEach((connection) => emitConnection(wss, connection))
  }

  /**
   * 回收一个 websocket 服务
   *
   * 执行 mock 的清理回调（含其在各连接上注册的监听）、断开客户端、关闭服务，
   * 并丢弃连接池条目：已关闭的服务无法复用（`handleUpgrade` 在非运行状态的服务上会失败），
   * 后续连接会基于当时的 mock 数据重建服务。
   *
   * Recycle a websocket server.
   *
   * The cleanups of the mock (including the listeners it registered on the connections)
   * run, the clients are disconnected, the server is closed and the pool entry is dropped:
   * a closed server cannot be reused (`handleUpgrade` fails on a server that is not
   * running), later connections rebuild it from the mock data of that moment.
   *
   * @param mockUrl - Key of the mock url / mock url 的键
   * @param pathname - Request pathname / 请求路径
   * @param wss - Websocket server to recycle / 需要回收的 websocket 服务
   */
  recycle(mockUrl: string, pathname: string, wss: WebSocketServer): void {
    const wssContext = this.wssContextMap.get(wss)
    if (wssContext) {
      clearIdleTimer(wssContext)
      // 释放 `setup()` 注册的循环 / 定时器 / 监听。
      // 清理回调抛出的异常会被记录且不会中断后续步骤，因此无论单个清理是否出错，
      // 下方的断开客户端 / 关闭服务 / 丢弃连接池条目都会照常执行。
      this.runCleanup(wssContext)
      // mock 已不存在，因此断开客户端，而不是把它们留在逻辑已被删除的服务上
      // （状态码 1001：服务端离开）。
      wssContext.connectionList.forEach(({ ws }) => {
        // mock 的监听此时已被移除，而关闭连接仍可能在其上触发 `error`：
        // 保留一个兜底监听，避免回收过程变成未捕获异常
        if (ws.listenerCount('error') === 0) {
          ws.on('error', () => {})
        }
        ws.close(1001)
      })
      wssContext.connectionList.length = 0
    }

    wss.close()
    this.wssContextMap.delete(wss)

    // 只有 `pathname` 当前仍映射到该实例时才移除连接池条目：
    // 旧服务可能仍在关闭过程中，而同一路径已被新服务接管，
    // 此时删除条目会把新服务从连接池中移除
    const wssMap = this.poolMap.get(mockUrl)
    if (wssMap?.get(pathname) === wss) {
      wssMap.delete(pathname)
      if (wssMap.size === 0) {
        this.poolMap.delete(mockUrl)
      }
    }
  }

  /**
   * 收集由指定 mock 文件创建的 websocket 服务
   *
   * Collect the websocket servers created by the given mock file.
   *
   * @param filepath - Path of the mock file / mock 文件路径
   * @returns Services created by the mock file / 该文件创建的服务
   */
  collect(filepath: string): WSSEntry[] {
    const list: WSSEntry[] = []
    for (const [mockUrl, wssMap] of this.poolMap) {
      for (const [pathname, wss] of wssMap) {
        const wssContext = this.wssContextMap.get(wss)
        // 只处理 `setup` 来自该文件的服务：归属其他 mock 文件的服务不受影响。
        if (wssContext?.filepath === filepath) {
          list.push({ mockUrl, pathname, wss, wssContext })
        }
      }
    }
    return list
  }

  /**
   * 回收指定 mock 文件创建的全部 websocket 服务
   *
   * 被删除的 mock 文件是这些服务 `setup` 的唯一来源：若保留它们，客户端会一直与
   * 已被删除的 mock 逻辑通信，直到开发服务停止。
   *
   * Recycle every websocket server created by the given mock file.
   *
   * The deleted mock file is the only source of `setup` for these servers: keeping them
   * would let the clients keep talking to deleted mock logic until the dev server stops.
   *
   * @param filepath - Path of the deleted mock file / 已删除的 mock 文件路径
   */
  recycleFile(filepath: string): void {
    for (const { mockUrl, pathname, wss } of this.collect(filepath)) {
      this.recycle(mockUrl, pathname, wss)
    }
  }

  /**
   * 回收全部 websocket 服务
   *
   * 开发服务关闭时调用，释放所有 mock 注册的资源并关闭服务。
   *
   * Recycle every websocket server.
   *
   * Called when the dev server is closed, releasing every resource registered by the
   * mocks and closing the servers.
   */
  closeAll(): void {
    for (const wssMap of this.poolMap.values()) {
      for (const wss of wssMap.values()) {
        const wssContext = this.wssContextMap.get(wss)
        if (wssContext) {
          clearIdleTimer(wssContext)
          this.runCleanup(wssContext)
        }
        wss.close()
      }
      wssMap.clear()
    }
    this.poolMap.clear()
  }

  private getWssMap(mockUrl: string): WSSMap {
    let wssMap = this.poolMap.get(mockUrl)
    if (!wssMap) {
      this.poolMap.set(mockUrl, (wssMap = new Map()))
    }
    return wssMap
  }

  /**
   * 创建 websocket 服务的运行上下文
   *
   * 注册插件自身的监听（它们不会被 mock 的清理移除），并执行 mock 的 `setup()`。
   *
   * Create the runtime context of a websocket server.
   *
   * The listeners of the plugin are registered (they are never removed by the cleanups of
   * the mock), then `setup()` of the mock runs.
   *
   * @param wss - Websocket server / websocket 服务
   * @param wssMap - Servers of the mock url / 该 mock url 的服务映射
   * @param pathname - Request pathname / 请求路径
   * @param mock - Websocket mock item / websocket mock 配置项
   * @param filepath - Path of the mock file / mock 文件路径
   */
  private createContext(
    wss: WebSocketServer,
    wssMap: WSSMap,
    pathname: string,
    mock: MockWebsocketItem,
    filepath: string,
  ): void {
    const cleanupList: (() => void)[] = []
    const context: WebSocketSetupContext = {
      onCleanup: (cleanup) => cleanupList.push(cleanup),
    }
    const wssContext: WSSContext = { cleanupList, context, connectionList: [], filepath, mock }
    this.wssContextMap.set(wss, wssContext)

    // 插件自身的监听：每个 websocket 服务只注册一次，也不会被 mock 的清理移除
    // （它们不属于 mock）。`close` 监听用于在其他路径关闭服务时移除连接池条目，
    // 被删除 mock 的回收不依赖它 —— 那条路径由 `recycleFile` 显式移除条目。
    //
    // 服务关闭是异步的，期间同一路径可能已被新服务接管：
    // 只有 `pathname` 当前仍映射到该实例时才移除条目。
    wss.on('close', () => {
      if (wssMap.get(pathname) === wss) {
        wssMap.delete(pathname)
      }
    })
    wss.on('error', (e) => {
      this.logger.error(
        `${ansis.red(`WebSocket mock error at ${wss.path}`)}\n${e}\n  at setup (${wssContext.filepath})`,
        wssContext.mock.log,
      )
    })

    this.trackConnectionCleanups(wssContext)
    this.setupWss(wss, mock, context, filepath)
  }

  /**
   * 执行 mock 的 `setup()`
   *
   * `setup` 注册的监听会被记录（见 `trackMockListeners`），
   * 使热更新或删除 mock 文件时能够只移除这些监听。
   *
   * Run `setup()` of the mock.
   *
   * The listeners registered by `setup` are tracked (see `trackMockListeners`), so that
   * only these listeners are removed on hot update or mock file deletion.
   *
   * @param wss - Websocket server / websocket 服务
   * @param mock - Websocket mock item / websocket mock 配置项
   * @param context - Setup context of the mock / mock 的 setup 上下文
   * @param filepath - Path of the mock file / mock 文件路径
   */
  private setupWss(
    wss: WebSocketServer,
    mock: MockWebsocketItem,
    context: WebSocketSetupContext,
    filepath: string,
  ): void {
    try {
      trackMockListeners([wss], context.onCleanup, () => mock.setup?.(wss, context))
    } catch (e) {
      this.logger.error(
        `${ansis.red(`WebSocket mock error at ${wss.path}`)}\n${e}\n  at setup (${filepath})`,
        mock.log,
      )
    }
  }

  /**
   * 执行 mock 的清理
   *
   * 包括 `setup` / `onCleanup` 登记的清理，以及各连接上 mock 注册的监听的移除。
   * 抛错的清理会被记录且不会中断其余清理与调用方，
   * 因此热更新与删除 mock 文件时的后续步骤都会照常执行。
   *
   * Run the cleanups of the mock.
   *
   * It covers the cleanups registered through `setup` / `onCleanup`, and the removal of
   * the listeners the mock registered on each connection. A throwing cleanup is reported
   * without interrupting the remaining ones nor the caller, so the following steps of a
   * hot update or of a mock file deletion still run.
   *
   * @param wssContext - Context of the websocket server / websocket 服务的上下文
   */
  private runCleanup(wssContext: WSSContext): void {
    this.drainCleanups(wssContext.cleanupList, wssContext.filepath)
    this.trackConnectionCleanups(wssContext)
  }

  /**
   * 执行一组清理回调，并记录抛出的异常
   *
   * @param cleanupList - Cleanups to run / 需要执行的清理列表
   * @param filepath - Path of the mock file / mock 文件路径
   */
  private drainCleanups(cleanupList: WSSContext['cleanupList'], filepath: string): void {
    runCleanups(cleanupList, (error) => {
      this.logger.error(`${ansis.red(`WebSocket mock cleanup error at ${filepath}`)}\n${error}`)
    })
  }

  /**
   * 登记「移除各连接上 mock 注册的监听」的委托清理
   *
   * 这些监听记录在每条连接自己的列表中（连接关闭时列表会被清空，见 `addConnection`），
   * 由这里登记的委托回调在热更新/删除 mock 时统一移除。
   * 清理列表会被消费，因此每次清理之后都需要重新登记。
   *
   * Register the delegated cleanup that removes the listeners the mock registered on the
   * connections.
   *
   * These listeners are recorded on each connection (their list is cleared once the
   * connection is closed, see `addConnection`), and are removed together by the delegated
   * callback registered here on hot update / deletion. The cleanup list is consumed, so
   * the registration has to be renewed after every cleanup.
   *
   * @param wssContext - Context of the websocket server / websocket 服务的上下文
   */
  private trackConnectionCleanups(wssContext: WSSContext): void {
    wssContext.context.onCleanup(() => {
      wssContext.connectionList.forEach((connection) => {
        this.drainCleanups(connection.cleanupList, wssContext.filepath)
      })
    })
  }

  /**
   * 在最后一个客户端断开后安排空闲回收
   *
   * 每个实际请求路径都会创建一个 websocket 服务，动态规则（如 `/ws/room/:id`）
   * 会为每个 `:id` 创建独立服务。空闲一段时间后回收它们，避免长时间开发时
   * `WebSocketServer`、`setup()` 注册的定时器与房间状态无限累积；
   * 后续连接会重建服务并重新执行 `setup()`。
   *
   * Schedule the idle recycling once the last client left.
   *
   * Every request pathname gets its own websocket server, and a dynamic rule (such as
   * `/ws/room/:id`) creates one per `:id`. They are recycled after an idle period, so that
   * `WebSocketServer` instances, the timers registered by `setup()` and room state do not
   * accumulate forever during a long development session; later connections rebuild the
   * server and run `setup()` again.
   *
   * @param mockUrl - Key of the mock url / mock url 的键
   * @param pathname - Request pathname / 请求路径
   * @param wss - Websocket server / websocket 服务
   * @param wssContext - Context of the websocket server / websocket 服务的上下文
   */
  private scheduleIdleRecycle(
    mockUrl: string,
    pathname: string,
    wss: WebSocketServer,
    wssContext: WSSContext,
  ): void {
    clearIdleTimer(wssContext)
    const timer = setTimeout(() => {
      wssContext.idleTimer = undefined
      // 计时期间可能建立了新连接：插件的 close 监听不会重复调度，这里再校验一次
      if (wssContext.connectionList.length > 0 || wss.clients.size > 0) {
        return
      }
      this.recycle(mockUrl, pathname, wss)
    }, WSS_IDLE_TIMEOUT)
    // 定时器不应成为阻止进程退出 / 测试结束的句柄
    ;(timer as { unref?: () => void }).unref?.()
    wssContext.idleTimer = timer
  }
}
