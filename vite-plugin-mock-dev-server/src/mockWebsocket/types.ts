/**
 * Internal types of the mock websocket server
 *
 * Mock WebSocket 服务的内部类型
 *
 * 这些类型只在 `mockWebsocket` 目录内部使用，不属于插件的公开 API。
 *
 * These types are only used inside the `mockWebsocket` directory and are not part
 * of the public API of the plugin.
 */
import type { WebSocket, WebSocketServer } from 'ws'
import type { MockRequest, MockWebsocketItem, WebSocketSetupContext } from '../types/index.js'

/**
 * Websocket servers grouped by mock url
 *
 * 按 mock url 分组的 websocket 服务映射
 */
export type PoolMap = Map<string, WSSMap>

/**
 * Websocket servers grouped by request pathname
 *
 * 按请求路径分组的 websocket 服务映射
 */
export type WSSMap = Map<string, WebSocketServer>

/**
 * Contexts of the websocket servers
 *
 * websocket 服务到其运行上下文的映射
 */
export type WSSContextMap = WeakMap<WebSocketServer, WSSContext>

/**
 * A client connection of a websocket server
 *
 * websocket 服务的一条客户端连接
 */
export interface Connection {
  req: MockRequest
  ws: WebSocket
  /**
   * 移除 mock 在该连接上注册的监听的回调
   *
   * 连接关闭后这些监听随连接一起消失，因此会清空该列表：否则已关闭的连接
   * （连同其 socket）会被 mock 的清理列表持有，直到下一次热更新。
   */
  cleanupList: (() => void)[]
}

/**
 * Runtime context of a websocket server
 *
 * websocket 服务的运行上下文
 *
 * 记录 mock 注册的清理、客户端连接与创建该服务的 mock 文件，
 * 回收与热更新时依赖它区分「哪些内容属于 mock」。
 *
 * It records the cleanups registered by the mock, the client connections and the mock
 * file that created the server; recycling and hot updates rely on it to tell which parts
 * belong to the mock.
 */
export interface WSSContext {
  cleanupList: (() => void)[]
  context: WebSocketSetupContext
  connectionList: Connection[]
  /**
   * 创建该 websocket 服务的 mock 文件路径（即提供 `setup` 的文件）
   */
  filepath: string
  /**
   * 当前为该 websocket 服务提供 `setup` 的 mock 配置
   */
  mock: MockWebsocketItem
  /**
   * 空闲回收定时器：最后一个客户端断开后开始计时，期间有新连接则取消
   */
  idleTimer?: ReturnType<typeof setTimeout>
}

/**
 * 在 mock 运行期间被跟踪的监听注册方法
 */
export interface ListenerTarget {
  on: (event: string, listener: (...args: any[]) => void) => unknown
  once: (event: string, listener: (...args: any[]) => void) => unknown
  addListener: (event: string, listener: (...args: any[]) => void) => unknown
  off: (event: string, listener: (...args: any[]) => void) => unknown
}
