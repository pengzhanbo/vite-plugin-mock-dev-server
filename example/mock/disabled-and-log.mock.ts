import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * `enabled` and the per-item `log` level.
 *
 * `enabled: false` is dropped while the mock files are compiled, so the request
 * falls through to the Vite 404 response.
 *
 * `enabled` 与单个规则的 `log` 级别。
 *
 * `enabled: false` 的规则会在编译阶段被丢弃，因此请求会落到 Vite 的 404 响应。
 */
export default defineMock([
  {
    url: '/api/disabled',
    enabled: false,
    body: { shouldNotAppear: true },
  },
  {
    url: '/api/enabled',
    body: { enabled: true },
  },
  {
    url: '/api/log-silent',
    log: false,
    body: { log: 'silent' },
  },
  {
    url: '/api/log-debug',
    log: 'debug',
    body: { log: 'debug' },
  },
])
