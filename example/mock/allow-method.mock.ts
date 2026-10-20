import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Method matching examples.
 *
 * A request with an undeclared method does not match these rules and falls through
 * to the example's JSON 404 (`plugins/api-404.ts`), so POST to the GET-only rule and
 * PUT to the GET+POST rule are real 404s instead of a global fallback response.
 *
 * 请求方法匹配示例。
 *
 * 未声明的方法不会命中这些规则，而是落到示例的 JSON 404（`plugins/api-404.ts`）。
 * 因此对仅 GET 规则发 POST、对 GET+POST 规则发 PUT 都会得到真实的 404，
 * 而不是全局兜底响应。
 */
export default defineMock([
  {
    url: '/api/only-get-method',
    method: 'GET',
    body: {
      message: 'Only get request methods are allowed',
    },
  },
  {
    url: '/api/allow-get-and-post',
    method: ['GET', 'POST'],
    body: {
      message: 'Allow get and post request methods',
    },
  },
])
