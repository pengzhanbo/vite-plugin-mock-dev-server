import type http from 'node:http'
import { parse as parseUrl } from 'node:url'
import Cookies from 'cookies'
import { pathToRegexp } from 'path-to-regexp'
import colors from 'picocolors'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import type { MockLoader } from './MockLoader'
import type {
  MockRequest,
  MockServerPluginOptions,
  MockWebsocketItem,
  WebSocketSetupContext,
} from './types'
import { debug, doesProxyContextMatchUrl, log, parseParams } from './utils'

type PoolMap = Map<string, WSSMap>
type WSSMap = Map<string, WebSocketServer>
type WSSContextMap = WeakMap<WebSocketServer, WSSContext>

interface Connection {
  req: MockRequest
  ws: WebSocket
}

interface WSSContext {
  cleanupList: (() => void)[]
  context: WebSocketSetupContext
  connectionList: Connection[]
}

export function mockWebSocket(
  loader: MockLoader,
  httpServer: http.Server | null,
  proxies: string[],
  cookiesOptions: MockServerPluginOptions['cookiesOptions'],
) {
  const hmrMap = new Map<string, Set<string>>()
  const poolMap: PoolMap = new Map()
  const wssContextMap: WSSContextMap = new WeakMap()

  const getWssMap = (mockUrl: string): WSSMap => {
    let wssMap = poolMap.get(mockUrl)
    !wssMap && poolMap.set(mockUrl, (wssMap = new Map()))
    return wssMap
  }

  const getWss = (wssMap: WSSMap, pathname: string): WebSocketServer => {
    let wss = wssMap.get(pathname)
    !wss &&
      wssMap.set(pathname, (wss = new WebSocketServer({ noServer: true })))
    return wss
  }

  const addHmr = (filepath: string, mockUrl: string) => {
    let urlList = hmrMap.get(filepath)
    !urlList && hmrMap.set(filepath, (urlList = new Set()))
    urlList.add(mockUrl)
  }

  const setupWss = (
    wssMap: WSSMap,
    wss: WebSocketServer,
    mock: MockWebsocketItem,
    context: WebSocketSetupContext,
    pathname: string,
    filepath: string,
  ) => {
    try {
      mock.setup?.(wss, context)
      wss.on('close', () => {
        wssMap.delete(pathname)
      })
    } catch (e) {
      log.error(`${colors.red('[websocket server error]')} ${filepath}\n`, e)
    }
  }

  const emitConnection = (
    wss: WebSocketServer,
    ws: WebSocket,
    req: MockRequest,
    connectionList: Connection[],
  ) => {
    wss.emit('connection', ws, req)
    ws.on('close', () => {
      const i = connectionList.findIndex((item) => item.ws === ws)
      if (i !== -1) connectionList.splice(i, 1)
    })
  }

  const restartWss = (
    wssMap: WSSMap,
    wss: WebSocketServer,
    mock: MockWebsocketItem,
    pathname: string,
    filepath: string,
  ) => {
    const { cleanupList, connectionList, context } = wssContextMap.get(wss)!
    cleanupRunner(cleanupList)
    wss.removeAllListeners()
    setupWss(wssMap, wss, mock, context, pathname, filepath)

    connectionList.forEach(({ ws, req }) => {
      ws.removeAllListeners()
      emitConnection(wss, ws, req, connectionList)
    })
  }

  loader.on?.('mock:update-end', (filepath: string) => {
    if (!hmrMap.has(filepath)) return
    const mockUrlList = hmrMap.get(filepath)!
    for (const mockUrl of mockUrlList.values()) {
      for (const mock of loader.mockData[mockUrl]) {
        if (!mock.ws || (mock as any).__filepath !== filepath) return
        const wssMap = getWssMap(mockUrl)
        for (const [pathname, wss] of wssMap.entries()) {
          restartWss(wssMap, wss, mock, pathname, filepath)
        }
      }
    }
  })

  httpServer?.on('upgrade', (req, socket, head) => {
    const { pathname, query } = parseUrl(req.url!, true)
    if (
      !pathname ||
      proxies.length === 0 ||
      !proxies.some((context) => doesProxyContextMatchUrl(context, req.url!))
    ) {
      return
    }
    const mockData = loader.mockData
    const mockUrl = Object.keys(mockData).find((key) => {
      return pathToRegexp(key).test(pathname)
    })
    if (!mockUrl) return

    const mock = mockData[mockUrl].find((mock) => {
      return mock.url && mock.ws && pathToRegexp(mock.url).test(pathname)
    }) as MockWebsocketItem

    if (!mock) return

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
    const cookies = new Cookies(req, req as any, cookiesOptions)
    const { query: refererQuery } = parseUrl(req.headers.referer || '', true)

    request.query = query
    request.refererQuery = refererQuery
    request.params = parseParams(mockUrl, pathname)
    request.getCookie = cookies.get.bind(cookies)

    wss.handleUpgrade(request, socket, head, (ws) => {
      debug(`websocket-mock: ${req.url} connected`)
      wssContext.connectionList.push({ req: request, ws })

      emitConnection(wss, ws, request, wssContext.connectionList)
    })
  })

  httpServer?.on('close', () => {
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

function cleanupRunner(cleanupList: WSSContext['cleanupList']) {
  let cleanup: (() => void) | undefined
  // eslint-disable-next-line no-cond-assign
  while ((cleanup = cleanupList.shift())) {
    cleanup?.()
  }
}
