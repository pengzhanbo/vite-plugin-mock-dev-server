import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * This file is excluded by the `exclude: ['ignored/**']` option, so the rule is
 * never loaded. Requesting `/api/ignored` returns 404 instead of being swallowed
 * by a global fallback.
 *
 * 该文件被 `exclude: ['ignored/**']` 配置排除，规则永远不会被加载。
 * 请求 `/api/ignored` 返回 404，而不是被全局兜底规则吞掉。
 */
export default defineMock({
  url: '/api/ignored',
  body: { ignored: true },
})
