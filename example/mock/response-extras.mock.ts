import { Buffer } from 'node:buffer'
import { setTimeout as sleep } from 'node:timers/promises'
import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Response controls: status text, async body / headers, delay range, body types
 * and the `response` middleware.
 *
 * 响应控制：statusText、异步 body / headers、延迟区间、响应体类型，
 * 以及 `response` 中间件。
 */
export default defineMock([
  {
    url: '/api/response/status-text',
    status: 201,
    statusText: 'Mock Created',
    body: { created: true },
  },
  {
    url: '/api/response/async-body',
    body: async (request) => {
      await sleep(30)
      return {
        async: true,
        id: request.query.id ?? null,
        at: Date.now(),
      }
    },
  },
  {
    url: '/api/response/async-headers',
    headers: async () => {
      await sleep(10)
      return {
        'X-Async-Header': 'yes',
      }
    },
    body: { asyncHeaders: true },
  },
  {
    url: '/api/response/delay',
    delay: 150,
    body: { delayed: 150 },
  },
  {
    url: '/api/response/delay-range',
    delay: [200, 400],
    body: { delayed: '200-400ms' },
  },
  {
    url: '/api/response/empty',
  },
  {
    url: '/api/response/null',
    body: null,
  },
  {
    url: '/api/response/number',
    type: 'text',
    body: 42,
  },
  {
    url: '/api/response/array',
    body: [1, 2, 3],
  },
  {
    url: '/api/response/text',
    type: 'text',
    body: 'plain text response',
  },
  {
    url: '/api/response/csv',
    type: 'text/csv',
    body: 'id,name\n1,Alice\n2,Bob',
  },
  {
    // A file name is accepted as the `type`, the plugin resolves the mime type
    // `type` 也可以传入文件名，插件会据此解析 mime 类型
    url: '/api/response/filename-type',
    type: 'data.json',
    body: JSON.stringify({ from: 'filename' }),
  },
  {
    url: '/api/response/buffer',
    type: 'buffer',
    body: Buffer.from('buffer body'),
  },
  {
    url: '/api/response/chunked',
    response(req, res) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.write('chunk-1\n')
      res.write('chunk-2\n')
      res.end('chunk-3\n')
    },
  },
  {
    url: '/api/response/redirect',
    response(_req, res) {
      res.statusCode = 302
      res.setHeader('Location', '/api/response/status-text')
      res.end()
    },
  },
  {
    url: '/api/response/set-cookie',
    response(_req, res) {
      res.setCookie('session', 'from-response', {
        httpOnly: true,
        path: '/',
        maxAge: 60_000,
      })
      res.setCookie('theme', 'dark', { path: '/' })
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ cookies: ['session', 'theme'] }))
    },
  },
])
