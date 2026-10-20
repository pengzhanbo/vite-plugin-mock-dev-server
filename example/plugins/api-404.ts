import type { Plugin } from 'vite'

/**
 * Prefixes handled by the mock plugin in this example.
 *
 * 本示例中由 mock 插件处理的路径前缀。
 */
const MOCK_PREFIXES = ['/api', '/api-dev', '/static', '/wildcard']

/**
 * Prefixes that must continue to the Vite proxy.
 *
 * 必须继续交给 Vite 代理处理的前缀。
 */
const PROXY_PREFIXES = ['/api-record']

/**
 * Return a JSON 404 for mock prefixes without a match.
 *
 * The mock plugin calls `next()` when no rule matches, which is the right behavior
 * for a plugin: another middleware or a real backend may handle the request. The
 * example has no backend, so without this middleware Vite's SPA fallback would
 * return `index.html` with status 200 for an unknown GET `/api` path, making the
 * demo look like every request succeeds. Returning 404 here keeps the example's
 * failure semantics visible.
 *
 * 为未命中 mock 的路径返回 JSON 404。
 *
 * mock 插件在无规则匹配时调用 `next()`，这是插件应有的行为：请求可能由其他中间件
 * 或真实后端处理。本示例没有后端，如果没有该中间件，Vite 的 SPA fallback 会对未知的
 * GET `/api` 路径返回 200 和 `index.html`，让示例看起来“所有请求都成功”。这里返回
 * 404，保留示例应有的失败语义。
 *
 * @returns Vite plugin / Vite 插件
 */
export function apiNotFound(): Plugin {
  return {
    name: 'example-api-not-found',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0] ?? ''

        if (isUnderPrefix(pathname, PROXY_PREFIXES)) {
          return next()
        }
        if (!isUnderPrefix(pathname, MOCK_PREFIXES)) {
          return next()
        }

        res.statusCode = 404
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ message: 'No mock matched', pathname }))
      })
    },
  }
}

/**
 * Check whether a pathname is the prefix itself or a child of it
 *
 * 判断路径是否等于前缀或位于该前缀之下
 *
 * @param pathname - Request pathname / 请求路径
 * @param prefixes - Candidate prefixes / 候选前缀
 * @returns Whether the pathname matches / 是否匹配
 */
function isUnderPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
