import type { WebSocketServer } from 'ws'
import type { MockBaseItem } from './basicConfig'

export interface MockWebsocketItem extends MockBaseItem {
  ws: true
  /**
   * Configure Websocket Server
   *
   * 配置 Websocket Server
   * @example
   * ```ts
   * export default {
   *   ws: true
   *   setup: (wss, { onCleanup }) => {
   *     wss.on('connection', (ws,req) => {
   *       ws.on('message', (raw) => console.log(raw))
   *       const timer = setInterval(
   *         () => ws.send(JSON.stringify({ type: 'connected' })),
   *         1000,
   *       )
   *       onCleanup(() => clearInterval(timer))
   *     })
   *     wss.on('error', (error) => console.error(error))
   *   }
   * }
   * ```
   */
  setup: (wss: WebSocketServer, context: WebSocketSetupContext) => void
}

export interface WebSocketSetupContext {
  /**
   * When defining WSS, you may perform some automatic or looping tasks.
   * However, when hot updating, the plugin will re-execute `setup()`,
   * which may result in duplicate registration of listening events and looping tasks
   * such as setTimeout. You can use `onCleanup()` to clear these automatic or looping tasks.
   *
   * 当你在定义 WSS 时，可能会执行一些自动任务或循环任务，
   * 但是当热更新时，插件内部会重新执行 setup() ，
   * 这可能导致出现 重复注册监听事件 和 循环任务如 `setTimeout` 等。
   * 通过 `onCleanup()` 可以来清除这些自动任务或循环任务。
   * @example
   * ``` ts
   * onCleanup(() => clearTimeout(timeId))
   * ```
   */
  onCleanup: (cleanup: () => void) => void
}
