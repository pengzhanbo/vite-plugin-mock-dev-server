import type { SetCookieOption } from 'vite-plugin-mock-dev-server/types'
import { defineMock } from 'vite-plugin-mock-dev-server'

type CookieMap = Record<string, string | [string, SetCookieOption]>

/**
 * Cookies: static values, function values, signed cookies (requires
 * `cookiesOptions.keys`), deleting a cookie and `res.setCookie` in `response`.
 *
 * Cookie：静态值、函数值、签名 Cookie（需要 `cookiesOptions.keys`）、
 * 删除 Cookie，以及在 `response` 中调用 `res.setCookie`。
 */
export default defineMock([
  {
    url: '/api/login',
    cookies: {
      'token': 'username&password',
      'demo-signed': ['signed-value', { signed: true, httpOnly: true, path: '/' }],
    },
    body: {
      code: 200,
      message: 'login success',
    },
  },
  {
    url: '/api/logout',
    cookies({ getCookie }): CookieMap {
      const token = getCookie('token')
      if (token) {
        return {
          'token': ['', { expires: new Date(Date.now() - 86_400_000) }],
          'demo-signed': ['', { signed: true, expires: new Date(Date.now() - 86_400_000) }],
        }
      }
      return {}
    },
    body: {
      code: 200,
      message: 'logout success',
    },
  },
  {
    url: '/api/check-login',
    body(request) {
      return {
        isLogin: !!request.getCookie('token'),
        signed: request.getCookie('demo-signed', { signed: true }) ?? null,
      }
    },
  },
  {
    url: '/api/cookie/read-signed',
    body(request) {
      return {
        signed: request.getCookie('demo-signed', { signed: true }) ?? null,
        // Tampered / unsigned reads return undefined
        // 被篡改或未签名的读取会返回 undefined
        unsigned: request.getCookie('demo-signed') ?? null,
      }
    },
  },
  {
    url: '/api/cookie/set-response',
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
