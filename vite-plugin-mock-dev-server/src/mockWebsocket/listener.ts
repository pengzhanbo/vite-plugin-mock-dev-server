/**
 * Listener tracking of the mock websocket server
 *
 * Mock WebSocket 服务的监听跟踪
 *
 * 热更新或删除 mock 文件时，需要精确移除 mock 注册的监听，
 * 而不能影响插件自身与 `ws` 内部的监听。
 *
 * When a mock file is hot updated or deleted, only the listeners registered by the mock
 * may be removed: the listeners of the plugin and the internal ones of `ws` must stay.
 */
import type { WebSocketServer } from 'ws'
import type { Connection, ListenerTarget } from './types.js'

/**
 * Replace a listener registration method of an emitter with a tracking version
 *
 * 用一个带跟踪能力的版本替换 emitter 的监听注册方法
 *
 * @param target - Emitter whose method is replaced / 需要替换方法的 emitter
 * @param method - Registration method to track / 需要跟踪的注册方法
 * @param onCleanup - Saves the removal of a listener / 保存监听移除回调
 * @returns Restores the original method / 还原原方法的回调
 */
function trackListenerMethod(
  target: ListenerTarget,
  method: keyof ListenerTarget,
  onCleanup: (cleanup: () => void) => void,
): () => void {
  const original = target[method]
  const hadOwn = Object.prototype.hasOwnProperty.call(target, method)

  const trackedListener = (event: string, listener: (...args: any[]) => void): unknown => {
    onCleanup(() => {
      target.off(event, listener)
    })
    return original.call(target, event, listener)
  }

  // 临时覆盖原型方法（由返回的回调在窗口结束后还原）：
  // 期间发生的注册都会把「移除该监听」登记为 mock 的清理
  target[method] = trackedListener as ListenerTarget['on']

  return function restore(): void {
    if (hadOwn) {
      target[method] = original
    } else {
      delete (target as Partial<ListenerTarget>)[method]
    }
  }
}

/**
 * 跟踪 mock 注册的监听
 *
 * 热更新或删除 mock 文件时，只应移除其 `setup`（websocket 服务上）与
 * `connection` 处理函数（客户端连接上）注册的监听 —— 插件自身的监听
 * （同步 `connectionList`）与 `ws` 内部的监听（维护 `wss.clients`）必须保留。
 * `removeAllListeners()` 无法区分它们，因此在 `register()` 执行期间发生的每次注册
 * 都会被记录，其移除操作通过 `onCleanup` 保存，与 mock 的其他清理一起执行。
 *
 * Track the listeners registered by a mock.
 *
 * Only the listeners registered while `register()` runs (from `setup()` on the websocket
 * server, or from the `connection` handler on a client connection) may be removed later,
 * the listeners of the plugin and the internal ones of `ws` must be kept, which
 * `removeAllListeners()` cannot distinguish. So every registration happening inside
 * `register()` is recorded, and its removal is saved through `onCleanup` to run together
 * with the other cleanups of the mock.
 *
 * @param targets - Emitters whose registrations are tracked / 需要跟踪注册行为的 emitter
 * @param onCleanup - Saves the removal of a listener / 保存监听移除回调
 * @param register - Registers the listeners of the mock / 注册 mock 监听的执行函数
 */
export function trackMockListeners(
  targets: ListenerTarget[],
  onCleanup: (cleanup: () => void) => void,
  register: () => void,
): void {
  const methods: (keyof ListenerTarget)[] = ['on', 'once', 'addListener']
  const restores: (() => void)[] = []

  for (const target of targets) {
    for (const method of methods) {
      restores.push(trackListenerMethod(target, method, onCleanup))
    }
  }

  try {
    register()
  } finally {
    for (const restore of restores) {
      restore()
    }
  }
}

/**
 * 向已有连接重新派发一次 `connection` 事件
 *
 * 客户端连接上的监听由 mock 的 `connection` 处理函数注册，而它正是在本次 emit
 * 期间执行，因此这里同样需要跟踪；插件自身的监听（见 `upgrade` 处理器）与 `ws`
 * 内部的监听都在此之外注册，不会被跟踪。
 * 移除回调记录在连接自己的列表里，由上下文中登记的委托清理统一执行。
 *
 * Dispatch the `connection` event again for an existing connection.
 *
 * The listeners on a client connection are registered by the `connection` handler of the
 * mock, which runs during this emit, so they have to be tracked as well. The listeners of
 * the plugin and the internal ones of `ws` are registered outside of it and are left
 * alone. The removals are recorded on the connection itself, and are executed by the
 * delegated cleanup registered on the context.
 *
 * @param wss - Websocket server / websocket 服务
 * @param connection - Connection to dispatch / 需要派发的连接
 */
export function emitConnection(wss: WebSocketServer, connection: Connection): void {
  const { ws, req, cleanupList } = connection
  trackMockListeners(
    [ws],
    (cleanup) => cleanupList.push(cleanup),
    () => wss.emit('connection', ws, req),
  )
}
