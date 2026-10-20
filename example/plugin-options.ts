import type { ServerOptions } from 'vite'
import type { MockServerPluginOptions } from 'vite-plugin-mock-dev-server'
/**
 * Shared plugin configuration of the example.
 *
 * The Vite config and the end-to-end specs import this module, so the specs always
 * exercise the very same options as `pnpm dev` instead of a duplicated copy.
 *
 * 示例共享的插件配置。
 *
 * Vite 配置与端到端用例共享该模块，避免用例中维护一份与 `pnpm dev` 不一致的配置副本。
 */
import path from 'node:path'
import process from 'node:process'

/**
 * Root directory of the example project
 *
 * 示例项目根目录
 */
export const exampleRoot: string = import.meta.dirname

/**
 * Port of the demo upstream used by the record / replay scenario
 *
 * 录制 / 回放场景使用的演示上游服务端口
 */
export const RECORD_UPSTREAM_PORT: number = Number(process.env.MOCK_UPSTREAM_PORT) || 9010

/**
 * Allowed CORS origins of the example
 *
 * 示例允许的 CORS 来源
 */
export const exampleCorsOrigin: RegExp =
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/

/**
 * Plugin options used by the example
 *
 * 示例使用的插件配置
 */
export const mockServerOptions: MockServerPluginOptions = {
  // 显式指定示例根目录，保证从仓库根目录或其他进程启动时 mock / record / build
  // 仍然以 example 为基准。
  // Pin the example root so mock / record / build resolve correctly even when Vite
  // is started from another working directory.
  cwd: exampleRoot,
  // `^/api-dev/` 演示正则形式的 prefix；`/api`、`/static`、`/wildcard` 演示普通前缀。
  // `/api` 只作为 mock 前缀，不配置 `server.proxy`，未命中的请求才能自然返回 404，
  // 而不是被代理到无效 target 变成 502。
  // `^/api-dev/` demonstrates the RegExp form of `prefix`; `/api`, `/static` and
  // `/wildcard` demonstrate plain prefixes. `/api` is a mock-only prefix without a
  // `server.proxy` entry so unmatched requests fall through to Vite's 404 instead of
  // being proxied to an invalid target and turning into 502.
  prefix: ['^/api-dev/', '/api', '/static', '/wildcard'],
  wsPrefix: ['/socket.io'],
  log: 'debug',
  reload: true,
  // 演示 exclude：`mock/ignored/` 下的规则不会加载
  // Demonstrates `exclude`: rules under `mock/ignored/` are never loaded
  exclude: ['ignored/**'],
  // 演示 cookies 签名
  // Demonstrates signed cookies
  cookiesOptions: { keys: ['vite-plugin-mock-dev-server-example'] },
  // 演示请求体解析上限（超出上限的请求体会解析失败）
  // Demonstrates the request body parse limit (an oversized body fails to parse)
  bodyParserOptions: { jsonLimit: '64kb', formLimit: '64kb', textLimit: '64kb' },
  // 演示 CORS：仅允许本地来源，并暴露插件内置响应头
  // Demonstrates CORS: only local origins are allowed and the plugin headers are exposed
  cors: {
    origin: exampleCorsOrigin,
    credentials: true,
    exposedHeaders: ['X-Mock-Power-By', 'X-File-Path', 'X-Response-Time'],
  },
  // 演示 activeScene：默认激活 `test` 场景，可通过 `X-Mock-Scene` 请求头覆盖
  // Demonstrates `activeScene`: the `test` scene is active by default and can be
  // overridden per request through the `X-Mock-Scene` header
  activeScene: ['test'],
  // 演示 priority.global 与 priority.special：
  // - global 让指定规则在全局范围内优先于默认排序
  // - special 在请求 /api/priority/special/a/b/c 时提升参数更靠前的规则
  // Demonstrates `priority.global` and `priority.special`:
  // - `global` promotes the rule over the default order globally
  // - `special` promotes the rule with the earlier parameter for
  //   /api/priority/special/a/b/c
  priority: {
    global: ['/api/priority/global/:first/b/c'],
    special: {
      '/api/priority/special/:first/b/c': ['/api/priority/special/a/b/:third'],
    },
  },
  formidableOptions: {
    // 配置上传资源存放目录
    uploadDir: path.join(exampleRoot, 'uploads'),
  },
  // 演示录制 / 回放：仅录制 /api-record 前缀的请求
  // Demonstrates record / replay: only requests under `/api-record` are recorded
  record: {
    enabled: true,
    dir: '.recordings',
    status: [200, 201],
    filter: {
      mode: 'glob',
      include: ['/api-record/**'],
    },
  },
  build: {
    serverPort: 8090,
    includeRecord: true,
  },
}

/**
 * Vite `define` entries used by the example
 *
 * 示例使用的 Vite `define` 变量
 *
 * @param isDevelopment - Whether the current mode is development / 是否为开发模式
 * @returns Define entries / define 配置
 */
export function createExampleDefine(isDevelopment: boolean): Record<string, string> {
  return {
    __IS_DEVELOPMENT__: JSON.stringify(isDevelopment),
  }
}

/**
 * Vite resolve alias entries used by the example
 *
 * 示例使用的 Vite alias 配置
 */
export const exampleAlias: Record<string, string> = {
  '@mock-shared': path.join(exampleRoot, 'mock/shared'),
}

/**
 * Proxy entries used by the example
 *
 * 示例使用的代理配置
 *
 * 只有 `/api-record` 需要转发到真实上游。其余 `/api` 请求由插件的 `prefix`
 * 拦截；未命中任何 mock 时自然落到 Vite 的 404。
 *
 * Only `/api-record` needs a real upstream. Other `/api` requests are intercepted
 * by the plugin `prefix`; when no mock matches they fall through to Vite's 404.
 */
export const exampleProxy: NonNullable<ServerOptions['proxy']> = {
  '/api-record': {
    target: `http://127.0.0.1:${RECORD_UPSTREAM_PORT}`,
    changeOrigin: true,
  },
}
