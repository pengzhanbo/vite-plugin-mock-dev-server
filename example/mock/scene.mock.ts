import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Scene mocks.
 *
 * `activeScene: ['test']` is configured in `plugin-options.ts`, so `/api/scene`
 * returns the `test` scene by default. The `X-Mock-Scene` request header overrides
 * the configured scene for a single request.
 *
 * 场景 mock。
 *
 * `plugin-options.ts` 中配置了 `activeScene: ['test']`，因此 `/api/scene`
 * 默认返回 `test` 场景；`X-Mock-Scene` 请求头可以按请求覆盖该配置。
 */
export default defineMock([
  // Universal fallback: always active
  // 通用兜底：始终激活
  {
    url: '/api/scene',
    body: {
      scene: 'universal',
      activeScene: 'none matched',
    },
  },
  {
    url: '/api/scene',
    scene: 'test',
    body: {
      scene: 'test',
      data: { visible: true },
    },
  },
  {
    url: '/api/scene',
    scene: 'demo',
    body: {
      scene: 'demo',
      data: { curated: true },
    },
  },
  {
    url: '/api/scene',
    scene: ['admin', 'demo'],
    body: {
      scene: 'admin or demo',
      data: { privileged: true },
    },
  },
])
