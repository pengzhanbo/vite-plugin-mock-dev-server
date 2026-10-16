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
  /**
   * 移除 mock 在该连接上注册的监听的回调
   *
   * 连接关闭后这些监听随连接一起消失，因此会清空该列表：否则已关闭的连接
   * （连同其 socket）会被 mock 的清理列表持有，直到下一次热更新。
   */
  cleanupList: (() => void)[]
}

interface WSSContext {
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
}

/**
 * 在 mock 运行期间被跟踪的监听注册方法
 */
interface ListenerTarget {
  on: (event: string, listener: (...args: any[]) => void) => unknown
  once: (event: string, listener: (...args: any[]) => void) => unknown
  addListener: (event: string, listener: (...args: any[]) => void) => unknown
  off: (event: string, listener: (...args: any[]) => void) => unknown
}

const getWss = (wssMap: WSSMap, pathname: string): WebSocketServer => {
  let wss = wssMap.get(pathname)
  if (!wss) {
    wssMap.set(pathname, (wss = new WebSocketServer({ noServer: true })))
  }

  return wss
}

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
 * @param targets - Emitters whose registrations are tracked / 需要跟踪注册行为的 emitter
 * @param onCleanup - Saves the removal of a listener / 保存监听移除回调
 * @param register - Registers the listeners of the mock / 注册 mock 监听的执行函数
 */
function trackMockListeners(
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

const emitConnection = (wss: WebSocketServer, connection: Connection): void => {
  const { ws, req, cleanupList } = connection
  // 客户端连接上的监听由 mock 的 `connection` 处理函数注册，而它正是在本次 emit
  // 期间执行，因此这里同样需要跟踪；插件自身的监听（见 upgrade 处理器）与 `ws`
  // 内部的监听都在此之外注册，不会被跟踪。
  // 移除回调记录在连接自己的列表里，由上下文中登记的委托清理统一执行。
  trackMockListeners(
    [ws],
    (cleanup) => cleanupList.push(cleanup),
    () => wss.emit('connection', ws, req),
  )
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

  /**
   * 执行一组清理回调
   *
   * 清理回调抛出的异常会被记录，且不会中断其余清理与调用方：
   * mock 的资源应当尽可能被回收。
   *
   * @param cleanupList - Cleanups to run / 需要执行的清理列表
   * @param filepath - Path of the mock file / mock 文件路径
   */
  const drainCleanupList = (cleanupList: WSSContext['cleanupList'], filepath: string): void => {
    cleanupRunner(cleanupList, (error) => {
      logger.error(`${ansis.red(`WebSocket mock cleanup error at ${filepath}`)}\n${error}`)
    })
  }

  /**
   * 登记「移除各连接上 mock 注册的监听」的委托清理
   *
   * 这些监听记录在每条连接自己的列表中（连接关闭时列表会被清空，见 `emitConnection`），
   * 由这里登记的委托回调在热更新/删除 mock 时统一移除。
   * 清理列表会被消费，因此每次清理之后都需要重新登记。
   *
   * @param wssContext - Context of the websocket server / websocket 服务的上下文
   */
  const trackConnectionCleanups = (wssContext: WSSContext): void => {
    wssContext.context.onCleanup(() => {
      wssContext.connectionList.forEach((connection) => {
        drainCleanupList(connection.cleanupList, wssContext.filepath)
      })
    })
  }

  /**
   * 执行 mock 的清理
   *
   * 包括 `setup` / `onCleanup` 登记的清理，以及各连接上 mock 注册的监听的移除。
   * 抛错的清理会被记录且不会中断其余清理与调用方，
   * 因此热更新与删除 mock 文件时的后续步骤都会照常执行。
   *
   * @param wssContext - Context of the websocket server / websocket 服务的上下文
   */
  const runCleanup = (wssContext: WSSContext): void => {
    drainCleanupList(wssContext.cleanupList, wssContext.filepath)
    trackConnectionCleanups(wssContext)
  }

  const setupWss = (
    wss: WebSocketServer,
    mock: MockWebsocketItem,
    context: WebSocketSetupContext,
    filepath: string,
  ): void => {
    try {
      // `setup` 注册的监听会被记录（见 `trackMockListeners`），
      // 使热更新或删除 mock 文件时能够只移除这些监听
      trackMockListeners([wss], context.onCleanup, () => mock.setup?.(wss, context))
    } catch (e) {
      logger.error(
        `${ansis.red(`WebSocket mock error at ${wss.path}`)}\n${e}\n  at setup (${filepath})`,
        mock.log,
      )
    }
  }

  const restartWss = (
    wss: WebSocketServer,
    wssContext: WSSContext,
    mock: MockWebsocketItem,
    filepath: string,
  ): void => {
    const { connectionList, context } = wssContext
    // 本次更新所对应的 mock 从现在起提供 `setup`：同步记录归属者，
    // 以便删除该文件时可以回收这个 websocket 服务，错误日志也能指向正确的 mock 文件。
    wssContext.mock = mock
    wssContext.filepath = filepath
    // 重启/热更新时，需要重新执行 setup()，在执行前，需要清除旧的循环/自动任务/监听
    // 多个客户端 ws 连接，每个 ws连接都需要清除旧的监听，并手动触发一次 connection 监听
    //
    // 这里只执行 mock 的清理（含它注册的监听）：插件自身的监听与 `ws` 内部的监听
    // 会被保留，正是它们让已有连接在重启后继续可用。
    runCleanup(wssContext)

    setupWss(wss, mock, context, filepath)
    connectionList.forEach((connection) => emitConnection(wss, connection))
  }

  /**
   * 被删除的 mock 文件是这些服务 `setup` 的唯一来源：若保留它们，客户端会一直与
   * 已被删除的 mock 逻辑通信，直到开发服务停止。这里执行清理回调（含该 mock 注册的
   * 监听）、断开客户端、关闭服务并丢弃它们的连接池条目。
   *
   * 条目也必须丢弃：已关闭的服务无法复用（`handleUpgrade` 在非运行状态的服务上会失败），
   * 因此后续连接需要基于当时的 mock 数据重建服务 —— 这也正是该 mock 文件被重新创建后
   * 能够重新生效的原因。
   *
   * @param filepath - Path of the deleted mock file / 已删除的 mock 文件路径
   */
  const closeWssOfFile = (filepath: string): void => {
    for (const [mockUrl, wssMap] of poolMap) {
      for (const [pathname, wss] of [...wssMap]) {
        const wssContext = wssContextMap.get(wss)
        // 只回收 `setup` 来自该已删除文件的服务：归属其他 mock 文件的服务不受影响。
        if (wssContext?.filepath !== filepath) {
          continue
        }
        // 释放 `setup()` 注册的循环 / 定时器 / 监听。
        // 清理回调抛出的异常会被记录且不会中断后续步骤，因此无论单个清理是否出错，
        // 下方的断开客户端 / 关闭服务 / 丢弃连接池条目都会照常执行。
        runCleanup(wssContext)
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
        wss.close()
        wssContextMap.delete(wss)
        wssMap.delete(pathname)
      }
      if (wssMap.size === 0) {
        poolMap.delete(mockUrl)
      }
    }
  }

  // mock 数据热更新后，候选规则集合会变化，此前缓存的排序结果随之失效
  compiler.on?.('mock:update-end', sortMockUrls.clear)

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
        for (const wss of wssMap.values()) {
          const wssContext = wssContextMap.get(wss)
          if (!wssContext) {
            continue
          }
          restartWss(wss, wssContext, mock, filepath)
        }
        return
      }
    }
  })

  // mock 文件已被删除：移除其热更新记录，并回收它创建的 websocket 服务及其客户端
  compiler.on?.('mock:unlink', (filepath: string) => {
    hmrMap.delete(filepath)
    closeWssOfFile(filepath)
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
      const created: WSSContext = { cleanupList, context, connectionList: [], filepath, mock }
      wssContext = created
      wssContextMap.set(wss, created)

      // 插件自身的监听：每个 websocket 服务只注册一次，也不会被 mock 的清理移除
      // （它们不属于 mock）。`close` 监听用于在其他路径关闭服务时移除连接池条目，
      // 被删除 mock 的回收不依赖它 —— 那条路径由 `closeWssOfFile` 显式移除条目。
      wss.on('close', () => wssMap.delete(pathname))
      wss.on('error', (e) => {
        logger.error(
          `${ansis.red(`WebSocket mock error at ${wss.path}`)}\n${e}\n  at setup (${created.filepath})`,
          created.mock.log,
        )
      })

      trackConnectionCleanups(created)
      setupWss(wss, mock, context, filepath)
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
      const connection: Connection = { req: request, ws, cleanupList: [] }
      wssContext.connectionList.push(connection)

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
      })

      emitConnection(wss, connection)
    })
  })

  server?.on('close', () => {
    for (const wssMap of poolMap.values()) {
      for (const wss of wssMap.values()) {
        const wssContext = wssContextMap.get(wss)
        if (wssContext) {
          runCleanup(wssContext)
        }
        wss.close()
      }
      wssMap.clear()
    }
    poolMap.clear()
    hmrMap.clear()
  })
}

/**
 * 执行清理函数
 *
 * 每个清理回调相互隔离：它抛出的异常会通过 `onError` 上报，其余回调照常执行，
 * 避免一个错误的清理让 mock 的资源只被回收一半，或中断被删除 mock 文件的回收流程。
 *
 * @param cleanupList - Array of cleanup functions / 清理函数数组
 * @param onError - Reports the exception of a cleanup / 上报清理回调抛出的异常
 */
function cleanupRunner(
  cleanupList: WSSContext['cleanupList'],
  onError: (error: any) => void,
): void {
  let cleanup: (() => void) | undefined
  // eslint-disable-next-line no-cond-assign
  while ((cleanup = cleanupList.shift())) {
    try {
      cleanup?.()
    } catch (error) {
      onError(error)
    }
  }
}
