import type { RawData } from 'ws'
/**
 * End-to-end tests for the WebSocket mock server.
 *
 * WebSocket Mock 服务的端到端测试。
 *
 * These specs connect a real `ws` client to a real Vite dev server, covering the
 * `upgrade` takeover, the dynamic URL rules and the lifecycle of the websocket
 * servers when the mock file changes.
 *
 * 用例通过真实的 `ws` 客户端连接真实的 Vite 开发服务器，覆盖 `upgrade` 接管、
 * 动态 URL 规则，以及 mock 文件变更时 websocket 服务的生命周期。
 */
import type { E2EProject, RunningServer } from './helpers.js'
import { Buffer } from 'node:buffer'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import { createProject, startMockServer, waitFor, waitForMock } from './helpers.js'

/**
 * Convert the data received by a `ws` client to a string
 *
 * 将 `ws` 客户端收到的数据转换为字符串
 *
 * @param data - Received data / 收到的数据
 * @returns Message text / 消息文本
 */
function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString()
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString()
  }
  return data.toString()
}

const MOCK_FILE = 'mock/ws.mock.ts'

/**
 * Build the content of the websocket mock file
 *
 * 生成 websocket mock 文件内容
 *
 * @param options - Mock content options / mock 内容配置
 * @param options.url - URL of the broadcast rule / 广播规则的地址
 * @param options.greeting - Message sent by the broadcast rule / 广播规则发送的消息
 * @returns Mock file content / mock 文件内容
 */
function wsMock({ url = '/ws/broadcast', greeting = 'welcome' } = {}): string {
  return `
export default [
  {
    url: '/ws/room/:id',
    ws: true,
    setup(wss, { onCleanup }) {
      wss.on('connection', (ws, req) => {
        ws.send('joined:' + req.params.id)
        ws.on('message', (data) => ws.send('echo:' + data.toString()))
      })
      const timer = setInterval(() => {}, 60_000)
      onCleanup(() => clearInterval(timer))
    },
  },
  {
    url: '${url}',
    ws: true,
    setup(wss) {
      wss.on('connection', (ws) => ws.send('${greeting}'))
    },
  },
  {
    url: '/api/ping',
    method: 'GET',
    body: { ok: true },
  },
]
`
}

/**
 * A connected websocket client that buffers the received messages
 *
 * 会缓存收到的消息的 websocket 客户端
 */
interface SocketClient {
  ws: WebSocket
  messages: string[]
  closeInfo?: { code: number }
  error?: Error
  send: (data: string) => void
  close: () => void
}

/**
 * Connect a websocket client and buffer its messages from the beginning
 *
 * 连接 websocket 客户端，并从一开始就缓存消息
 *
 * @param url - Websocket URL / websocket 地址
 * @returns The connected client / 已连接的客户端
 */
function connect(url: string): Promise<SocketClient> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const client: SocketClient = {
      ws,
      messages: [],
      send: (data) => ws.send(data),
      close: () => ws.close(),
    }
    // 监听必须在连接建立前注册：mock 可能在握手完成后立刻发送消息
    // The listener has to be registered before the connection opens: the mock may
    // send a message right after the handshake
    ws.on('message', (data: RawData) => client.messages.push(rawDataToString(data)))
    ws.on('close', (code) => {
      client.closeInfo = { code }
    })
    ws.on('error', (error) => {
      client.error = error
    })
    ws.once('open', () => resolve(client))
    ws.once('unexpected-response', (_req, res) => {
      // 被拒绝的握手：记录状态码后由用例断言
      // A rejected handshake: record the status code for the assertion
      client.closeInfo = { code: res.statusCode! }
      resolve(client)
    })
    ws.once('error', (error) => {
      if (!client.closeInfo) {
        reject(error)
      }
    })
  })
}

/**
 * Wait for the next message of a client
 *
 * 等待客户端的下一条消息
 *
 * @param client - Connected client / 已连接的客户端
 * @returns The message / 消息
 */
function nextMessage(client: SocketClient): Promise<string> {
  return waitFor(() => client.messages.shift() ?? false, 'the websocket message was not received')
}

describe('e2e: websocket mock', () => {
  let project: E2EProject
  let server: RunningServer

  beforeAll(async () => {
    project = await createProject({ [MOCK_FILE]: wsMock() })
    server = await startMockServer({
      root: project.root,
      pluginOptions: { prefix: ['/api'], wsPrefix: ['/ws'] },
    })
    await waitForMock(server, '/api/ping')
  })

  afterAll(async () => {
    await server?.close()
    await project?.cleanup()
  })

  it('should send and receive messages on a dynamic websocket url', async () => {
    const client = await connect(`${server.origin.replace('http', 'ws')}/ws/room/42`)

    expect(await nextMessage(client)).toBe('joined:42')

    client.send('hello')
    expect(await nextMessage(client)).toBe('echo:hello')

    client.close()
  })

  it('should reuse the same websocket server for the same pathname', async () => {
    const base = server.origin.replace('http', 'ws')
    const first = await connect(`${base}/ws/broadcast`)
    const second = await connect(`${base}/ws/broadcast`)

    expect(await nextMessage(first)).toBe('welcome')
    expect(await nextMessage(second)).toBe('welcome')

    first.close()
    second.close()
  })

  it('should reject an upgrade request without a matched websocket mock', async () => {
    const client = await connect(`${server.origin.replace('http', 'ws')}/ws/unknown`)

    expect(client.closeInfo?.code).toBe(404)
  })

  it('should restart the websocket server when the mock file changes', async () => {
    await project.write(MOCK_FILE, wsMock({ greeting: 'updated' }))

    const client = await waitFor(async () => {
      const socket = await connect(`${server.origin.replace('http', 'ws')}/ws/broadcast`)
      const message = await nextMessage(socket)
      socket.close()
      return message === 'updated' ? socket : false
    }, 'the websocket mock was not hot-reloaded')

    expect(client).toBeDefined()
  })

  it('should close the websocket server whose url was removed from the mock file', async () => {
    const client = await connect(`${server.origin.replace('http', 'ws')}/ws/broadcast`)
    expect(await nextMessage(client)).toBe('updated')

    // 修改规则 url 后，旧路径的 websocket 服务应被回收并断开客户端
    // After changing the rule url, the websocket server of the old path is
    // recycled and its clients are disconnected
    await project.write(MOCK_FILE, wsMock({ url: '/ws/broadcast-v2', greeting: 'moved' }))

    await waitFor(() => client.closeInfo, 'the stale websocket server did not close its client')
    expect(client.closeInfo?.code).toBe(1001)

    const moved = await waitFor(async () => {
      const socket = await connect(`${server.origin.replace('http', 'ws')}/ws/broadcast-v2`)
      if (socket.closeInfo?.code === 404) {
        return false
      }
      const message = await nextMessage(socket)
      socket.close()
      return message === 'moved' ? socket : false
    }, 'the websocket mock was not available at its new url')
    expect(moved).toBeDefined()

    const stale = await connect(`${server.origin.replace('http', 'ws')}/ws/broadcast`)
    expect(stale.closeInfo?.code).toBe(404)
  })
})
