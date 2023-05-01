import type http from 'node:http'
import { parse as parseUrl } from 'node:url'
import Cookies from 'cookies'
import { pathToRegexp } from 'path-to-regexp'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import type { MockLoader } from './MockLoader'
import type {
  MockRequest,
  MockServerPluginOptions,
  MockWebsocketItem,
  WebSocketSetupContext,
} from './types'
import { debug, doesProxyContextMatchUrl, parseParams } from './utils'

interface WSSMapItem {
  wss: WebSocketServer
  cleanupList: (() => void)[]
  context: WebSocketSetupContext
}

interface HMRMapItem {
  req: http.IncomingMessage
  ws: WebSocket
  pathname: string
}

interface WaitingUpdateItem {
  mock: MockWebsocketItem
  mockUrl: string
  list: { req: http.IncomingMessage; ws: WebSocket }[]
}

export function mockWebSocket(
  loader: MockLoader,
  httpServer: http.Server | null,
  proxies: string[],
  cookiesOptions: MockServerPluginOptions['cookiesOptions'],
) {
  const hmrFileList = new Set<string>()
  const wssMap = new Map<string, WSSMapItem>()
  const hmrMap = new Map<string, HMRMapItem[]>()

  loader.on?.('mock:update-end', (filepath: string) => {
    if (!hmrFileList.has(filepath)) return

    const waitingUpdate: Record<string, WaitingUpdateItem> = {}
    for (const [mockUrl, hmr] of hmrMap.entries()) {
      loader.mockData[mockUrl].forEach((mock) => {
        if (mock.ws && (mock as any).__filepath__ === filepath) {
          hmr.forEach(({ pathname, req, ws }) => {
            waitingUpdate[pathname] ??= { mock, list: [], mockUrl }
            waitingUpdate[pathname].list.push({ req, ws })
          })
        }
      })
    }
    Object.keys(waitingUpdate).forEach((pathname) => {
      const { wss, cleanupList, context } = wssMap.get(pathname)!
      const { mock, list, mockUrl } = waitingUpdate[pathname]
      cleanupRunner(cleanupList)
      wss.removeAllListeners()
      mock.setup?.(wss, context)
      wss.on('close', () => wssMap.delete(pathname))
      list.forEach(({ req, ws }) => {
        ws.removeAllListeners()
        wss.emit('connection', ws, req)
        ws.on('close', () => {
          const list = hmrMap.get(mockUrl)
          const i = list?.findIndex((item) => item.ws === ws) || -1
          if (i !== -1) list?.splice(i, 1)
        })
      })
    })
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

    hmrFileList.add((mock as any).__filepath__)

    let current = wssMap.get(pathname)
    if (!current) {
      const wss = new WebSocketServer({ noServer: true })
      const cleanupList: (() => void)[] = []
      const context: WebSocketSetupContext = {
        onCleanup: (cleanup) => cleanupList.push(cleanup),
      }
      mock.setup?.(wss, context)
      wss.on('close', () => wssMap.delete(pathname))

      wssMap.set(pathname, (current = { wss, cleanupList, context }))
    }

    const request = req as MockRequest
    const cookies = new Cookies(req, req as any, cookiesOptions)
    const { query: refererQuery } = parseUrl(req.headers.referer || '', true)

    request.query = query
    request.refererQuery = refererQuery
    request.params = parseParams(mockUrl, pathname)
    request.getCookie = cookies.get.bind(cookies)

    current.wss.handleUpgrade(request, socket, head, (ws) => {
      debug(`websocket-mock: ${req.url} connected`)

      current!.wss.emit('connection', ws, request)

      let hmr = hmrMap.get(mockUrl)
      if (!hmr) hmrMap.set(mockUrl, (hmr = []))

      hmr.push({ req: request, ws, pathname })
      ws.on('close', () => {
        const i = hmr!.findIndex((item) => item.ws === ws)
        if (i !== -1) hmr!.splice(i, 1)
      })
    })
  })

  httpServer?.on('close', () => {
    wssMap.forEach(({ wss, cleanupList }) => {
      cleanupRunner(cleanupList)
      wss.close()
    })
    wssMap.clear()
    hmrMap.clear()
    hmrFileList.clear()
  })
}

function cleanupRunner(cleanupList: WSSMapItem['cleanupList']) {
  let cleanup: (() => void) | undefined
  // eslint-disable-next-line no-cond-assign
  while ((cleanup = cleanupList.shift())) {
    cleanup?.()
  }
}
