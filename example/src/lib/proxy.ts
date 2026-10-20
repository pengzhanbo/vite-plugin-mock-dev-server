/**
 * Replay a scenario request through the example dev-server proxy.
 *
 * Browsers ignore forbidden headers such as `Cookie` and `Referer`, so the
 * dashboard cannot reproduce those scenarios with a direct `fetch`. The proxy
 * endpoint applies the scenario headers server-side and forwards the response
 * back unchanged.
 *
 * 通过示例开发服务器代理重放场景请求。
 *
 * 浏览器会忽略 `Cookie`、`Referer` 等禁止设置的请求头，仪表盘无法用直接 `fetch`
 * 复现这些场景。代理接口在服务端应用场景请求头，并原样返回响应。
 *
 * @param url - Scenario URL / 场景 URL
 * @param init - Fetch init / fetch 配置
 * @returns Response / 响应
 */
export function proxyRequest(url: string, init?: RequestInit): Promise<Response> {
  const headers = (init?.headers ?? {}) as Record<string, string>
  const body = typeof init?.body === 'string' ? init.body : undefined

  return fetch('/__proxy', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      url,
      method: init?.method ?? 'GET',
      headers,
      body,
    }),
  })
}
