import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Request extras: query, params, body, headers, refererQuery, getCookie and the
 * validator forms based on them.
 *
 * 请求扩展信息：query、params、body、headers、refererQuery、getCookie，
 * 以及基于它们的多种 validator 形式。
 */
export default defineMock([
  {
    url: '/api/request/echo/:id',
    method: 'POST',
    body: (request) => ({
      method: request.method,
      url: request.url,
      query: request.query,
      params: request.params,
      body: request.body,
      refererQuery: request.refererQuery,
      headers: {
        'content-type': request.headers['content-type'] ?? null,
        'x-demo': request.headers['x-demo'] ?? null,
      },
      cookie: request.getCookie('demo-cookie') ?? null,
      signedCookie: request.getCookie('demo-signed', { signed: true }) ?? null,
    }),
  },
  {
    url: '/api/request/echo-text',
    method: 'POST',
    body: (request) => ({
      contentType: request.headers['content-type'],
      body: request.body,
    }),
  },
  {
    url: '/api/request/echo-form',
    method: 'POST',
    body: (request) => ({
      contentType: request.headers['content-type'],
      body: request.body,
    }),
  },
  {
    url: '/api/request/body-parser',
    method: 'POST',
    body: (request) => ({
      // 超过大小上限的请求体在读取阶段就会以 413 拒绝（见 `bodyParserOptions`），
      // 只有无法解析的请求体（如非法 JSON）才会让这里的 body 为 undefined
      // Bodies exceeding the size limit are rejected with 413 while being read
      // (see `bodyParserOptions`), only unparsable bodies (such as invalid JSON)
      // leave `body` undefined here
      parsed: request.body !== undefined,
      body: request.body ?? null,
    }),
  },

  // Object validator on request headers
  // 基于请求头的对象校验器
  {
    url: '/api/request/validator-headers',
    validator: { headers: { 'x-api-key': 'secret' } },
    body: { matched: 'headers' },
  },
  {
    url: '/api/request/validator-headers',
    body: { matched: 'fallback' },
  },

  // Object validator on the referer query
  // 基于 referer query 的对象校验器
  {
    url: '/api/request/validator-referer',
    validator: { refererQuery: { from: 'dashboard' } },
    body: { matched: 'referer' },
  },
  {
    url: '/api/request/validator-referer',
    body: { matched: 'fallback' },
  },

  // Function validator, also able to read cookies
  // 函数校验器，同样可以读取 cookie
  {
    url: '/api/request/validator-function',
    validator(request) {
      return request.query.role === 'admin' && request.getCookie('demo-cookie') === 'allowed'
    },
    body: { matched: 'admin' },
  },
  {
    url: '/api/request/validator-function',
    body: { matched: 'guest' },
  },
])
