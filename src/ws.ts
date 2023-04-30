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
  MockWebsocketServerDestroy,
} from './types'
import { debug, doesProxyContextMatchUrl, parseParams } from './utils'

export function mockWebSocket(
  loader: MockLoader,
  httpServer: http.Server | null,
  proxies: string[],
  cookiesOptions: MockServerPluginOptions['cookiesOptions'],
) {
  const hmrFileSet = new Set<string>()
  const wssMap: Map<
    string,
    { wss: WebSocketServer; cancel: MockWebsocketServerDestroy }
  > = new Map()
  const hmrMap: Map<
    string,
    { req: http.IncomingMessage; ws: WebSocket; pathname: string }[]
  > = new Map()

  loader.on?.('mock:update-end', (filepath: string) => {
    if (!hmrFileSet.has(filepath)) return
    const map: Record<
      string,
      {
        mock: MockWebsocketItem
        mockUrl: string
        list: { req: http.IncomingMessage; ws: WebSocket }[]
      }
    > = {}
    for (const [mockUrl, hmr] of hmrMap.entries()) {
      loader.mockData[mockUrl].forEach((mock) => {
        if ((mock as any).__filepath__ === filepath && mock.ws) {
          hmr.forEach(({ pathname, req, ws }) => {
            map[pathname] ??= { mock, list: [], mockUrl }
            map[pathname].list.push({ req, ws })
            ws.removeAllListeners()
          })
        }
      })
    }
    Object.keys(map).forEach((pathname) => {
      const current = wssMap.get(pathname)!
      const { mock, list, mockUrl } = map[pathname]
      current.wss.removeAllListeners()
      current.cancel?.()
      current.cancel = mock.setup?.(current.wss)
      current.wss.on('close', () => {
        wssMap.delete(pathname)
      })
      list.forEach(({ req, ws }) => {
        current.wss.emit('connection', ws, req)
        ws.on('close', () => {
          const list = hmrMap.get(mockUrl)
          const i = list?.findIndex((item) => item.ws === ws) || -1
          if (i >= 0) list?.splice(i, 1)
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

    hmrFileSet.add((mock as any).__filepath__)

    let current = wssMap.get(pathname)!
    if (!current) {
      const wss = new WebSocketServer({ noServer: true })
      const cancel = mock.setup?.(wss)
      wss.on('close', () => {
        wssMap.delete(pathname)
      })
      current = { wss, cancel }
      wssMap.set(pathname, current)
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

      current.wss.emit('connection', ws, request)

      let hmr = hmrMap.get(mockUrl)
      if (!hmr) {
        hmr = []
        hmrMap.set(mockUrl, hmr)
      }
      hmr.push({ req: request, ws, pathname })
      ws.on('close', () => {
        const i = hmr!.findIndex((item) => item.ws === ws)
        if (i >= 0) hmr!.splice(i, 1)
      })
    })
  })

  httpServer?.on('close', () => {
    wssMap.forEach(({ wss, cancel }) => {
      cancel?.()
      wss.close()
    })
    wssMap.clear()
    hmrFileSet.clear()
    hmrMap.clear()
  })
}
