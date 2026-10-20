import type { Plugin } from 'vite'

interface ProxyPayload {
  url?: unknown
  method?: unknown
  headers?: unknown
  body?: unknown
}

/**
 * Proxy scenario requests through the dev server.
 *
 * Browsers forbid setting `Cookie` and `Referer` headers from `fetch`, which makes
 * scenarios such as `validator.refererQuery` and `validator-check-cookie` behave
 * differently in the dashboard than in the Node e2e specs. This endpoint accepts a
 * small JSON envelope, replays it server-side against the same dev server, and
 * streams the response back. The UI can then exercise exactly the same headers as
 * the specs while the CORS / SSE / WebSocket panels still use real browser APIs.
 *
 * 通过开发服务器代理场景请求。
 *
 * 浏览器禁止 `fetch` 设置 `Cookie` 与 `Referer`，导致 `validator.refererQuery`、
 * `validator-check-cookie` 等场景在仪表盘与 Node 端到端用例中的行为不一致。
 * 该接口接收一个 JSON 信封，在服务端向同一个开发服务器重放请求并返回响应，
 * 使 UI 也能发送与用例完全相同的请求头；CORS / SSE / WebSocket 面板仍使用真实
 * 浏览器 API。
 *
 * @returns Vite plugin / Vite 插件
 */
export function requestProxy(): Plugin {
  return {
    name: 'example-request-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proxy', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Use POST')
          return
        }

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          const payload = JSON.parse(Buffer.concat(chunks).toString('utf8')) as ProxyPayload
          const url = typeof payload.url === 'string' ? payload.url : ''
          if (!url.startsWith('/') || url.startsWith('//')) {
            res.statusCode = 400
            res.end('Only local paths are allowed')
            return
          }

          const method = typeof payload.method === 'string' ? payload.method.toUpperCase() : 'GET'
          const headers = new Headers()
          if (payload.headers && typeof payload.headers === 'object') {
            for (const [key, value] of Object.entries(payload.headers as Record<string, unknown>)) {
              if (typeof value === 'string') {
                headers.set(key, value)
              }
            }
          }

          // Keep the browser's cookie / referer unless the scenario overrides them.
          // 场景未显式设置时，保留浏览器自带的 cookie / referer。
          if (!headers.has('cookie') && req.headers.cookie) {
            headers.set('cookie', req.headers.cookie)
          }
          if (!headers.has('referer') && req.headers.referer) {
            headers.set('referer', req.headers.referer)
          }

          const target = new URL(url, `http://${req.headers.host ?? '127.0.0.1'}`)
          const body =
            method === 'GET' || method === 'HEAD'
              ? undefined
              : typeof payload.body === 'string'
                ? payload.body
                : undefined
          const response = await fetch(target, {
            method,
            headers,
            body,
            redirect: 'manual',
          })

          res.statusCode = response.status
          res.statusMessage = response.statusText
          const setCookies = response.headers.getSetCookie?.() ?? []
          response.headers.forEach((value, key) => {
            if (
              key === 'set-cookie' ||
              key === 'content-encoding' ||
              key === 'content-length' ||
              key === 'transfer-encoding'
            ) {
              return
            }
            res.setHeader(key, value)
          })
          if (setCookies.length > 0) {
            res.setHeader('set-cookie', setCookies)
          }
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ message: (error as Error).message }))
        }
      })
    },
  }
}
