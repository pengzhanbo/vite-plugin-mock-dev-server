# Example

Interactive feature playground of `vite-plugin-mock-dev-server`.

`vite-plugin-mock-dev-server` 的功能全景示例。

## 运行 / Run

```bash
# 1. 构建插件产物（example 通过 workspace 引用插件，mock 文件运行时需要 dist/helper）
# Build the plugin first (the example references the workspace package and mock
# files load the built /helper entry at runtime)
pnpm build

# 2. 启动示例
pnpm dev

# 3. 运行示例的端到端回归
pnpm example:test
```

打开 `http://localhost:5173`，仪表盘中的每个按钮对应一个功能场景。
Open `http://localhost:5173`; every button on the dashboard maps to a feature scenario.

## UI 技术栈 / UI Stack

- React 19 + React DOM 19（`src/main.tsx`、`src/App.tsx`）
- `@vitejs/plugin-react` 提供 JSX 与 Fast Refresh
- Tailwind CSS 4，通过 `@tailwindcss/vite` 接入（`src/index.css`）
- shadcn 风格组件位于 `src/components/ui/`，配置见 `components.json`
- `lucide-react` 图标、`class-variance-authority` / `clsx` / `tailwind-merge`

仪表盘卡片会展示请求方法、URL、query、headers、body、场景与补充说明；响应完成后通过
`X-File-Path` 定位 mock 文件，并提供打开编辑器 / 复制路径按钮。

- `/__proxy`：服务端重放场景请求，支持浏览器禁止设置的 `Cookie`、`Referer` 等请求头
- `/__open-in-editor`：通过 `launch-editor` 在本地 IDE 打开 mock 文件；优先使用 IDE 工作区
  相对路径，特殊布局可通过 `MOCK_IDE_ROOT` 指定工作区根目录

Cards show the request method, URL, query, headers, body, scene and scenario hints.
After a response, `X-File-Path` locates the exact mock file and exposes open / copy
actions. `/__proxy` replays forbidden headers server-side, while `/__open-in-editor`
opens the file through `launch-editor` using a workspace-relative path. Set
`MOCK_IDE_ROOT` if the editor workspace differs from the detected root.

## 场景清单 / Scenario Manifest

UI 与自动化测试共享同一份场景清单 [`src/scenarios.ts`](./src/scenarios.ts)：
仪表盘负责渲染按钮与结果，`__tests__/e2e/example.spec.ts` 负责执行同一份清单并断言。
因此新增一个场景时，UI 展示与回归覆盖会同步生效。

The dashboard and the automated specs share [`src/scenarios.ts`](./src/scenarios.ts).
Adding a scenario automatically covers both the UI and the regression suite.

同一规则的多方法对比（GET / POST / PUT）通过 `variants` 合并在同一张卡片中；
主请求和每个变体都会独立执行并断言，卡片内共享结果区域，便于直接比较。

Multi-method comparisons (GET / POST / PUT) use `variants` to stay in one card.
The primary request and every variant are executed and asserted independently, while
sharing the card's result area for direct comparison.

未命中的 mock 前缀由 [`plugins/api-404.ts`](./plugins/api-404.ts) 返回 JSON 404；
`/api/fallback{/*rest}` 只在独立命名空间演示通配兜底，不会掩盖方法不匹配、
excluded / disabled 规则的失败。

Unmatched mock prefixes return a JSON 404 from
[`plugins/api-404.ts`](./plugins/api-404.ts). `/api/fallback{/*rest}` only
demonstrates the wildcard fallback in its own namespace, so it never masks method
mismatches or excluded / disabled rules.

## 功能覆盖 / Feature Matrix

| 能力 / Capability                                               | 位置 / Where                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| 多文件格式 `ts/js/mjs/cjs/json/json5`                           | `mock/file-extension/`                                              |
| 正则 / 普通 prefix、exclude                                     | `plugin-options.ts`, `mock/ignored/`                                |
| `enabled: false`、单项 `log`                                    | `mock/disabled-and-log.mock.ts`                                     |
| 通配兜底（独立命名空间）、未匹配 404                            | `mock/fallback.mock.ts`, `plugins/api-404.ts`                       |
| method 匹配、方法不匹配 404（同卡片 GET/POST/PUT 对比）         | `mock/allow-method.mock.ts`, `mock/crud.mock.ts`                    |
| 动态 / 可选参数、通配符                                         | `mock/advanced-path.mock.ts`                                        |
| 静态优先、`priority.global` / `special`                         | `mock/advanced-path.mock.ts`, `plugin-options.ts`                   |
| query / params / body / headers / refererQuery / cookie         | `mock/request-extras.mock.ts`                                       |
| 对象 / 函数校验器                                               | `mock/validator-*.mock.ts`, `mock/request-extras.mock.ts`           |
| `bodyParserOptions` 解析上限                                    | `plugin-options.ts`, `mock/request-extras.mock.ts`                  |
| status / statusText                                             | `mock/response-extras.mock.ts`                                      |
| headers（静态 / 函数 / 异步）                                   | `mock/custom-header.mock.ts`, `mock/response-extras.mock.ts`        |
| cookies（静态 / 函数 / 签名 / 删除）                            | `mock/cookie.mock.ts`, `plugin-options.ts`                          |
| delay（数值 / 区间）                                            | `mock/delay.mock.ts`, `mock/response-extras.mock.ts`                |
| `type`（text / json / buffer / mime / 文件名）                  | `mock/response-extras.mock.ts`, `mock/buffer.mock.ts`               |
| 异步 body、Buffer、Readable 流                                  | `mock/response-extras.mock.ts`, `mock/file-download.mock.ts`        |
| `response` 中间件、`next()`、重定向                             | `mock/custom-response.mock.ts`, `mock/response-extras.mock.ts`      |
| 错误模拟（概率 / 状态 / statusText / body 函数）                | `mock/error-simulation.mock.ts`, `mock/error-status-text.mock.ts`   |
| scene、`activeScene`、`X-Mock-Scene`                            | `mock/scene.mock.ts`, `plugin-options.ts`                           |
| `defineMockData`（getter / setter / 共享）                      | `mock/data/`, `mock/crud.mock.ts`                                   |
| `createDefineMock`                                              | `mock/shared.ts`, `mock/post.mock.ts`                               |
| Vite `define` / `resolve.alias`                                 | `plugin-options.ts`, `mock/define-constants.mock.ts`                |
| SSE（comment / id / retry / 具名事件）                          | `mock/sse.mock.ts`                                                  |
| WebSocket（动态 URL / 广播 / query / cookie / onCleanup / 404） | `mock/ws.mock.ts`                                                   |
| 文件上传（formidable）                                          | `mock/file-upload.mock.ts`, `plugins/record-upstream.ts`            |
| 静态文件 / 文件下载                                             | `mock/static.mock.ts`, `mock/static/`, `mock/file-download.mock.ts` |
| CORS（白名单 / 预检 / 凭据）                                    | `plugin-options.ts`                                                 |
| 录制 / 回放                                                     | `plugin-options.ts`, `plugins/record-upstream.ts`                   |
| 构建独立 mock 服务                                              | `plugin-options.ts` 中的 `build`，产物位于 `dist/mockServer/`       |

## 录制 / 回放说明 / Record & Replay

示例通过 `plugins/record-upstream.ts` 启动一个本地上游服务（默认端口 `9010`，
可用 `MOCK_UPSTREAM_PORT` 覆盖），并将 `/api-record` 代理到该服务：

- 同一个 token 的首次请求会透传到上游，响应写入 `mock/.recordings/`；
- 之后的请求由录制数据回放，响应头会出现 `X-File-Path`；
- 录制目录由插件自动添加 `.gitignore`，不会误提交。

The example starts a local upstream (port `9010`, override with
`MOCK_UPSTREAM_PORT`) and proxies `/api-record` to it. The first request of a token
is recorded into `mock/.recordings/`; later requests are replayed and expose
`X-File-Path`. The plugin adds a `.gitignore` to the recording directory.
