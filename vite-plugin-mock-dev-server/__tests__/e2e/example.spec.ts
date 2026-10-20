/**
 * End-to-end tests for the example project.
 *
 * These specs boot a real Vite dev server on top of `example/` with the very same
 * options as `example/vite.config.ts`, then execute the scenario manifest that also
 * renders the dashboard. Every HTTP feature, the special channels (SSE / WebSocket /
 * upload / static files / CORS / record & replay) and the standalone build output
 * are covered.
 *
 * 示例项目的端到端测试。
 *
 * 用例使用与 `example/vite.config.ts` 完全相同的配置，在 `example/` 上启动真实的
 * Vite 开发服务器，并执行仪表盘所使用的同一份场景清单。覆盖全部 HTTP 能力、
 * 特殊通道（SSE / WebSocket / 上传 / 静态文件 / CORS / 录制回放）以及独立服务构建产物。
 */
import type { AddressInfo } from 'node:net'
import type { RawData } from 'ws'
import { execSync, spawn } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { env } from 'node:process'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import { exampleRoot } from '../../../example/plugin-options.js'
import { getScenarioRequests, runScenario } from '../../../example/src/scenario-runner.js'
import { httpScenarios } from '../../../example/src/scenarios.js'
import { waitFor, waitForMock } from './helpers.js'

const repoRoot = path.resolve(exampleRoot, '..')
const uploadDir = path.join(exampleRoot, 'uploads')
const recordDir = path.join(exampleRoot, 'mock/.recordings')

/**
 * Make sure the built helper entry exists and is newer than the source.
 *
 * The example dev server loads the built package (`dist`), while the rest of the
 * specs import the plugin source. Rebuild when `dist` is missing or stale so the
 * example always runs the current source without paying the build cost on every
 * test run.
 *
 * 确保构建后的 helper 产物存在且不早于源码。
 *
 * 示例开发服务器加载的是构建产物（`dist`），而其余用例直接引用插件源码。仅在产物
 * 缺失或过期时重新构建，既能保证示例运行的是最新源码，也避免每次测试都构建。
 */
function ensureHelperBuilt(): void {
  const packageRoot = path.join(repoRoot, 'vite-plugin-mock-dev-server')
  const helperEntry = path.join(packageRoot, 'dist/helper.js')
  const distMtime = existsSync(helperEntry) ? statSync(helperEntry).mtimeMs : 0
  const sourceMtime = Math.max(
    latestMtime(path.join(packageRoot, 'src')),
    statSync(path.join(packageRoot, 'tsdown.config.ts')).mtimeMs,
    statSync(path.join(packageRoot, 'package.json')).mtimeMs,
  )
  if (distMtime >= sourceMtime) {
    return
  }
  execSync('pnpm -F vite-plugin-mock-dev-server build', {
    cwd: repoRoot,
    stdio: 'pipe',
  })
}

/**
 * Find the newest modification time under a directory
 *
 * 查找目录下最新的修改时间
 *
 * @param dir - Directory / 目录
 * @returns Newest mtime in milliseconds / 最新的修改时间（毫秒）
 */
function latestMtime(dir: string): number {
  let latest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const filepath = path.join(dir, entry.name)
    latest = Math.max(
      latest,
      entry.isDirectory() ? latestMtime(filepath) : statSync(filepath).mtimeMs,
    )
  }
  return latest
}

/**
 * Find a free TCP port
 *
 * 获取一个空闲端口
 *
 * @returns The port / 端口
 */
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address() as AddressInfo
      probe.close(() => resolve(port))
    })
  })
}

/**
 * Running example dev server
 *
 * 运行中的示例开发服务器
 */
interface ExampleServer {
  origin: string
  request: (pathname: string, init?: RequestInit) => Promise<Response>
  close: () => Promise<void>
  output: () => string
}

/**
 * Remove IDE-injected fs shims from `NODE_OPTIONS`.
 *
 * IDEs may inject a `--require` hook that intercepts workspace writes/unlinks
 * (safe-delete and friends). The mock compiler creates and removes one temp module
 * per mock file, so those hooks turn a sub-second load into ~12s. Keep any other
 * Node options intact.
 *
 * 从 `NODE_OPTIONS` 中移除 IDE 注入的 fs shim。
 *
 * IDE 可能通过 `--require` 注入拦截工作区写入/删除的钩子（如 safe-delete），而 mock
 * 编译器会为每个 mock 文件创建并删除临时模块，这些钩子会把亚秒级加载拖到约 12 秒。
 * 其余 Node 参数保持不变。
 *
 * @param value - Original NODE_OPTIONS / 原始的 NODE_OPTIONS
 * @returns Sanitized NODE_OPTIONS / 清理后的 NODE_OPTIONS
 */
function stripNodeOptionsShim(value: string | undefined): string | undefined {
  if (!value) {
    return value
  }
  return value
    .replace(/(?:^|\s)--require(?:=|\s+)(?:"[^"]*shim[^"]*"|\S*shim\S*)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Start the example through the real Vite CLI.
 *
 * Running the example in a child process is important: the mock compiler loads
 * every mock file through a native dynamic `import()`. When the examples run inside
 * a Vitest worker those imports are intercepted by the test module runner and
 * serialized, making 40 mock files take ~12s to load. A real Vite process keeps
 * the native ESM loader and starts in about a second.
 *
 * 通过真实的 Vite CLI 启动示例。
 *
 * 在子进程中运行示例很关键：mock 编译器通过原生动态 `import()` 加载每个 mock 文件。
 * 如果示例运行在 Vitest worker 内，这些 import 会被测试模块运行器接管并串行化，
 * 导致 40 个 mock 文件加载约需 12 秒；真实的 Vite 进程使用原生 ESM loader，
 * 大约 1 秒即可启动。
 *
 * @param port - Vite port / Vite 端口
 * @param upstreamPort - Record upstream port / 录制上游端口
 * @returns Running example server / 运行中的示例服务器
 */
function startExampleServer(port: number, upstreamPort: number): ExampleServer {
  const require = createRequire(import.meta.url)
  const viteBin = path.resolve(path.dirname(require.resolve('vite')), '../../bin/vite.js')
  const child = spawn(
    process.execPath,
    [viteBin, '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    {
      cwd: exampleRoot,
      // IDE 注入的 `NODE_OPTIONS` 可能包含 fs shim（如 safe-delete），
      // 工作区内的每次写入/删除会变成数百毫秒，mock 编译会产生大量临时文件。
      // 子进程不需要该 shim，清空 `NODE_OPTIONS` 可让 mock 编译恢复毫秒级。
      // `NODE_OPTIONS` injected by IDEs may contain an fs shim (such as
      // safe-delete), turning each workspace write/unlink into hundreds of
      // milliseconds while the mock compiler creates many temp files. The child
      // does not need the shim; clearing it keeps mock compilation fast.
      env: {
        ...env,
        NODE_OPTIONS: stripNodeOptionsShim(env.NODE_OPTIONS),
        MOCK_UPSTREAM_PORT: String(upstreamPort),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  let output = ''
  child.stdout?.on('data', (chunk) => {
    output += String(chunk)
  })
  child.stderr?.on('data', (chunk) => {
    output += String(chunk)
  })
  const exited = new Promise<void>((resolve) => {
    child.once('exit', () => resolve())
    child.once('error', (error) => {
      output += `${error.stack ?? error.message}\n`
      resolve()
    })
  })
  const origin = `http://127.0.0.1:${port}`

  return {
    origin,
    request: (pathname, init) => fetch(`${origin}${pathname}`, init),
    output: () => output,
    close: async () => {
      if (child.exitCode != null) {
        await exited
        return
      }
      child.kill('SIGTERM')
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5_000))])
      if (child.exitCode == null) {
        child.kill('SIGKILL')
        await exited
      }
    },
  }
}

/**
 * Convert received websocket data to a string
 *
 * 将 websocket 收到的数据转换为字符串
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

/**
 * A websocket client buffering the received messages
 *
 * 会缓存收到消息的 websocket 客户端
 */
interface SocketClient {
  ws: WebSocket
  messages: string[]
  closed?: { code: number; reason: string }
  rejected?: number
  send: (data: string) => void
  close: () => void
}

/**
 * Connect a websocket client
 *
 * 连接 websocket 客户端
 *
 * @param url - Websocket URL / websocket 地址
 * @param headers - Extra handshake headers / 额外的握手请求头
 * @returns The connected client / 已连接的客户端
 */
function connectSocket(url: string, headers?: Record<string, string>): Promise<SocketClient> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { headers })
    const client: SocketClient = {
      ws,
      messages: [],
      send: (data) => ws.send(data),
      close: () => ws.close(),
    }
    ws.on('message', (data: RawData) => client.messages.push(rawDataToString(data)))
    ws.on('close', (code, reason) => {
      client.closed = { code, reason: reason.toString() }
    })
    ws.once('open', () => resolve(client))
    ws.once('unexpected-response', (_req, response) => {
      client.rejected = response.statusCode
      resolve(client)
    })
    ws.once('error', (error) => {
      if (!client.rejected) {
        reject(error)
      }
    })
  })
}

/**
 * Wait for the next websocket message
 *
 * 等待下一条 websocket 消息
 *
 * @param client - Connected client / 已连接的客户端
 * @returns The message / 消息
 */
function nextMessage(client: SocketClient): Promise<string> {
  return waitFor(() => client.messages.shift() ?? false, 'the websocket message was not received')
}

/**
 * Read the `set-cookie` headers of a response
 *
 * 读取响应的 `set-cookie` 头
 *
 * @param response - Response / 响应
 * @returns Cookie header value usable for a follow-up request / 可用于后续请求的 cookie 头
 */
function cookieHeader(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const list =
    headers.getSetCookie?.() ?? (headers.get('set-cookie') ? [headers.get('set-cookie')!] : [])
  return list.map((item) => item.split(';')[0]).join('; ')
}

describe('e2e: example project', () => {
  let server: ExampleServer
  let buildOutDir: string
  const recordedFiles: string[] = []

  beforeAll(async () => {
    ensureHelperBuilt()
    const upstreamPort = await getFreePort()
    let port = await getFreePort()
    while (port === upstreamPort) {
      port = await getFreePort()
    }
    buildOutDir = await mkdtemp(path.join(tmpdir(), 'mock-example-build-'))

    server = startExampleServer(port, upstreamPort)

    try {
      await waitForMock(server, '/api/user/list')
    } catch (error) {
      throw new Error(`${error}\n${server.output()}`)
    }
  }, 120_000)

  afterAll(async () => {
    await server?.close()

    for (const file of recordedFiles) {
      await rm(path.join(recordDir, file), { force: true })
    }
    // 即使录制用例在断言前失败，也要清掉本次运行生成的录制文件
    // Remove the recordings of this run even when a spec failed before registering them
    const recordFiles = await readdir(recordDir).catch(() => [])
    await Promise.all(
      recordFiles
        .filter((file) => file.startsWith('api-record-replay-'))
        .map((file) => rm(path.join(recordDir, file), { force: true })),
    )

    const uploads = await readdir(uploadDir).catch(() => [])
    await Promise.all(
      uploads
        .filter((file) => file !== '.gitkeep')
        .map((file) => rm(path.join(uploadDir, file), { force: true })),
    )

    await rm(buildOutDir, { recursive: true, force: true }).catch(() => undefined)
  })

  /**
   * Prepare the shared state required by a stateful scenario
   *
   * `vitest --retry` re-runs a single failed test, so every stateful scenario must
   * restore the state it depends on instead of relying on the previous test.
   *
   * 为有状态场景准备共享数据。
   *
   * `vitest --retry` 只会重跑失败的单个用例，因此有状态场景必须自行恢复依赖的数据，
   * 而不能依赖上一个用例的执行结果。
   *
   * @param id - Scenario id / 场景 id
   */
  async function prepareScenario(id: string): Promise<void> {
    const post = (url: string, body?: unknown): Promise<Response> =>
      server.request(url, {
        method: 'POST',
        ...(body === undefined
          ? {}
          : {
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            }),
      })

    const resetCrud = (): Promise<Response> => post('/api/crud/reset')
    const createCrud = (): Promise<Response> => post('/api/crud/items', { title: 'third item' })

    switch (id) {
      case 'crud-create':
        await resetCrud()
        break
      case 'crud-update':
      case 'crud-delete':
        await resetCrud()
        await createCrud()
        break
      case 'crud-list':
        await resetCrud()
        await createCrud()
        await server.request('/api/crud/items/3', { method: 'DELETE' })
        break
      case 'data-post-list':
      case 'data-post-delete':
      case 'data-post-reset':
        await post('/api/post/reset')
        break
      default:
        break
    }
  }

  describe('scenario manifest', () => {
    for (const scenario of httpScenarios) {
      for (const option of getScenarioRequests(scenario)) {
        const name = option.id === 'default' ? scenario.id : `${scenario.id} (${option.label})`
        it(`should pass: ${name}`, async () => {
          await prepareScenario(scenario.id)
          const result = await runScenario(server.request, scenario, undefined, option)

          expect(result.errors).toEqual([])
        })
      }
    }
  })

  it('should apply CORS only to allowed origins', async () => {
    const allowed = await server.request('/api/enabled', {
      headers: { origin: 'http://localhost:5173' },
    })
    const denied = await server.request('/api/enabled', {
      headers: { origin: 'http://evil.example.com' },
    })

    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect(allowed.headers.get('access-control-allow-credentials')).toBe('true')
    expect(denied.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('should answer a CORS preflight request for a matching mock', async () => {
    const response = await server.request('/api/request/body-parser', {
      method: 'OPTIONS',
      headers: {
        'origin': 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect(response.headers.get('access-control-allow-methods')).toContain('POST')
  })

  it('should upload a multipart file through formidable', async () => {
    const form = new FormData()
    form.append('name', 'avatar')
    form.append('files', new Blob(['hello']), 'avatar.txt')

    const response = await server.request('/api/upload', { method: 'POST', body: form })
    const body = await response.json()

    // 插件默认开启 formidable 的 `multiples`，字段会被解析为数组
    // The plugin enables `multiples` for formidable, so fields are arrays
    expect(body.name).toEqual(['avatar'])
    expect(body.files).toEqual(['avatar.txt'])
  })

  it('should serve a static file through a Readable stream', async () => {
    const response = await server.request('/static/hello.txt')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')
    expect(await response.text()).toContain('mock static file server')
  })

  it('should download a file with the mime type resolved from the file name', async () => {
    const response = await server.request('/api/file-download')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('javascript')
    expect(await response.text()).toContain('defineAPIMock')
  })

  it('should redirect through the response middleware', async () => {
    const response = await server.request('/api/response/redirect', { redirect: 'manual' })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/api/response/status-text')
  })

  it('should set multiple cookies from the response middleware', async () => {
    const response = await server.request('/api/response/set-cookie')
    const cookies = response.headers.getSetCookie()

    expect(cookies.some((item) => item.startsWith('session=from-response'))).toBe(true)
    expect(cookies.some((item) => item.startsWith('theme=dark'))).toBe(true)
  })

  it('should read signed cookies and reject unsigned values', async () => {
    const login = await server.request('/api/login', { method: 'POST' })
    const cookies = cookieHeader(login)

    expect(cookies).toContain('token=username&password')
    expect(cookies).toContain('demo-signed=signed-value')

    const valid = await server.request('/api/cookie/read-signed', {
      headers: { cookie: cookies },
    })
    expect(await valid.json()).toMatchObject({ signed: 'signed-value' })

    const unsigned = await server.request('/api/cookie/read-signed', {
      headers: { cookie: 'demo-signed=signed-value' },
    })
    expect((await unsigned.json()).signed).toBeNull()

    const check = await server.request('/api/check-login', {
      headers: { cookie: cookies },
    })
    expect(await check.json()).toEqual({ isLogin: true, signed: 'signed-value' })
  })

  it('should stream server-sent events', async () => {
    // 使用较短的间隔和次数，避免 e2e 为演示用的 5×250ms 流等待
    // Use a shorter interval and count so the e2e does not wait for the
    // 5×250ms demo stream
    const response = await server.request('/api/sse?interval=20&count=3')

    expect(response.headers.get('content-type')).toContain('text/event-stream')
    const text = await response.text()

    expect(text).toContain(': connected')
    expect(text).toContain('event: ready')
    expect(text).toContain('retry: 3000')
    expect(text).toContain('id: 1')
    expect(text).toContain('event: close')
    expect(text).toContain('"count":3')
  }, 5_000)

  it('should mock a websocket connection with query, cookie and echo', async () => {
    const client = await connectSocket(
      `${server.origin.replace('http', 'ws')}/socket.io?room=alpha`,
      {
        cookie: 'token=abc',
      },
    )

    const connected = JSON.parse(await nextMessage(client))
    expect(connected.type).toBe('connected')
    expect(connected.query.room).toBe('alpha')
    expect(connected.cookie).toBe('abc')

    client.send(JSON.stringify({ type: 'message', payload: 'hello' }))
    const echo = JSON.parse(await nextMessage(client))
    expect(echo).toMatchObject({ type: 'echo', payload: { type: 'message', payload: 'hello' } })

    client.close()
  })

  it('should broadcast a websocket message to every client', async () => {
    const base = server.origin.replace('http', 'ws')
    const first = await connectSocket(`${base}/socket.io?room=broadcast`)
    const second = await connectSocket(`${base}/socket.io?room=broadcast`)

    await nextMessage(first)
    await nextMessage(second)

    first.send(JSON.stringify({ type: 'broadcast', payload: 'to-all' }))
    expect(JSON.parse(await nextMessage(first))).toMatchObject({
      type: 'broadcast',
      payload: 'to-all',
    })
    expect(JSON.parse(await nextMessage(second))).toMatchObject({
      type: 'broadcast',
      payload: 'to-all',
    })

    first.close()
    second.close()
  })

  it('should create an independent websocket server for a dynamic url', async () => {
    const client = await connectSocket(`${server.origin.replace('http', 'ws')}/socket.io/room/42`)

    expect(JSON.parse(await nextMessage(client))).toMatchObject({ type: 'joined', room: '42' })

    client.send('hello room')
    expect(JSON.parse(await nextMessage(client))).toMatchObject({
      type: 'message',
      room: '42',
      payload: 'hello room',
    })

    client.close()
  })

  it('should reject a websocket upgrade without a matched mock', async () => {
    const client = await connectSocket(
      `${server.origin.replace('http', 'ws')}/socket.io/unknown-path`,
    )

    expect(client.rejected).toBe(404)
  })

  it('should record the upstream response and replay it', async () => {
    const token = Date.now().toString(36)
    const pathname = `/api-record/replay-${token}`

    const first = await server.request(pathname)
    expect(first.status).toBe(200)
    const firstBody = await first.json()
    expect(firstBody.source).toBe('upstream')
    expect(first.headers.get('x-file-path')).toBeNull()

    // 录制文件名使用 kebabCase 并附带 pathname 的短哈希，直接按文件名猜测容易失配，
    // 因此读取录制内容，按 pathname 精确定位。
    // The recording file name is kebab-cased and carries a short hash of the
    // pathname, so guessing the file name is brittle; read the records and match
    // on the pathname.
    const recordFile = await waitFor(async () => {
      const files = (await readdir(recordDir).catch(() => [])).filter((file) =>
        file.endsWith('.json'),
      )
      for (const file of files) {
        const records = JSON.parse(await readFile(path.join(recordDir, file), 'utf-8')) as {
          req: { pathname: string }
        }[]
        if (records.some((record) => record.req.pathname === pathname)) {
          return file
        }
      }
      return false
    }, 'the upstream response was not recorded')
    recordedFiles.push(recordFile)

    const second = await server.request(pathname)
    expect(second.status).toBe(200)
    expect(second.headers.get('x-file-path')).toContain('.recordings')
    expect(await second.json()).toEqual(firstBody)
  })

  it('should replay forbidden headers through the example proxy', async () => {
    const referer = await server.request('/__proxy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        url: '/api/request/validator-referer',
        headers: { referer: 'http://localhost:5173/page?from=dashboard' },
      }),
    })
    expect(referer.status).toBe(200)
    expect(referer.headers.get('x-file-path')).toContain('request-extras.mock.ts')
    expect((await referer.json()).matched).toBe('referer')

    const cookie = await server.request('/__proxy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        url: '/api/validator-check-cookie',
        headers: { cookie: 'token=abc' },
      }),
    })
    expect(cookie.status).toBe(200)
    expect((await cookie.json()).message).toBe('token valid.')
  })

  it('should reject non-local proxy targets and files outside the example', async () => {
    const proxy = await server.request('/__proxy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    })
    expect(proxy.status).toBe(400)

    const editor = await server.request(
      `/__open-in-editor?file=${encodeURIComponent('/etc/passwd')}`,
    )
    expect(editor.status).toBe(202)
  })

  it('should build a standalone mock server from the example', async () => {
    await build({
      // 使用示例的真实配置，确保 React / Tailwind / mock 插件一起参与构建
      // Use the real example config so React, Tailwind and the mock plugin are all built
      configFile: path.join(exampleRoot, 'vite.config.ts'),
      root: exampleRoot,
      logLevel: 'silent',
      build: {
        outDir: buildOutDir,
        emptyOutDir: true,
      },
    })

    const outputDir = path.join(buildOutDir, 'mockServer')
    const indexFile = path.join(outputDir, 'index.js')
    const mockDataFile = path.join(outputDir, 'mock-data.js')
    const packageFile = path.join(outputDir, 'package.json')

    expect(existsSync(indexFile)).toBe(true)
    expect(existsSync(mockDataFile)).toBe(true)
    expect(existsSync(packageFile)).toBe(true)

    const entry = await readFile(indexFile, 'utf-8')
    expect(entry).toContain('createMockMiddleware')
    expect(entry).toContain('activeScene')

    const mockData = await readFile(mockDataFile, 'utf-8')
    expect(mockData).toContain('/api/path/static')

    const manifest = JSON.parse(await readFile(packageFile, 'utf-8'))
    expect(manifest.scripts.start).toBe('node index.js')
  }, 120_000)
})
