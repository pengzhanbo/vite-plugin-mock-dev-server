/**
 * End-to-end tests for the HTTP mock pipeline.
 *
 * HTTP Mock 链路的端到端测试。
 *
 * A real Vite dev server is started for a temporary project, so these specs cover
 * the plugin lifecycle, the compiled mock files, body parsing, matching, CORS,
 * streaming and hot reload together.
 *
 * 用例会为临时项目启动真实的 Vite 开发服务器，覆盖插件生命周期、mock 文件编译、
 * 请求体解析、匹配、CORS、流式响应与热更新。
 */
import type { E2EProject, RunningServer } from './helpers.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createProject, startMockServer, waitFor, waitForMock } from './helpers.js'

const MOCK_FILE = 'mock/api.mock.ts'

/**
 * Build the content of the mock file
 *
 * 生成 mock 文件内容
 *
 * @param name - Name returned by `/api/users` / `/api/users` 返回的名字
 * @returns Mock file content / mock 文件内容
 */
function apiMock(name: string): string {
  return `
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

const streamFile = path.join(__dirname, 'stream.txt')

export default [
  {
    url: '/api/users',
    method: 'GET',
    body: { list: [{ id: 1, name: '${name}' }] },
  },
  {
    url: '/api/users/:id',
    method: 'GET',
    body: (req) => ({
      id: req.params.id,
      query: req.query,
      cookie: req.getCookie('session') ?? null,
    }),
  },
  {
    url: '/api/echo',
    method: 'POST',
    body: (req) => ({ body: req.body }),
  },
  {
    url: '/api/meta',
    method: 'GET',
    status: 201,
    statusText: 'Created',
    headers: { 'x-custom': 'yes' },
    cookies: { token: ['abc', { httpOnly: true, path: '/' }] },
    body: { ok: true },
  },
  {
    url: '/api/scene',
    method: 'GET',
    body: { scene: 'default' },
  },
  {
    url: '/api/scene',
    method: 'GET',
    scene: 'admin',
    body: { scene: 'admin' },
  },
  {
    url: '/api/validated',
    method: 'GET',
    validator: { query: { role: 'admin' } },
    body: { role: 'admin' },
  },
  {
    url: '/api/validated',
    method: 'GET',
    body: { role: 'guest' },
  },
  {
    url: '/api/search?type=user',
    method: 'GET',
    body: { type: 'user' },
  },
  {
    url: '/api/search',
    method: 'GET',
    body: { type: 'any' },
  },
  {
    url: '/api/upload',
    method: 'POST',
    body: (req) => ({
      name: req.body.name,
      filename: req.body.file?.[0]?.originalFilename,
      size: req.body.file?.[0]?.size,
    }),
  },
  {
    url: '/api/download',
    method: 'GET',
    type: 'text/csv',
    body: 'id,name\\n1,Alice',
  },
  {
    url: '/api/stream',
    method: 'GET',
    type: 'text',
    body: () => fs.createReadStream(streamFile),
  },
  {
    url: '/api/stream-error',
    method: 'GET',
    body: () =>
      new Readable({
        read() {
          this.destroy(new Error('stream boom'))
        },
      }),
  },
  {
    url: '/api/sse',
    method: 'GET',
    response(_req, res) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.write('data: first\\n\\n')
      res.write('data: second\\n\\n')
      res.end()
    },
  },
  {
    url: '/api/error',
    method: 'GET',
    error: {
      probability: 1,
      status: 503,
      statusText: 'Service Unavailable',
      body: { error: true },
    },
  },
  {
    url: '/api/delay',
    method: 'GET',
    delay: 120,
    body: { delayed: true },
  },
]
`
}

describe('e2e: http mock pipeline', () => {
  let project: E2EProject
  let server: RunningServer

  beforeAll(async () => {
    project = await createProject({
      [MOCK_FILE]: apiMock('Alice'),
      'mock/stream.txt': 'streamed content',
    })
    server = await startMockServer({
      root: project.root,
      // 这些用例会主动制造流错误与非法 URL，错误日志是预期行为
      // These specs intentionally trigger stream errors and invalid URLs; the
      // error logs are expected
      pluginOptions: { prefix: ['/api'], log: 'silent' },
    })
    await waitForMock(server, '/api/users')
  })

  afterAll(async () => {
    await server?.close()
    await project?.cleanup()
  })

  it('should respond with the static body of a matched mock', async () => {
    const response = await server.request('/api/users')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ list: [{ id: 1, name: 'Alice' }] })
  })

  it('should provide the plugin response headers', async () => {
    const response = await server.request('/api/users')

    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('cache-control')).toBe('no-cache, max-age=0')
    expect(response.headers.get('x-mock-power-by')).toBe('vite-plugin-mock-dev-server')
    expect(response.headers.get('x-file-path')).toContain(MOCK_FILE)
  })

  it('should parse dynamic params and the query string', async () => {
    const response = await server.request('/api/users/42?tab=profile')
    const body = await response.json()

    expect(body).toEqual({ id: '42', query: { tab: 'profile' }, cookie: null })
  })

  it('should expose cookies of the request through `getCookie`', async () => {
    const response = await server.request('/api/users/7', {
      headers: { cookie: 'session=abc123' },
    })
    const body = await response.json()

    expect(body.cookie).toBe('abc123')
  })

  it('should parse a json request body', async () => {
    const response = await server.request('/api/echo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    })

    expect(await response.json()).toEqual({ body: { hello: 'world' } })
  })

  it('should parse an urlencoded request body', async () => {
    const response = await server.request('/api/echo', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'a=1&b=2',
    })

    expect(await response.json()).toEqual({ body: { a: '1', b: '2' } })
  })

  it('should parse a text request body', async () => {
    const response = await server.request('/api/echo', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'plain text',
    })

    expect(await response.json()).toEqual({ body: 'plain text' })
  })

  it('should apply status, statusText, custom headers and cookies', async () => {
    const response = await server.request('/api/meta')

    expect(response.status).toBe(201)
    expect(response.statusText).toBe('Created')
    expect(response.headers.get('x-custom')).toBe('yes')
    expect(response.headers.get('set-cookie')).toContain('token=abc')
    // cookie 序列化大小写由 `cookies` 库决定，这里不区分大小写
    // The casing of the serialized cookie comes from the `cookies` package
    expect(response.headers.get('set-cookie')).toMatch(/httponly/i)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('should activate a scene through the X-Mock-Scene header', async () => {
    const fallback = await server.request('/api/scene')
    const activated = await server.request('/api/scene', {
      headers: { 'x-mock-scene': 'admin' },
    })

    expect(await fallback.json()).toEqual({ scene: 'default' })
    expect(await activated.json()).toEqual({ scene: 'admin' })
  })

  it('should prefer the mock whose validator matches the request', async () => {
    const admin = await server.request('/api/validated?role=admin')
    const guest = await server.request('/api/validated')

    expect(await admin.json()).toEqual({ role: 'admin' })
    expect(await guest.json()).toEqual({ role: 'guest' })
  })

  it('should treat the query string in a mock url as a validator', async () => {
    const user = await server.request('/api/search?type=user')
    const any = await server.request('/api/search?type=post')

    expect(await user.json()).toEqual({ type: 'user' })
    expect(await any.json()).toEqual({ type: 'any' })
  })

  it('should pass unmatched requests through to the next middleware', async () => {
    const response = await server.request('/api/unknown')

    expect(response.status).toBe(404)
  })

  it('should parse a multipart upload', async () => {
    const form = new FormData()
    form.append('name', 'avatar')
    form.append('file', new Blob(['hello']), 'avatar.txt')

    const response = await server.request('/api/upload', { method: 'POST', body: form })
    const body = await response.json()

    // 插件默认给 formidable 开启 `multiples`，因此同名字段为数组
    // The plugin enables `multiples` for formidable by default, so fields are arrays
    expect(body.name).toEqual(['avatar'])
    expect(body.filename).toBe('avatar.txt')
    expect(body.size).toBe(5)
  })

  it('should respond with the content type of the configured `type`', async () => {
    const response = await server.request('/api/download')

    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(await response.text()).toBe('id,name\n1,Alice')
  })

  it('should stream a readable body to the client', async () => {
    const response = await server.request('/api/stream')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')
    expect(await response.text()).toBe('streamed content')
  })

  it('should answer a stream error with 500 without crashing the server', async () => {
    const response = await server.request('/api/stream-error')

    expect(response.status).toBe(500)

    // 源流错误不能影响后续请求
    // The stream error must not affect the following requests
    const next = await server.request('/api/users')
    expect(next.status).toBe(200)
  })

  it('should send a server-sent event stream', async () => {
    const response = await server.request('/api/sse')

    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(await response.text()).toBe('data: first\n\ndata: second\n\n')
  })

  it('should simulate errors according to the `error` option', async () => {
    const response = await server.request('/api/error')

    expect(response.status).toBe(503)
    expect(response.statusText).toBe('Service Unavailable')
    expect(await response.json()).toEqual({ error: true })
  })

  it('should delay the response', async () => {
    const start = Date.now()
    const response = await server.request('/api/delay')

    expect(Date.now() - start).toBeGreaterThanOrEqual(100)
    expect(await response.json()).toEqual({ delayed: true })
  })

  it('should answer a CORS preflight request for a matching mock', async () => {
    const response = await server.request('/api/echo', {
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

  it('should add CORS headers only for allowed origins', async () => {
    const allowed = await server.request('/api/users', {
      headers: { origin: 'http://localhost:5173' },
    })
    const denied = await server.request('/api/users', {
      headers: { origin: 'http://evil.example.com' },
    })

    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect(denied.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('should drop an invalid url pattern without affecting other mocks', async () => {
    // `(` 无法被 path-to-regexp 编译，在请求期会抛错，
    // 因此应在编译阶段丢弃该规则，而不是让请求命中后返回 500
    // `(` cannot be compiled by path-to-regexp and throws at request time;
    // the rule must be dropped while compiling instead of answering 500
    await project.write(
      'mock/invalid.mock.ts',
      `
export default [
  { url: '/api/invalid-ok', method: 'GET', body: { ok: true } },
  { url: '/api/bad/(', method: 'GET', body: { bad: true } },
]
`,
    )

    const ok = await waitFor(async () => {
      const response = await server.request('/api/invalid-ok')
      return response.status === 200 ? response : false
    }, 'the valid mock of the same file was not loaded')
    expect(await ok.json()).toEqual({ ok: true })

    const dropped = await server.request('/api/bad/1')
    expect(dropped.status).toBe(404)
  })

  it('should reload the mock data when the mock file changes', async () => {
    await project.write(MOCK_FILE, apiMock('Bob'))

    const body = await waitFor(async () => {
      const response = await server.request('/api/users')
      const data = await response.json()
      return data.list?.[0]?.name === 'Bob' ? data : false
    }, 'the mock file was not hot-reloaded')

    expect(body).toEqual({ list: [{ id: 1, name: 'Bob' }] })
  })
})
