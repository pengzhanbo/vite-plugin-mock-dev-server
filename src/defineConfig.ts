import type { MockHttpItem, MockOptions, MockWebsocketItem } from './types'
import { isArray } from './utils'

/**
 * mock config Type helper
 *
 * mock配置 类型帮助函数
 * @param config
 * @example
 * Mock Http Request
 * ```ts
 * export default defineMock({
 *   url: '/api/example',
 *   method: ['GET', 'POST'],
 *   body: { a: 1 },
 * })
 * ```
 * @example
 * Mock WebSocket
 * ```ts
 * export default defineMock({
 *   url: '/socket.io',
 *   ws: true,
 *   setup(wss) {
 *     wss.on('connection', (ws) => {
 *       ws.on('message', (rawData) => console.log(rawData))
 *       ws.send('data')
 *     })
 *   },
 * })
 * ```
 */
export function defineMock(config: MockHttpItem): MockHttpItem
export function defineMock(config: MockOptions): MockOptions
export function defineMock(config: MockWebsocketItem): MockWebsocketItem
export function defineMock(
  config: MockOptions | MockHttpItem | MockWebsocketItem,
): MockOptions | MockHttpItem | MockWebsocketItem {
  return config
}

/**
 * Return a custom defineMock function to support preprocessing of mock config.
 *
 * 返回一个自定义的 defineMock 函数，用于支持对 mock config 的预处理。
 * @param transformer preprocessing function
 * @example
 * ```ts
 * const definePostMock = createDefineMock((mock) => {
 *   mock.url = '/api/post/' + mock.url
 * })
 * export default definePostMock({
 *   url: 'list',
 *   body: [{ title: '1' }, { title: '2' }],
 * })
 * ```
 */
export function createDefineMock(
  transformer: (
    mock: MockHttpItem | MockWebsocketItem,
  ) => MockHttpItem | MockWebsocketItem | void,
): typeof defineMock {
  const define = (config: MockOptions | MockHttpItem | MockWebsocketItem) => {
    if (isArray(config)) {
      config = config.map((item) => transformer(item) || item)
    } else {
      config = transformer(config) || config
    }
    return config
  }
  return define as typeof defineMock
}
