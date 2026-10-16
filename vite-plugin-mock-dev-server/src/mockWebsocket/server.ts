// oxlint-disable max-lines-per-function
/**
 * The reason for not reusing the websocket proxy in `viteConfig.server.proxy` is that
 * it is difficult to check in a satisfactory way whether there are websocket-related
 * mock configurations in the mock files, comparing them with those used in `server.proxy`,
 * and removing them from `viteConfig.server.proxy`.
 *
 * Due to uncertainty about the scale of mock files, parsing all mock files to find
 * corresponding path matching rules and then modifying `viteConfig` would add time overhead
 * to the vite dev server startup, which goes against the expectations of vite and the plugin.
 *
 * Moreover, if newly added mock files contain other rules that require modifying `viteConfig`,
 * causing the vite server to restart, this is not a suitable solution and is difficult
 * to align with user expectations.
 *
 * A more appropriate solution is to provide the `wsPrefix` configuration option for users
 * to customize, and ensure that items in `wsPrefix` do not exist in `server.proxy` to avoid
 * conflicts between vite's internal http-proxy ws and the plugin's ws.
 *
 * 不复用 `viteConfig.server.proxy` 中 websocket proxy的原因是，
 * 很难通过一种令人满意的方式，检查 mock 文件中是否有 websocket 相关的 mock 配置，
 * 对比 `server.proxy` 中被使用的，并从 `viteConfig.server.proxy` 中删除。
 * 由于不确定 mock 文件的规模，解析所有mock文件后找出相对应的路径匹配规则再修改 `viteConfig`，
 * 这个链路的时间开销，已经影响了 vite 开发服务的启动时间，这有违 vite 和插件的预期。
 * 且如果 新增的 mock 文件中 又有其他的规则需要再次 修改 `viteConfig` 导致 vite 服务重启，
 * 这其实并不是一个合适的处理方案，很难符合用户的预期。
 * 比较合适的方案还是提供 `wsPrefix` 配置项给用户自定义，并由用户确保 `wsPrefix` 中的项不存在
 * 于 `server.proxy` 中，避免 vite 内的 http-proxy ws 与 插件的 ws 的冲突。
 */

import type { IncomingHttpHeaders, Server } from 'node:http'
import type { Http2SecureServer } from 'node:http2'
import type { Duplex } from 'node:stream'
import type { WebSocket } from 'ws'
import type { Compiler } from '../compiler/index.js'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import type { MockRequest, MockWebsocketItem, WebSocketSetupContext } from '../types/index.js'
import { STATUS_CODES } from 'node:http'
import { attempt, findFirstThen, objectKeys, remove, toArray } from '@pengzhanbo/utils'
import ansis from 'ansis'
import Cookies from 'cookies'
import { WebSocketServer } from 'ws'
import { createMatchingWeightSorter, parseRequestParams } from '../mockHttp/index.js'
import { doesProxyContextMatchUrl, isPathMatch, matchScene, urlParse } from '../utils/index.js'

type PoolMap = Map<string, WSSMap>
type WSSMap = Map<string, WebSocketServer>
type WSSContextMap = WeakMap<WebSocketServer, WSSContext>

/**
 * vite 用于 HMR websocket 与其心跳探测的子协议
 */
const VITE_HMR_PROTOCOLS = ['vite-hmr', 'vite-ping']

interface Connection {
  req: MockRequest
  ws: WebSocket
}

interface WSSContext {
  cleanupList: (() => void)[]
  context: WebSocketSetupContext
  connectionList: Connection[]
}

const getWss = (wssMap: WSSMap, pathname: string): WebSocketServer => {
  let wss = wssMap.get(pathname)
  if (!wss) {
    wssMap.set(pathname, (wss = new WebSocketServer({ noServer: true })))
  }

  return wss
}

const emitConnection = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: MockRequest,
  connectionList: Connection[],
): void => {
  wss.emit('connection', ws, req)
  ws.on('close', () => {
    findFirstThen(
      connectionList,
      (item) => item.ws === ws,
      (v) => remove(connectionList, v),
    )
  })
}

/**
 * 该升级请求是否来自 vite 自身（HMR / 心跳探测）
 *
 * `wsPrefix` 可能与 vite HMR 的 websocket 路径重叠（如 `wsPrefix: ['/']`，
 * 或 `hmr.path` 嵌套在某个前缀内）。这类请求必须交给 vite 自己的 upgrade 处理器：
 * 接管它会把 mock 数据下发给 HMR 客户端，拒绝它则会直接切断 HMR 连接。

 * 判定方式与 vite 自身的 upgrade 监听保持一致：`sec-websocket-protocol` 严格等于
 * `vite-hmr` / `vite-ping`。
 *
 * @param req - Upgrade request / 升级请求
 * @returns Whether the request belongs to vite / 是否属于 vite
 */
function isViteHmrUpgrade(req: { headers: IncomingHttpHeaders }): boolean {
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
 * @param socket - Socket of the upgrade request / 升级请求的 socket
 * @param statusCode - HTTP status code / HTTP 状态码
 * @param message - Error message / 错误信息
 */
function abortUpgrade(socket: Duplex, statusCode: number, message: string): void {
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

/**
 * Mock WebSocket server
 *
 * Mock WebSocket 服务器
 *
 * @param compiler - Compiler instance / 编译器实例
 * @param server - HTTP server instance / HTTP 服务器实例
 * @param options - Resolved plugin options / 解析后的插件配置
 */
export function mockWebSocket(
  compiler: Compiler,
  server: Server | Http2SecureServer | null,
  {
    wsProxies: proxies,
    cookiesOptions,
    logger,
    activeScene,
    priority,
  }: ResolvedMockServerPluginOptions,
): void {
  // Hot update file mapping
  // 热更新文件映射
  const hmrMap = new Map<string, Set<string>>()
  // Connection pool
  // 连接池
  const poolMap: PoolMap = new Map()
  const wssContextMap: WSSContextMap = new WeakMap()

  /**
   * 候选规则的权重排序器
   *
   * 与 HTTP 侧保持一致的匹配优先级（静态规则优先于动态规则等），
   * 避免命中多条规则时，匹配结果取决于 `mockData` 的键插入顺序（即 mock 文件的加载顺序）。
   * 排序结果以 pathname 为键缓存，mock 数据热更新后需要清空缓存；
   * 空结果不会被缓存，因此初次加载完成前建立的连接留下的空结果，
   * 不会影响加载完成后建立的连接（不依赖 `mock:update-end` 清空）。
   */
  const sortMockUrls = createMatchingWeightSorter()

  const getWssMap = (mockUrl: string): WSSMap => {
    let wssMap = poolMap.get(mockUrl)
    if (!wssMap) {
      poolMap.set(mockUrl, (wssMap = new Map()))
    }

    return wssMap
  }

  const addHmr = (filepath: string, mockUrl: string): void => {
    let urlList = hmrMap.get(filepath)
    if (!urlList) {
      hmrMap.set(filepath, (urlList = new Set()))
    }
    urlList.add(mockUrl)
  }

  const setupWss = (
    wssMap: WSSMap,
    wss: WebSocketServer,
    mock: MockWebsocketItem,
    context: WebSocketSetupContext,
    pathname: string,
    filepath: string,
  ): void => {
    try {
      mock.setup?.(wss, context)
      wss.on('close', () => wssMap.delete(pathname))
      wss.on('error', (e) => {
        logger.error(
          `${ansis.red(`WebSocket mock error at ${wss.path}`)}\n${e}\n  at setup (${filepath})`,
          mock.log,
        )
      })
    } catch (e) {
      logger.error(
        `${ansis.red(`WebSocket mock error at ${wss.path}`)}\n${e}\n  at setup (${filepath})`,
        mock.log,
      )
    }
  }

  const restartWss = (
    wssMap: WSSMap,
    wss: WebSocketServer,
    mock: MockWebsocketItem,
    pathname: string,
    filepath: string,
  ): void => {
    const { cleanupList, connectionList, context } = wssContextMap.get(wss)!
    // During restart/hot update, need to re-execute setup(). Before execution,
    // need to clear old loops/auto tasks/listeners
    // For multiple client ws connections, each ws connection needs to clear old listeners
    // and manually trigger a connection listener
    // 重启/热更新时，需要重新执行 setup()，在执行前，需要清除旧的循环/自动任务/监听
    // 多个客户端 ws 连接，每个 ws连接都需要清除旧的监听，并手动触发一次 connection 监听
    cleanupRunner(cleanupList)
    connectionList.forEach(({ ws }) => ws.removeAllListeners())
    wss.removeAllListeners()

    setupWss(wssMap, wss, mock, context, pathname, filepath)
    connectionList.forEach(({ ws, req }) => emitConnection(wss, ws, req, connectionList))
  }

  // mock 数据热更新后，候选规则集合会变化，此前缓存的排序结果随之失效
  // After mock data is hot-reloaded the candidate rules change and the cached
  // sorted results become stale
  compiler.on?.('mock:update-end', sortMockUrls.clear)

  // Detect ws-related mock file updates
  // If the current ws configuration has established a wss connection, restart that wss connection
  // 检测 ws 相关的 mock 文件更新
  // 如果当前的 ws 配置已建立 wss 连接，则重启该 wss 连接
  compiler.on?.('mock:update-end', (filepath: string) => {
    const mockUrlList = hmrMap.get(filepath)
    if (!mockUrlList) {
      return
    }
    for (const mockUrl of mockUrlList) {
      if (!compiler.mockData[mockUrl]) {
        mockUrlList.delete(mockUrl)
      }
    }
    if (mockUrlList.size === 0) {
      hmrMap.delete(filepath)
      return
    }

    for (const mockUrl of mockUrlList) {
      for (const mock of compiler.mockData[mockUrl]) {
        if (!mock.ws || (mock as any).__filepath__ !== filepath) {
          continue
        }
        const wssMap = getWssMap(mockUrl)
        for (const [pathname, wss] of wssMap.entries()) {
          restartWss(wssMap, wss, mock, pathname, filepath)
        }
        return
      }
    }
  })

  // The mock file has been deleted, remove its hot-update record
  // mock 文件已被删除，移除其热更新记录
  compiler.on?.('mock:unlink', (filepath: string) => {
    hmrMap.delete(filepath)
  })

  const effectActiveScene = toArray(activeScene)
  server?.on('upgrade', (req, socket, head) => {
    const { pathname, query } = urlParse(req.url)
    if (
      !pathname ||
      proxies.length === 0 ||
      !proxies.some((context) => doesProxyContextMatchUrl(context, req.url))
    ) {
      return
    }

    // vite 自身的 HMR / 心跳升级请求必须放行：它可能落在 `wsPrefix` 内，
    // 若被 mock 接管或拒绝，HMR 连接会被直接切断
    if (isViteHmrUpgrade(req)) {
      return
    }

    const mockData = compiler.mockData
    // 与 HTTP 侧一致，对命中当前请求的规则按匹配权重从高到低排序，
    // 再依次查找首个可用的 websocket mock 配置，
    // 命中多条规则时不再依赖 `mockData` 的键插入顺序（即 mock 文件的加载顺序）
    const [weightError, mockUrls] = attempt(sortMockUrls, objectKeys(mockData), pathname, priority)
    if (weightError) {
      logger.error(`${ansis.red(`Invalid mock url pattern at ${pathname}`)}\n  ${weightError}`)
      // 无法计算权重就无法判断该连接属于哪条规则，必须显式拒绝这次握手：
      // 让客户端立即失败，而不是一直等待一个永远不会到来的握手响应。
      // 异常也不会泄漏到 `upgrade` 事件（否则会变成未处理异常）。
      abortUpgrade(socket, 500, `Invalid mock url pattern at ${pathname}`)
      return
    }

    let mockUrl: string | undefined
    let mock: MockWebsocketItem | undefined

    // 仅命中首个可用的 websocket mock 配置，与 HTTP 侧保持一致
    // Only the first available websocket mock matches, consistent with the HTTP side
    for (const candidate of mockUrls) {
      const found = mockData[candidate].find(
        (item) =>
          item.url &&
          item.ws &&
          matchScene(effectActiveScene, item.scene) &&
          isPathMatch(item.url, pathname),
      )
      if (found) {
        mockUrl = candidate
        mock = found as MockWebsocketItem
        break
      }
    }

    if (!mock || !mockUrl) {
      // 命中 wsPrefix 但没有任何可用的 websocket mock：必须显式回应并关闭连接。
      logger.debug(`No websocket mock matched ${pathname}, the upgrade is rejected`)
      abortUpgrade(socket, 404, `No websocket mock matched ${pathname}`)
      return
    }

    const filepath = (mock as any).__filepath__

    addHmr(filepath, mockUrl)

    const wssMap = getWssMap(mockUrl)
    const wss = getWss(wssMap, pathname)

    let wssContext = wssContextMap.get(wss)!
    if (!wssContext) {
      const cleanupList: (() => void)[] = []
      const context: WebSocketSetupContext = {
        onCleanup: (cleanup) => cleanupList.push(cleanup),
      }
      wssContext = { cleanupList, context, connectionList: [] }
      wssContextMap.set(wss, wssContext)

      setupWss(wssMap, wss, mock, context, pathname, filepath)
    }

    const request = req as MockRequest
    const cookies = new Cookies(req, req, cookiesOptions)
    const { query: refererQuery } = urlParse(req.headers.referer ?? '')

    request.query = query
    request.refererQuery = refererQuery
    request.params = parseRequestParams(mockUrl, pathname)
    request.getCookie = cookies.get.bind(cookies)

    wss.handleUpgrade(request, socket, head, (ws) => {
      logger.info(
        `${ansis.magenta.bold('WebSocket')} ${ansis.green(
          req.url,
        )} connected ${ansis.dim(`(${filepath})`)}`,
        mock.log,
      )
      wssContext.connectionList.push({ req: request, ws })

      emitConnection(wss, ws, request, wssContext.connectionList)
    })
  })

  server?.on('close', () => {
    for (const wssMap of poolMap.values()) {
      for (const wss of wssMap.values()) {
        const wssContext = wssContextMap.get(wss)!
        cleanupRunner(wssContext.cleanupList)
        wss.close()
      }
      wssMap.clear()
    }
    poolMap.clear()
    hmrMap.clear()
  })
}

/**
 * Run cleanup functions
 *
 * 执行清理函数
 *
 * @param cleanupList - Array of cleanup functions / 清理函数数组
 */
function cleanupRunner(cleanupList: WSSContext['cleanupList']): void {
  let cleanup: (() => void) | undefined
  // eslint-disable-next-line no-cond-assign
  while ((cleanup = cleanupList.shift())) {
    cleanup?.()
  }
}
