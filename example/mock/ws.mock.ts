import type { MockRequest } from 'vite-plugin-mock-dev-server'
import { Buffer } from 'node:buffer'
import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Convert the raw websocket data to text
 *
 * 将 websocket 原始数据转换为文本
 *
 * @param raw - Raw data / 原始数据
 * @returns Message text / 消息文本
 */
function rawToString(raw: unknown): string {
  if (Buffer.isBuffer(raw)) {
    return raw.toString()
  }
  if (Array.isArray(raw)) {
    return Buffer.concat(raw).toString()
  }
  if (raw instanceof ArrayBuffer) {
    return Buffer.from(raw).toString()
  }
  return typeof raw === 'string' ? raw : ''
}

/**
 * WebSocket mocks: connection, message echo / broadcast, dynamic params, query,
 * cookies, server push and `onCleanup`.
 *
 * WebSocket mock：连接、消息回显 / 广播、动态参数、query、cookie、服务端推送，
 * 以及 `onCleanup` 清理。
 */
export default defineMock([
  {
    url: '/socket.io',
    ws: true,
    setup(wss, { onCleanup }) {
      const heartbeat = setInterval(() => {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'heartbeat', at: Date.now() }))
          }
        })
      }, 5000)
      onCleanup(() => clearInterval(heartbeat))

      wss.on('connection', (ws, req: MockRequest) => {
        ws.send(
          JSON.stringify({
            type: 'connected',
            url: req.url,
            query: req.query,
            params: req.params,
            cookie: req.getCookie('token') ?? null,
          }),
        )

        ws.on('message', (raw) => {
          const text = rawToString(raw)
          let message: any
          try {
            message = JSON.parse(text)
          } catch {
            message = { type: 'text', payload: text }
          }

          if (message?.type === 'broadcast') {
            const data = JSON.stringify({
              type: 'broadcast',
              payload: message.payload,
              at: Date.now(),
            })
            wss.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(data)
              }
            })
            return
          }

          ws.send(JSON.stringify({ type: 'echo', payload: message, at: Date.now() }))
        })
      })
    },
  },
  {
    url: '/socket.io/room/:room',
    ws: true,
    setup(wss, { onCleanup }) {
      const timer = setInterval(() => {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'tick', at: Date.now() }))
          }
        })
      }, 2000)
      onCleanup(() => clearInterval(timer))

      wss.on('connection', (ws, req: MockRequest) => {
        ws.send(
          JSON.stringify({
            type: 'joined',
            room: req.params.room,
            url: req.url,
          }),
        )

        ws.on('message', (raw) => {
          const data = JSON.stringify({
            type: 'message',
            room: req.params.room,
            payload: rawToString(raw),
          })
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(data)
            }
          })
        })
      })
    },
  },
])
