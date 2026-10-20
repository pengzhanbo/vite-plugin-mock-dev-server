import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Wildcard fallback for the example's dedicated fallback namespace.
 *
 * It intentionally lives under `/api/fallback` instead of `/api{/*rest}`.
 * A global `/api` fallback would also swallow method mismatches and requests to
 * excluded/disabled mocks, hiding the 404 semantics users should see. Keeping the
 * fallback in its own namespace still demonstrates the wildcard rule without
 * masking real failures.
 *
 * 示例专用兜底命名空间中的通配规则。
 *
 * 它刻意放在 `/api/fallback` 下，而不是 `/api{/*rest}`。全局 `/api` 兜底会同时
 * 吞掉方法不匹配、excluded / disabled 规则的请求，掩盖用户本应看到的 404 语义。
 * 将兜底限制在独立命名空间，既能演示通配规则，又不会掩盖真实失败。
 */
export default defineMock({
  url: '/api/fallback{/*rest}',
  method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  body: {
    message: 'This request fallback',
  },
})
