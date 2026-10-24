/**
 * Handshake handling of the mock websocket server
 *
 * Mock WebSocket 服务的握手处理
 *
 * 一次 `upgrade` 请求依次经过：代理前缀检查 → vite HMR 放行 → 规则匹配 → 创建服务 →
 * 扩展请求 → 完成握手。
 *
 * An `upgrade` request goes through: proxy prefix check → vite HMR bypass → rule
 * matching → server acquisition → request extras → handshake completion.
 */

import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Compiler } from '../compiler/index.js'
import type { Logger } from '../core/index.js'
import type { MatchingWeightSorter } from '../core/matchingWeight.js'
import type { CookiesOption, MockMatchPriority } from '../types/index.js'
import type { WebSocketServerPool } from './pool.js'
import { Buffer } from 'node:buffer'
import { STATUS_CODES } from 'node:http'
import { attempt } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { doesProxyContextMatchUrl, urlParse } from '../utils/index.js'
import { emitConnection } from './listener.js'
import { findWebsocketMock } from './matcher.js'
import { createWebSocketRequest } from './request.js'

/**
 * vite 用于 HMR websocket 与其心跳探测的子协议
 */
const VITE_HMR_PROTOCOLS = ['vite-hmr', 'vite-ping']

/**
 * Options of `handleUpgradeRequest`
 *
 * `handleUpgradeRequest` 的选项
 */
export interface UpgradeHandlerOptions {
  /**
   * Compiler instance / 编译器实例
   */
  compiler: Compiler
  /**
   * Websocket server pool / websocket 服务池
   */
  pool: WebSocketServerPool
  /**
   * Logger instance / 日志实例
   */
  logger: Logger
  /**
   * Proxy prefixes of the websocket mock / websocket mock 的代理前缀
   */
  proxies: string[]
  /**
   * Active scene / 当前激活的场景
   */
  activeScene: string[]
  /**
   * Priority config / 优先级配置
   */
  priority: MockMatchPriority
  /**
   * Cookie options of the plugin / 插件的 cookie 配置
   */
  cookiesOptions: CookiesOption
  /**
   * Sorter with a cached result / 带排序结果缓存的排序器
   */
  sorter: MatchingWeightSorter
  /**
   * Records that a mock file provides the matched rule
   *
   * 记录提供命中规则的 mock 文件
   */
  onMatched: (filepath: string, mockUrl: string) => void
}

/**
 * 处理 websocket 升级请求
 *
 * 请求不属于 `wsPrefix` 时直接放行给其他 `upgrade` 处理器；
 * 命中 `wsPrefix` 后，无论能否匹配到 mock 规则都会给出明确的响应，
 * 不会让客户端一直等待握手。
 *
 * Handle a websocket upgrade request.
 *
 * A request outside of `wsPrefix` is left to the other `upgrade` handlers. Once it matches
 * `wsPrefix`, an explicit response is always given — whether a mock rule matches or not —
 * so the client never waits for a handshake that never comes.
 *
 * @param options - Handler options / 处理器选项
 * @param req - Upgrade request / 升级请求
 * @param socket - Socket of the request / 请求的 socket
 * @param head - First packet of the upgraded stream / 升级后数据流的首个数据包
 */
export function handleUpgradeRequest(
  {
    compiler,
    pool,
    logger,
    proxies,
    activeScene,
    priority,
    cookiesOptions,
    sorter,
    onMatched,
  }: UpgradeHandlerOptions,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
): void {
  const url = req.url ?? ''
  const { pathname, query, error: urlError } = urlParse(url)

  // 无法解析的 URL 不可能匹配到任何 ws mock，放行给 vite 自身的 upgrade 处理器。
  if (urlError) {
    logger.warn(
      `${ansis.yellow('Malformed websocket upgrade URL')} ${ansis.underline(url)}\n  ${urlError.message}`,
    )
    return
  }

  if (
    !pathname ||
    proxies.length === 0 ||
    !proxies.some((context) => doesProxyContextMatchUrl(context, url))
  ) {
    return
  }

  // vite 自身的 HMR / 心跳升级请求必须放行：它可能落在 `wsPrefix` 内，
  // 若被 mock 接管或拒绝，HMR 连接会被直接切断
  if (isViteHmrUpgrade(req)) {
    return
  }

  const [weightError, match] = attempt(findWebsocketMock, {
    mockData: compiler.mockData,
    pathname,
    activeScene,
    priority,
    sorter,
  })

  if (weightError) {
    logger.error(`${ansis.red(`Invalid mock url pattern at ${pathname}`)}\n  ${weightError}`)
    // 无法计算权重就无法判断该连接属于哪条规则，必须显式拒绝这次握手：
    // 让客户端立即失败，而不是一直等待一个永远不会到来的握手响应。
    // 异常也不会泄漏到 `upgrade` 事件（否则会变成未处理异常）。
    abortUpgrade(socket, 500, `Invalid mock url pattern at ${pathname}`)
    return
  }

  if (!match) {
    // 命中 wsPrefix 但没有任何可用的 websocket mock：必须显式回应并关闭连接。
    logger.debug(`No websocket mock matched ${pathname}, the upgrade is rejected`)
    abortUpgrade(socket, 404, `No websocket mock matched ${pathname}`)
    return
  }

  const { mockUrl, mock } = match
  const filepath = (mock as any).__filepath__

  onMatched(filepath, mockUrl)

  const wss = pool.acquire(mockUrl, pathname, mock, filepath)
  const request = createWebSocketRequest(req, { mockUrl, pathname, query, cookiesOptions })

  wss.handleUpgrade(request, socket, head, (ws) => {
    logger.info(
      `${ansis.magenta.bold('WebSocket')} ${ansis.green(
        url,
      )} connected ${ansis.dim(`(${filepath})`)}`,
      mock.log,
    )
    emitConnection(wss, pool.addConnection(wss, request, ws, mockUrl, pathname))
  })
}

/**
 * 该升级请求是否来自 vite 自身（HMR / 心跳探测）
 *
 * `wsPrefix` 可能与 vite HMR 的 websocket 路径重叠（如 `wsPrefix: ['/']`，
 * 或 `hmr.path` 嵌套在某个前缀内）。这类请求必须交给 vite 自己的 upgrade 处理器：
 * 接管它会把 mock 数据下发给 HMR 客户端，拒绝它则会直接切断 HMR 连接。
 *
 * 判定方式与 vite 自身的 upgrade 监听保持一致：`sec-websocket-protocol` 严格等于
 * `vite-hmr` / `vite-ping`。
 *
 * Whether the upgrade request belongs to vite itself (HMR / heartbeat probe).
 *
 * `wsPrefix` may overlap with the websocket path of the vite HMR client (such as
 * `wsPrefix: ['/']`, or an `hmr.path` nested in one of the prefixes). Such a request must
 * be left to the upgrade handler of vite: taking it over would send mock data to the HMR
 * client, while rejecting it would cut the HMR connection directly.
 *
 * The check is the same as the upgrade listener of vite: the `sec-websocket-protocol`
 * header is exactly `vite-hmr` / `vite-ping`.
 *
 * @param req - Upgrade request / 升级请求
 * @returns Whether the request belongs to vite / 是否属于 vite
 */
export function isViteHmrUpgrade(req: Pick<IncomingMessage, 'headers'>): boolean {
  const protocol = req.headers['sec-websocket-protocol']
  return typeof protocol === 'string' && VITE_HMR_PROTOCOLS.includes(protocol)
}

/**
 * 拒绝 websocket 升级请求
 *
 * 被拒绝的握手必须显式关闭连接。与开发服务不同，构建产物中的独立 mock server
 * 不存在其他的 `upgrade` 处理器，若不响应就直接返回，客户端会一直等待握手响应。
 * 响应按 `ws` 的 `abortHandshake()` 相同的结构写出，
 * 让客户端能以明确的状态码快速失败，而不是一直等待或被静默重置。
 *
 * Reject a websocket upgrade request.
 *
 * A rejected handshake must close the connection explicitly. Unlike the dev server, the
 * standalone mock server of the build output has no other `upgrade` handler, so simply
 * returning would leave the client waiting for a handshake response forever. The response
 * is written with the same structure as `abortHandshake()` of `ws`, letting the client
 * fail fast with an explicit status code instead of hanging or being silently reset.
 *
 * @param socket - Socket of the upgrade request / 升级请求的 socket
 * @param statusCode - HTTP status code / HTTP 状态码
 * @param message - Error message / 错误信息
 */
export function abortUpgrade(socket: Duplex, statusCode: number, message: string): void {
  const status = STATUS_CODES[statusCode] ?? ''
  const body = `${statusCode} ${status}: ${message}`
  // 写入失败（如客户端已经断开）时直接销毁，避免未处理的 error 事件
  socket.on('error', () => socket.destroy())
  socket.once('finish', () => socket.destroy())
  socket.end(
    [
      `HTTP/1.1 ${statusCode} ${status}`,
      'Connection: close',
      'Content-Type: text/plain',
      `Content-Length: ${Buffer.byteLength(body)}`,
      '',
      body,
    ].join('\r\n'),
  )
}
