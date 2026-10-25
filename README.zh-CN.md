# vite-plugin-mock-dev-server

<br>
<br>
<p align="center">
  <b>vite mock开发服务（mock-dev-server）插件。</b>
</p>

<p align="center">在 vite 开发环境中，注入一个 mock-dev-server。</p>

<br>
<p align="center">
<a href="https://www.npmjs.com/package/vite-plugin-mock-dev-server"><img alt="npm" src="https://img.shields.io/npm/v/vite-plugin-mock-dev-server?style=flat-square"></a>
<img alt="node-current" src="https://img.shields.io/node/v/vite-plugin-mock-dev-server?style=flat-square">
<img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/vite-plugin-mock-dev-server/peer/vite?style=flat-square">
<img alt="npm" src="https://img.shields.io/npm/dm/vite-plugin-mock-dev-server?style=flat-square">
<br>
<img alt="package esm only" src="https://img.shields.io/badge/package-ESM--only-ffe536.svg">
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/pengzhanbo/vite-plugin-mock-dev-server/release.yaml?style=flat-square">
<a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_shield"><img alt="fossa status" src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=shield"></a>
</p>
<br>
<p align="center">
<a href="/README.md">English</a> | <span>简体中文</span>
</p>
<br>
<br>

## 特性

- ⚡️ 轻量，灵活，快速
- 🧲 非注入式，对客户端代码无侵入
- 💡 ESModule
- 🦾 Typescript
- 🔥 热更新
- 🏷 支持 `.[cm]?js` / `.ts` / `.json` / `.json5` 编写 mock 数据
- 📦 自动加载 mock 文件
- 🎨 可选择你喜欢的任意用于生成mock数据库，如 `mockjs`，或者不使用其他库
- 📥 路径规则匹配，请求参数匹配
- ⚙️ 随意开启或关闭对某个接口的 mock配置
- 📀 支持多种响应体数据类型，包括 `text/json/buffer/stream`.
- ⚖️ 使用 `server.proxy` 配置
- 🍕 支持在 mock文件中使用 `viteConfig.define`配置字段 和 `env` 环境变量
- ⚓️ 支持在 mock文件中使用 `viteConfig.resolve.alias` 路径别名
- 🌈 支持 `vite preview` 模式
- 📤 支持 multipart 类型，模拟文件上传
- 📥 支持模拟文件下载
- ⚜️ 支持模拟 `WebSocket` 和 `Server-Sent Events`
- 🎭 支持按场景切换 mock 数据
- 🎲 支持对 mock 进行随机错误模拟
- 📝 支持 **请求录制** 和 **请求回放**
- 🗂 支持构建可独立部署的小型mock服务

## 文档

查看 [Documentation](https://vite-plugin-mock-dev-server.netlify.app/zh/) 了解更多。

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

> [!IMPORTANT]
> 插件不再支持 `CommonJS` 导入使用，请使用 `ESModule` 导入插件

---

> [!IMPORTANT]
> 当前文档为插件的 `v2` 版本，如果您正在使用 `v1` 版本，请参考 [迁移文档](https://vite-plugin-mock-dev-server.netlify.app/zh/guide/migrate-v2)

## 安装

```sh
# npm
npm i -D vite-plugin-mock-dev-server
# yarn
yarn add vite-plugin-mock-dev-server
# pnpm
pnpm add -D vite-plugin-mock-dev-server
```

> [!NOTE]
>
> - 需要 Node.js `^20.19.0 || >=22`，Vite `>=5`。
> - mock 文件由 [`rolldown`](https://rolldown.rs/)（已安装时优先使用）或 [`esbuild`](https://esbuild.github.io/) 进行打包。

## 使用

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [mockDevServerPlugin()],
  // 这里定义的字段，在mock中也能使用
  define: {},
  server: {
    // 插件将会读取 `server.proxy`
    proxy: {
      '^/api': { target: 'http://example.com' },
    },
  },
})
```

插件会对路径匹配 `server.proxy` 中的键（WebSocket 代理除外）或 `options.prefix` 中任意一项的请求启用 mock 匹配。

`WebSocket Mock` 仅使用 `options.wsPrefix` 进行匹配。插件会将 `wsPrefix` 中的项从 `server.proxy` 中移除，避免 Vite 的 WebSocket 代理与 mock WebSocket 服务产生冲突。

```ts
export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      wsPrefix: ['/socket.io'],
    }),
  ],
})
```

插件也会读取 `define`、`resolve.alias` 以及 `env` 配置，支持在 mock 文件中直接使用。

## 编写mock文件

默认配置，在你的项目根目录的 `mock` 目录中编写mock数据：

`mock/**/*.mock.ts` :

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user/:id',
  body: { a: 1, b: 2 },
})
```

一个 mock 文件可以默认导出一个 mock 配置项、一个配置项数组（推荐），或者一个值为配置项的对象。`defineMock()` 仅是一个类型帮助函数，会原样返回配置。

```ts
export default defineMock([
  { url: '/api/users', body: [] },
  { url: '/api/users/:id', body: ({ params }) => ({ id: params.id }) },
])
```

mock 文件由 `rolldown` / `esbuild` 打包，因此可以使用 TypeScript、ESM 语法、`node:` 内置模块以及第三方依赖；`viteConfig.define`、`viteConfig.env` 和 `viteConfig.resolve.alias` 也会被注入。

mock 文件以及它引用的本地文件都会被监听。修改后只会重新编译受影响的规则；如果希望更新后刷新页面，请将 [`reload`](#reload) 设置为 `true`。

`.json` / `.json5` mock 文件仅支持静态数据，不能使用 `body(request)`、`response` 等函数字段。

## 方法

### mockDevServerPlugin(options)

Vite 插件。它返回一个插件数组（`Plugin[]`）；当 `options.enabled` 为 `false` 时返回空数组，mock 服务不会启用。

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [mockDevServerPlugin({/* 插件配置 */})],
})
```

### defineMock(mockOptions)

Mock 配置类型帮助函数。支持单个配置项、配置项数组，或者值为配置项的对象。

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {},
})
```

### createDefineMock(transformer)

返回一个自定义的 defineMock 函数，用于支持对 mock config 的预处理。

`transformer` 会接收每一个配置项，可以原地修改或返回一个新的配置项；传入数组时会对每一项都执行。

```ts
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

// 预处理 mock url
const defineAPIMock = createDefineMock((mock) => {
  mock.url = path.join('/api', mock.url)
})

export default defineApiMock({
  url: '/test', // 补全为 '/api/test'
})
```

### defineMockData(key, initialData, options)

创建一个可被所有 mock 文件共享的数据源，详见 [共享 Mock 数据](#共享-mock-数据)。

### createSSEStream(req, res)

创建一个 `Server-sent events` 写入流，用于支持模拟 `EventSource`。

`sse.write()` 接受 `{ data, event, id, retry, comment }`，对象类型的 `data` 会被序列化为 JSON。流结束时请调用 `sse.end()`。

```ts
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/sse',
  response: (req, res) => {
    const sse = createSSEStream(req, res)
    sse.write({ event: 'message', data: { message: 'hello world' } })
    sse.end()
  },
})
```

### 类型

公共类型（`MockServerPluginOptions`、`MockHttpItem`、`MockWebsocketItem`、`MockOptions`、`MockRequest`、`MockResponse`、`FormidableFile` 等）均从包根导出，也可以从 `vite-plugin-mock-dev-server/types` 子路径导入。

## Plugin Options

### enabled

- **类型：** `boolean`
- **默认值：** `true`
- **详情：**

  是否开启 mock 服务。如果设置为 `false`，插件不会注册（返回空数组），mock 服务将不会生效。

### prefix

- **类型：** `string | string[]`
- **默认值：** `[]`
- **详情：**

  为mock服务器配置自定义匹配规则。任何请求路径以 `prefix` 值开头的请求将被代理到对应的目标。如果 `prefix` 值以 `^` 开头，将被识别为 RegExp。

  > 一般情况下, `server.proxy` 已经足够满足需求，添加此项是为了与某些场景兼容。

### wsPrefix

- **类型：** `string | string[]`
- **默认值：** `[]`
- **详情：**

  配置 webSocket 服务 匹配规则。任何请求路径以 `wsPrefix` 值开头的 `ws/wss` 协议请求，将被代理到对应的目标。
  如果`wsPrefix`值以 `^` 开头,将被识别为 RegExp。

  > 与 http mock 默认使用 `viteConfig.server.proxy` 不同的是，`websocket mock` 不会使用 `viteConfig.server.proxy` 中的 ws 相关的配置，且配置在 `wsPrefix` 中的规则，不能同时配置在 `viteConfig.server.proxy`中，因为会导致在 vite 在启动服务时产生冲突，因为不能对同一个请求实现多个的 `WebSocketServer`实例。
  > 该冲突既不是 `vite` 的问题，也不是插件的问题，这属于合理的错误类型。在进行 `WebSocket Mock`和 `WebSocket Proxy` 切换时，请注意配置不要出现重复导致冲突。
  >
  > 为避免冲突，插件会在 Vite 服务启动前将 `wsPrefix` 中的项从 `server.proxy` 中移除。`server.proxy` 中声明了 `ws: true` 的代理也不会参与 mock 匹配（HTTP 与 WebSocket 均不使用）。

### cwd

- **类型：** `string`
- **默认值：** `process.cwd()`
- **详情：**

  配置 `include` 和 `exclude` 的匹配上下文

### dir

- **类型：** `string`
- **默认值：** `'mock'`
- **详情：**

  配置mock数据的目录，相对于 `cwd`

### include

- **类型：** `string | string[]`
- **默认值：** `['**/*.mock.{js,ts,cjs,mjs,json,json5}']`
- **详情：**

  配置读取 mock文件，可以是一个 目录，glob，或者一个数组。

  以 `!` 开头的模式会被视为排除规则，`node_modules` 中的文件始终会被忽略。

### exclude

- **类型：** `string | string[]`
- **默认值：** `[]`
- **详情：**

  配置读取 mock文件时，需要排除的文件， 可以是一个 目录、glob、或者一个数组。`node_modules` 中的文件始终会被忽略，即使没有在此列出。

### reload

- **类型：** `boolean`
- **默认值：** `false`
- **详情：**

  mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。当你希望每次修改mock文件都刷新页面时，可以打开此选项。

### awaitInitialLoad

- **类型：** `boolean`
- **默认值：** 测试环境（`NODE_ENV=test`、Vitest 或 Jest）下为 `true`，其他环境为 `false`
- **详情：**

  是否在开发服务器开始处理请求之前，等待初始 mock 文件编译完成。

  默认情况下 mock 文件在后台编译，冷启动后的首批请求可能早于编译完成，从而穿透到真实代理（或返回 404）。开启该选项后，服务器会等待所有 mock 文件加载完成后再开始服务，代价是启动时间随 mock 文件数量增加。对于在服务器创建后立即发起请求的集成场景（如端到端测试中的 `page.goto`）很有帮助。

  中间件会在等待之前注册，因此在初始加载期间到达的请求仍会经过 mock 层。

### activeScene

- **类型：** `string | string[]`
- **默认值：** `[]`
- **详情：**

  当前激活的场景，用于过滤 mock。

  只有 [`scene`](#optionsscene) 与此有交集的 mock（或未配置 `scene` 的 mock）才会被考虑匹配。可通过 `X-Mock-Scene` 请求头按请求覆盖。

### cors

- **类型：** `boolean | CorsOptions`
- **默认值：** `true`
- **详情：**

  默认启用，配置 `cors` 查看 [cors](https://github.com/expressjs/cors#configuration-options)。

  插件会继承 Vite 的 `server.cors` 配置，插件 `cors` 与 `server.cors` 中任一显式设置为 `false` 时都会关闭 CORS。当继承的配置没有限制来源（`server.cors` 为 `true` 或未配置 `origin`）时，mock 响应默认仅允许 Vite 的 localhost 来源（`localhost`、`127.0.0.1`、`[::1]`），而不是允许所有来源；需要允许其他来源时请显式配置 `origin`（如 `origin: '*'`）。

  当路径下存在支持预检方法（`Access-Control-Request-Method`）且场景匹配的 mock 时，CORS 预检请求（`OPTIONS`）由插件响应，否则交给后续中间件处理。

### log

- **类型：** `boolean | 'info' | 'warn' | 'error' | 'silent' | 'debug'`
- **默认值：** `'info'`
- **详情：**

  启动日志，以及配置日志打印级别。`false` 等价于 `'silent'`。

### formidableOptions

- **类型：** `formidable.Options`
- **详情：**

  配置 `formidable`，查看 [formidable options](https://github.com/node-formidable/formidable#options)

  **示例：** 配置文件上传的存放目录

  ```ts
  mockDevServerPlugin({
    formidableOptions: {
      uploadDir: path.join(process.cwd(), 'uploads'),
    },
  })
  ```

### cookiesOptions

- **类型：** `CookiesOption`
- **详情：**

  配置 `cookies`, 查看 [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

### bodyParserOptions

- **类型：** `BodyParserOptions`
- **详情：**

  配置 `co-body`, 查看 [co-body](https://github.com/cojs/co-body#options)。

  `co-body` 的 `limit` / `jsonLimit` / `formLimit` / `textLimit` 只在请求体被完整缓冲后才生效，无法保护 dev server 的内存。`maxBodySize`（默认 `'50mb'`，配置为 `0` 表示不限制）会在读取原始请求体时校验大小，超出后直接以 `413 Payload Too Large` 结束请求；实际取该项与对应 `co-body` 限制中较小的值。

  ```ts
  mockDevServerPlugin({
    bodyParserOptions: {
      jsonLimit: '10mb',
      // 原始请求体上限，超出返回 413；0 表示不限制
      maxBodySize: '32mb',
    },
  })
  ```

### build

- **类型：** `boolean | ServerBuildOptions`
- **默认值：**`false`
- **详情：**

  需要构建可独立部署的小型mock服务时配置。

  ```ts
  interface ServerBuildOption {
    /**
     * 服务端口
     * @default 8080
     */
    serverPort?: number
    /**
     * 构建输出目录，相对路径时基于 Vite 的 `build.outDir`
     * @default 'mockServer'
     */
    dist?: string

    /**
     * 日志级别
     * @default 'error'
     */
    log?: LogLevel

    /**
     * 是否将录制文件打包到构建产物中。
     * 该选项独立于 `record.enabled`，仅开启回放时也可以包含已有录制。
     * @default 跟随解析后的 `replay` 配置（未设置 `replay` 时取 `record.enabled`）
     */
    includeRecord?: boolean
  }
  ```

  生成的 mock 服务默认监听 `serverPort`；启动时 `PORT` 环境变量会覆盖端口，`HOST` 用于指定监听地址（默认监听所有网卡）。

  无法被序列化的配置（如 `RegExp` / 函数形式的 `cors.origin`，或 `formidableOptions` 中的函数）会在构建期输出警告，并在生成的 mock 服务中被忽略。配置的 `formidableOptions.uploadDir` 会被重定位到产物目录下的同名目录，保证产物可移植。

### record

- **类型：** `false | RecordOptions`
- **默认值：** `false`
- **详情：**

  是否开启请求录制功能。开启后，插件会记录所有请求数据，用于后续的请求回放。

  插件在 `vite.server.proxy` 的基础上，记录被 `http-proxy` 代理的请求数据（仅非 WebSocket 代理）。在获得响应后，插件会将请求数据和响应数据写入指定的目录。

  录制数据以格式化后的 JSON 保存，每个请求路径一个文件（如 `mock/.recordings/api-users-1a2b3c4d.json`，后缀为路径的短哈希）。默认会在录制目录中生成内容为 `*` 的 `.gitignore`，可通过 `gitignore: false` 关闭。

  压缩的文本响应（`gzip` / `deflate` / `br` / `zstd`）会在保存前解压，保证录制数据可读。`zstd` 在 Node.js `>=22.15` 使用内置 `zlib`，否则需要安装可选的 `zstd-codec` 依赖。

  ````ts
  interface RecordOptions {
    /**
     * 是否启用录制功能
     * - true: 启用，自动录制 proxy 响应
     * - false: 禁用（默认）
     * @default false
     */
    enabled?: boolean
    /**
     * 过滤要录制的请求
     * - 函数：自定义过滤函数，返回 true 表示录制
     * - 对象：包含/排除模式，支持 glob 或 path-to-regexp 模式
     * @example
     * ```ts
     * // Record all requests
     * filter: (req) => true
     * // Record requests using glob pattern
     * filter: { mode: 'glob', include: '/api/**' }
     * // Record requests using path-to-regexp pattern
     * filter: { mode: 'path-to-regexp', include: '/api/:id' }
     * ```
     */
    filter?:
      | ((req: RecordedReq) => boolean)
      | {
          /**
           * 包含需要录制的请求链接
           *
           * glob 模式或 path-to-regexp 模式
           * (使用 mode 选项设置模式，默认为 glob)
           *
           * 省略时包含所有请求，仅由 `exclude` 排除。
           */
          include?: string | string[]
          /**
           * 排除不需要录制的请求链接
           *
           * glob 模式或 path-to-regexp 模式
           * (使用 mode 选项设置模式，默认为 glob)
           */
          exclude?: string | string[]
          /**
           * 包含/排除模式的匹配模式
           * - 'glob': glob 模式匹配（默认）
           * - 'path-to-regexp': path-to-regexp 模式匹配
           */
          mode: 'glob' | 'path-to-regexp'
        }
    /**
     * 录制数据存储目录
     * 相对于 `dir` 配置（默认 `mock`）
     * @default 'mock/.recordings'
     */
    dir?: string

    /**
     * 是否覆盖已有录制数据
     * - true: 相同请求覆盖旧数据（默认）
     * - false: 保留旧数据，不录制新数据
     * @default true
     */
    overwrite?: boolean
    /**
     * 录制数据过期时间（秒）
     * - 0: 永不过期（默认）
     * - 正数：指定秒数后过期
     * @default 0
     */
    expires?: number

    /**
     * 要录制的状态码
     * - 为空数组时记录所有状态码（默认）
     * - 指定一个或多个状态码进行过滤
     * @default []
     */
    status?: number | number[]

    /**
     * 是否在录制目录中添加 .gitignore
     * - true: 添加（默认）
     * - false: 不添加
     * @default true
     */
    gitignore?: boolean
  }
  ````

### replay

- **类型：** `boolean`
- **默认值：** `false`（当 `record.enabled` 为 `true` 时自动为 `true`；显式设置为 `false` 可关闭）
- **详情：**

  是否开启请求回放功能。开启后，插件会根据记录的请求数据，模拟响应。

  仅当没有任何 mock 规则命中请求时才会使用回放。过期的录制数据（`record.expires`）会被忽略；未配置 `record.status` 时优先使用状态码为 `200` 的记录。

  回放独立于录制，`replay: true` 可与 `record: { enabled: false }` 组合使用以复用已有的录制数据。录制关闭时，插件会在启动时输出警告。

### priority

- **类型：** `MockMatchPriority`
- **详情：**

  自定义 路径匹配规则优先级。[查看更多](#自定义匹配优先级)

  **默认值：** `undefined`

## Mock 配置

**http mock**

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock({
  url: '/api/test',
  body: { message: 'hello world' },
})
```

**websocket mock**

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock({
  url: '/socket.io',
  ws: true,
  setup(wss) {
    wss.on('connection', (ws, req) => {
      console.log('connected')
    })
  },
})
```

### options.url

- **类型：** `string`
- **详情：**

  需要进行 mock 的接口地址, 由 [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) 提供路径匹配支持。

  ```txt
  /api/login
  /api/post/:id
  /api/users{/:id}    # 可选路径段
  /api/files/*path    # 通配符
  ```

  `url` 中携带的 query（如 `/api/test?a=1`）会被解析到该 mock 的 [`validator.query`](#optionsvalidator) 中。

  当多条规则同时匹配同一个请求时，静态规则优先于动态规则，参数越少的规则越优先，通配符规则的优先级最低。

### options.enabled

- **类型：** `boolean`
- **默认值：** `true`
- **详情：**

  是否启动对该接口的mock，在多数场景下，我们仅需要对部分接口进行 mock，
  而不是对所有配置了mock的请求进行全量mock，所以是否能够配置是否启用很重要

### options.log

- **类型：** `boolean | 'info' | 'warn' | 'error' | 'silent' | 'debug'`
- **默认值：** 跟随插件的 [`log`](#log) 配置
- **详情：**

  单独配置该 mock 的日志级别，适用于需要静默高频请求的 mock。

### options.scene

- **类型：** `string | string[]`
- **默认值：** `''`
- **详情：**

  该 mock 的场景标识。

  未配置时，该 mock 为全场景通用，不受 [activeScene](#activescene) 限制。
  配置后，只有 `scene` 中任意一项与 [activeScene](#activescene) 或 `X-Mock-Scene` 请求头中任意一项匹配时，该 mock 才会激活。

  对于相同的 `url`，配置了 `scene` 的 mock 会优先于未配置 `scene` 的 mock 进行匹配，因此场景匹配优先于通用 mock 的 validator。

### options.method

- **类型：** `Method | Method[]`

  ```ts
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'
  ```

- **默认值：** `['GET', 'POST']`
- **详情：**

  该接口允许的请求方法。方法名不区分大小写（`'get'` 等价于 `'GET'`），传入空数组时回退为默认值。

### options.type

- **类型：** `'text' | 'json' | 'buffer' | string`
- **默认值：** `'json'`
- **详情：**

  响应体数据类型，决定响应的 `Content-Type`，还支持 [mime-db](https://github.com/jshttp/mime-db) 中包含的类型。

  当响应体返回的是一个文件，而你不确定应该使用哪个类型时，可以将文件名作为值传入，
  插件内部会根据文件名后缀查找匹配的`content-type`。对于 `a.ts` 这类 TypeScript 文件，请传入 `a.js`，否则可能无法正确识别为 JavaScript 文件。

### options.headers

- **类型：** `object | (request: MockRequest) => object | Promise<object>`
- **默认值：** `{ 'Content-Type': <由 type 解析> }`
- **详情：**

  配置响应体 headers，函数形式支持异步返回。

  插件始终会设置由 [`type`](#optionstype) 解析出的 `Content-Type`，以及 `Cache-Control: no-cache, max-age=0`、`X-Mock-Power-By: vite-plugin-mock-dev-server`、`X-File-Path`（mock 文件路径）；`headers` 返回的值会覆盖它们。非法的 header 名称或值会记录日志并跳过。

### options.status

- **类型：** `number`
- **默认值：** `200`
- **详情：**

  配置 响应头状态码

### options.statusText

- **类型：** `string`
- **默认值：** 根据 `status` 解析（如 `200` 为 `OK`、`404` 为 `Not Found`）
- **详情：**

  配置响应头状态文本

### options.delay

- **类型：** `number | [number, number]`
- **默认值：** `0`
- **详情：**

  配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围。

  延迟从请求开始时计时，请求解析阶段已消耗的时间会从本次延迟中扣除；若解析耗时已经超过配置的延迟（数组形式为范围上限），则直接响应。非法值（负数、`min > max`、非法数组）会在编译阶段被归一化或忽略，并输出警告。

  单位： `ms`

### options.body

- **类型：** `Body | (request: MockRequest) => Body | Promise<Body>`

  ```ts
  type Body = string | number | object | any[] | Buffer | Readable | null
  ```

- **详情：**

  配置响应体数据内容 `body` 优先级高于 `response`。

  当 `type` 为 `buffer` 时，内容会被转换为 `Buffer`；传入 `Readable` 流时会管道写入响应，用于模拟文件下载。

### options.response

- **类型：** `(req: MockRequest, res: MockResponse, next: (err?: any) => void) => void | Promise<void>`
- **详情：**

  如果需要设置复杂的响应内容，可以使用 response 方法，
  该方法是一个 middleware，你可以在这里拿到 http 请求的 req、res等信息，
  然后通过 `res.write() | res.end()` 返回响应数据， 否则需要执行 `next()` 方法。
  在 `req` 中，还可以拿到 `query、params、body, refererQuery` 等已解析的请求信息。

  `response` 中抛出的错误会记录日志并中止当前响应，不会导致 dev server 崩溃。

### options.cookies

- **类型：** `CookiesOptions | (request: MockRequest) => CookiesOptions | Promise<CookiesOptions>`

  ```ts
  type CookiesOptions = Record<string, CookieValue>

  type CookieValue = string | [string, SetCookieOption]
  ```

- **详情：**

  配置响应体 cookies。数组形式为 `[value, options]`，其中 `options` 是 [`cookies` 的 set 配置](https://github.com/pillarjs/cookies#cookiessetname--values--options)。非法的 cookie 名称或配置会记录日志并跳过，不影响其他 cookie 与本次响应。

### options.validator

- **类型：** `Validator | (request: MockRequest) => boolean`

  ```ts
  interface Validator {
    /**
     * 请求地址中位于 `?` 后面的 queryString，已解析为 json
     */
    query: Record<string, any>
    /**
     * 请求 referer 中位于 `?` 后面的 queryString
     */
    refererQuery: Record<string, any>
    /**
     * 请求体中 body 数据
     */
    body: Record<string, any>
    /**
     * 请求地址中，`/api/id/:id` 解析后的 params 参数
     */
    params: Record<string, any>
    /**
     * 请求头 headers
     */
    headers: Headers
  }
  ```

- **详情：**

  请求验证器

  有时候，一个相同的API请求，需要根据不同的请求参数，来决定返回数据，
  但全部都在单个 mock中的 body或者 response 中写，内容会很庞杂，不好管理，
  验证器的功能，允许你同时配置多条相同url的mock，通过验证器来判断使哪个mock生效。

  所有字段都是可选的。对象形式的 validator 执行的是深度子集比较，只比较声明了的字段（及嵌套字段），header 名称不区分大小写。对于数组，声明的项只需存在于请求数组中（包含关系，与顺序无关）。`url` 中携带的 query（如 `/api/test?a=1`）会被合并到 `validator.query`。函数形式的 validator 接收请求并返回布尔值。

  validator 抛出异常时会记录日志并视为不匹配，继续尝试下一条规则，而不是让请求失败。

  对于相同的 URL，匹配顺序为：带 `scene` 的 mock、函数形式的 validator、对象形式的 validator（key 越多越优先），最后是未配置 validator 的兜底 mock。

### options.ws

- **类型：** `boolean`
- **默认值：** `false`
- **详情：**

  配置是否开启 WebSocket Mock。`ws: true` 的配置项由 mock WebSocket 服务处理（HTTP 响应字段会被忽略），`scene` 与匹配优先级规则同样生效，且请求路径必须被 [`wsPrefix`](#wsprefix) 覆盖。

### options.setup

- **类型：** `(wss: WebSocketServer, ctx: WebSocketSetupContext) => void`
- **是否必填：** 当 `ws` 为 `true` 时必填
- **详情：**

  配置 Websocket Server。mock 文件更新后 `setup()` 会被重新执行，请使用 `onCleanup()` 清理上一次创建的定时器与监听器。

```ts
interface WebSocketSetupContext {
  /**
   * 当你在定义 WSS 时，可能会执行一些自动任务或循环任务，
   * 但是当热更新时，插件内部会重新执行 setup() ，
   * 这可能导致出现 重复注册监听事件 和 循环任务如 `setTimeout` 等。
   * 通过 `onCleanup()` 可以来清除这些自动任务或循环任务。
   */
  onCleanup: (cleanup: () => void) => void
}
```

### options.error

- **类型：** `MockErrorConfig | undefined`
- **详情：**

  配置错误模拟，包括错误概率、错误状态码、错误状态文本、以及自定义错误响应体。

```ts
interface MockErrorConfig {
  /**
   * 错误概率（0-1），默认 0.5
   * @default 0.5
   */
  probability?: number
  /**
   * 错误状态码，默认 500
   * @default 500
   */
  status?: number
  /**
   * 错误状态文本
   */
  statusText?: string
  /**
   * 自定义错误响应体，适用于 status 为 200，但响应体需要模拟错误场景
   * @example
   * { code: 500, msg: 'Internal Server Error', result: null }
   */
  body?: ResponseBody | ResponseBodyFn
}
```

### Request/Response 增强

当你配置 `headers`, `body`, and `response` 的函数形式时, 插件在参数 `request` 和 `response` 添加了新的内容用于帮助获取必要的数据.

**Request:**

`request`的原始数据类型是[`Connect.IncomingMessage`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/connect/index.d.ts). 插件在此基础上，增加了 `query`, `params`, `body`, `refererQuery`，以及 `getCookie(name)` 方法用于获取cookie信息。

```ts
type Request = Connect.IncomingMessage & {
  query: object
  params: object
  body: any
  refererQuery: object
  headers: Headers
  getCookie: (name: string, option?: GetCookieOption) => string | void
}
```

请求体会根据 `Content-Type` 解析：`application/json`、`application/x-www-form-urlencoded`、`text/plain`，以及 `multipart/form-data`（由 `formidable` 处理，文件以 `formidable.File` 形式提供）。超过 [`bodyParserOptions.maxBodySize`](#bodyparseroptions) 的请求会返回 `413`。

**Response:**

`response` 的原始数据类型是`http.ServerResponse<http.IncomingMessage>`. 插件在此基础上增加了 `setCookie(name, value, option?)` 方法用于设置cookie

```ts
type Response = http.ServerResponse<http.IncomingMessage> & {
  setCookie: (name: string, value: string, option?: SetCookieOption) => void
}
```

使用 `response(req, res, next)` 时，需要自行结束响应（`res.end()`）或调用 `next()`。

> **注意：**
>
> 如果使用 json/json5 编写 mock文件，则不支持使用 `response` 方法，以及不支持使用其他字段的函数形式。

## 共享 Mock 数据

由于每个mock文件都是作为独立的入口进行编译，其依赖的本地文件也编译在内，
且每个mock文件拥有独立的作用域，这使得即使多个 mock文件共同依赖某一个`data.ts`文件，也无法共享数据。
某个 `mock` 文件对 `data.ts` 中的数据进行修改，其它`mock`文件不会获取到修改后的数据。

为此，插件提供了一个 `defineMockData` 函数，用于在 `mock` 文件中使用 `data.ts` 作为共享数据源。

```ts
type defineMockData<T> = (
  key: string, // 数据唯一标识符
  initialData: T, // 初始化数据
  options?: {
    persistOnHMR?: boolean // 是否在热更新时保持数据状态
  }, // 可选配置
) => [getter, setter] & { value: T }
```

返回的元组可以直接调用：不传参数时读取当前值，传入新值（或更新函数）时写入；也可以通过 `.value` 直接读写。

`persistOnHMR` 默认为 `false`：mock 文件热更新时，如果 `initialData` 发生变化，数据会被重置为新编译的初始值；设置为 `true` 可在热更新时保留当前值。

### 用法

`data.ts`

```ts
import { defineMockData } from 'vite-plugin-mock-dev-server'

export default defineMockData('posts', [
  { id: '1', title: 'title1', content: 'content1' },
  { id: '2', title: 'title2', content: 'content2' },
])
```

`*.mock.ts`

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'
import posts from './data'

export default defineMock([
  {
    url: '/api/posts',
    body: () => posts.value,
  },
  {
    url: '/api/posts/delete/:id',
    body: ({ params }) => {
      const id = params.id
      posts.value = posts.value.filter((post) => post.id !== id)
      return { success: true }
    },
  },
])
```

setter 支持传入新值或更新函数：

```ts
posts([...posts.value, newPost])
posts((list) => [...list, newPost])
```

> **注意：**
>
> `defineMockData` 仅是基于 `memory` 提供的共享数据支持，
> 如果需要做 mock 数据持久化，建议使用 `nosql`， 如 `lowdb` 或 `level` 等。

## 场景

使用 [`scene`](#optionsscene) 为同一个接口保留多份 mock 数据，并通过全局配置或单次请求切换。

`mock/user.mock.ts`

```ts
export default defineMock([
  { url: '/api/user', body: { name: 'default' } },
  { url: '/api/user', scene: 'test', body: { name: 'test user' } },
  { url: '/api/user', scene: ['dev', 'staging'], body: { name: 'dev user' } },
])
```

通过插件选项激活场景：

```ts
mockDevServerPlugin({
  activeScene: ['test'],
})
```

或者通过 `X-Mock-Scene` 请求头按请求覆盖（支持逗号分隔的多个值）：

```sh
curl -H 'X-Mock-Scene: test' http://localhost:5173/api/user
```

场景不匹配的 mock 会被跳过，回退到同一 URL 的通用 mock。

## 自定义匹配优先级

> 自定义规则仅影响包含动态参数的链接，如： `/api/user/:id`

内置的排序规则为：静态规则优先，其次动态参数越少的规则越优先；可选参数的优先级低于必填参数，通配符规则优先级最低。

插件内置的路径匹配规则优先级，已经能够满足大部分需求，但如果你需要更加灵活的自定义匹配规则优先级，
可以使用 `priority` 参数。

示例：

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      priority: {
        // 匹配规则优先级, 全局生效。声明在该选项中的规则将优先于默认规则生效。
        // 规则在数组越靠前的位置，优先级越高。
        global: ['/api/:a/b/c', '/api/a/:b/c', '/api/a/b/:c'],
        // 对于一些特殊情况，需要调整部分规则的优先级，可以使用此选项。
        // 比如一个请求同时命中了规则 A 和 B，且 A 比 B 优先级高， 但期望规则 B 生效时。
        special: {
          // 当请求同时命中 [key] 和 rules 中的任意一个时，优先匹配 [key] 。
          // when 用于进一步约束具体是哪些请求需要调整优先级。
          '/api/:a/:b/c': {
            rules: ['/api/a/:b/:c', '/api/a/b/:c'],
            when: ['/api/a/b/c'],
          },
          // 如果不需要 when, 则表示命中规则的请求都需要调整优先级。
          // 可以简写为 [key]: [...rules]
          '/api/:a/b': ['/api/a/:b'],
        },
      },
    }),
  ],
})
```

当一个请求同时满足多条 `special` 规则时，所有满足条件的规则都会被提升到最前（而不是只处理第一条），并保持声明顺序。

> **注意：**
>
> `priority` 虽然可以调整优先级，但大多数时候，你都没有必要这么做。
> 对于一些特殊情况的请求，可以使用 静态规则来替代 `priority`，静态规则总是拥有最高优先级。

## 示例

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

查看更多示例： [example](/example/)

<details>
<summary>命中 <code>/api/test</code> 请求，并返回一个 数据为空的响应体内容</summary>

```ts
export default defineMock({
  url: '/api/test',
})
```

</details>
<details>
<summary>命中 <code>/api/test</code> 请求，并返回一个固定内容数据</summary>

```ts
export default defineMock({
  url: '/api/test',
  body: { a: 1 },
})
```

```ts
export default defineMock({
  url: '/api/test',
  body: () => ({ a: 1 }),
})
```

</details>

<details>
<summary>限定只允许 <code>GET</code> 请求</summary>

```ts
export default defineMock({
  url: '/api/test',
  method: 'GET',
})
```

</details>

<details>
<summary>在返回的响应头中，添加自定义 header 和 cookie</summary>

```ts
export default defineMock({
  url: '/api/test',
  headers: { 'X-Custom': '12345678' },
  cookies: { 'my-cookie': '123456789' },
})
```

```ts
export default defineMock({
  url: '/api/test',
  headers({ query, body, params, headers }) {
    return { 'X-Custom': query.custom }
  },
  cookies() {
    return { 'my-cookie': '123456789' }
  },
})
```

</details>

<details>
<summary>定义多个相同url请求mock，并使用验证器匹配生效规则</summary>

```ts
export default defineMock([
  // 命中 /api/test?a=1
  {
    url: '/api/test',
    validator: {
      query: { a: 1 },
    },
    body: { message: 'query.a === 1' },
  },
  // 命中 /api/test?a=2
  {
    url: '/api/test',
    validator: {
      query: { a: 2 },
    },
    body: { message: 'query.a === 2' },
  },
  {
    // `?a=3` 将会解析到 `validator.query`
    url: '/api/test?a=3',
    body: { message: 'query.a == 3' },
  },
  // 命中 POST /api/test 请求，且 请求体中，字段 a 为数组，且数组包含值为 1， 2 的项
  {
    url: '/api/test',
    method: ['POST'],
    validator: { body: { a: [1, 2] } },
  },
])
```

</details>

<details>
<summary>延迟接口响应</summary>

```ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // 延迟 6秒
})
```

</details>

<details>
<summary>使接口请求失败</summary>

```ts
export default defineMock({
  url: '/api/test',
  status: 502,
  statusText: 'Bad Gateway',
})
```

</details>

<details>
<summary>动态路由匹配</summary>

```ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return { userId: params.userId }
  },
})
```

路由中的 `userId`将会解析到 `request.params` 对象中.

</details>

<details>
<summary>使用 buffer 响应数据</summary>

```ts
import { Buffer } from 'node:buffer'

// 由于 type 默认值是 json，虽然在传输过程中body使用buffer，
// 但是 content-type 还是为 json
export default defineMock({
  url: 'api/buffer',
  body: Buffer.from(JSON.stringify({ a: 1 })),
})
```

```ts
// 当 type 为 buffer 时，content-type 为 application/octet-stream，
// body 传入的数据会被转为 buffer
export default defineMock({
  url: 'api/buffer',
  type: 'buffer',
  // 内部使用 Buffer.from(body) 进行转换
  body: { a: 1 },
})
```

</details>

<details>
<summary>响应文件类型</summary>

模拟文件下载，传入文件读取流

```ts
import { createReadStream } from 'node:fs'

export default defineMock({
  url: '/api/download',
  // 当你不确定类型，可传入文件名由插件内部进行解析
  type: 'my-app.dmg',
  body: () => createReadStream('./my-app.dmg'),
})
```

```html
<a href="/api/download" download="my-app.dmg">下载文件</a>
```

</details>

<details>
<summary>使用 <code>mockjs</code> 生成响应数据</summary>

```ts
import Mock from 'mockjs'

export default defineMock({
  url: '/api/test',
  body: Mock.mock({
    'list|1-10': [
      {
        'id|+1': 1,
      },
    ],
  }),
})
```

请先安装 `mockjs`

</details>

<details>
<summary>使用 <code>response</code> 自定义响应</summary>

```ts
export default defineMock({
  url: '/api/test',
  response(req, res, next) {
    const { query, body, params, headers } = req
    console.log(query, body, params, headers)

    res.status = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        query,
        body,
        params,
      }),
    )
  },
})
```

</details>

<details>
<summary>使用 json / json5</summary>

```json
{
  "url": "/api/test",
  "body": {
    "a": 1
  }
}
```

</details>

<details>
<summary>multipart, 文件上传</summary>

通过 [`formidable`](https://www.npmjs.com/package/formidable#readme) 支持。

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <p>
    <span>file: </span>
    <input type="file" name="files" multiple="multiple" />
  </p>
  <p>
    <span>name:</span>
    <input type="text" name="name" value="mark" />
  </p>
  <p>
    <input type="submit" value="submit" />
  </p>
</form>
```

fields `files` 映射为 `formidable.File` 类型。

```ts
export default defineMock({
  url: '/api/upload',
  method: 'POST',
  body(req) {
    const body = req.body
    return {
      name: body.name,
      files: body.files.map((file: any) => file.originalFilename),
    }
  },
})
```

</details>

<details>
<summary>Graphql</summary>

```ts
import { buildSchema, graphql } from 'graphql'

const schema = buildSchema(`
type Query {
  hello: String
}
`)
const rootValue = { hello: () => 'Hello world!' }

export default defineMock({
  url: '/api/graphql',
  method: 'POST',
  body: async (request) => {
    const source = request.body.source
    const { data } = await graphql({ schema, rootValue, source })
    return data
  },
})
```

```ts
fetch('/api/graphql', {
  method: 'POST',
  body: JSON.stringify({ source: '{ hello }' }),
})
```

</details>

<details>
<summary>WebSocket Mock</summary>

```ts
// ws.mock.ts
export default defineMock({
  url: '/socket.io',
  ws: true,
  setup(wss, { onCleanup }) {
    const wsMap = new Map()
    wss.on('connection', (ws, req) => {
      const token = req.getCookie('token')
      wsMap.set(token, ws)
      ws.on('message', (raw) => {
        const data = JSON.parse(String(raw))
        if (data.type === 'ping') return
        // Broadcast
        for (const [_token, _ws] of wsMap.entires()) {
          if (_token !== token) _ws.send(raw)
        }
      })
    })
    wss.on('error', (err) => {
      console.error(err)
    })
    onCleanup(() => wsMap.clear())
  },
})
```

```ts
// app.ts
const ws = new WebSocket('ws://localhost:5173/socket.io')
ws.addEventListener(
  'open',
  () => {
    setInterval(() => {
      // heartbeat
      ws.send(JSON.stringify({ type: 'ping' }))
    }, 1000)
  },
  { once: true },
)
ws.addEventListener('message', (raw) => {
  console.log(raw)
})
```

</details>

<details>
<summary>EventSource Mock</summary>

```ts
// sse.mock.ts
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/sse',
  response(req, res) {
    const sse = createSSEStream(req, res)
    let count = 0
    const timer = setInterval(() => {
      sse.write({
        event: 'count',
        data: { count: ++count },
      })
      if (count >= 10) {
        sse.end()
        clearInterval(timer)
      }
    }, 1000)
  },
})
```

```ts
// app.js
const es = new EventSource('/api/sse')

es.addEventListener('count', (e) => {
  console.log(e.data)
})
```

</details>

## 请求录制与回放

录制经由 `server.proxy` 转发得到的响应，并在没有任何 mock 规则命中请求时进行回放，适用于离线开发、问题排查或与团队共享接口响应。

`vite.config.ts`

```ts
export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      record: true,
    }),
  ],
})
```

录制数据以 JSON 文件保存在 `mock/.recordings` 中。回放会随录制自动开启；如果只想复用已有的录制数据而不录制新请求：

```ts
mockDevServerPlugin({
  record: { enabled: false },
  replay: true,
})
```

说明：

- 仅录制非 WebSocket 代理的响应。
- 通过 `record.filter`、`record.status`、`record.expires` 和 `record.overwrite` 控制录制内容与保留时长。
- 压缩响应会在保存前解压，保证录制数据可读。
- 仅当没有任何 mock 规则命中请求时才会使用回放，mock 规则优先。

完整配置见 [`record`](#record) 与 [`replay`](#replay)。

## 独立部署的小型mock服务

在一些场景中，可能会需要使用mock服务提供的数据支持，用于展示，但可能项目已完成打包构建部署，已脱离 `vite` 和本插件提供的 mock服务支持。由于本插件在设计之初，支持在mock文件中引入各种 `node` 模块，所以不能将 mock文件打包内联到客户端构建代码中。

为了能够满足这类场景，插件一方面提供了 `vite preview` 下的支持，同时还提供了在 `vite build` 时，也构建一个可独立部署的 小型mock服务应用，可以将这个应用部署到相关的环境，后通过其他http服务器如nginx做代理转发到实际端口实现mock支持。

构建默认输出到 `dist/mockServer` 目录中（`build.dist` 为相对路径时基于 Vite 的 `build.outDir`），并生成如下文件：

```sh
./mockServer
├── index.js
├── mock-data.js
├── package.json
└── mock/.recordings/...   # 仅在开启 build.includeRecord 时生成
```

在该目录下，执行 `npm install` 安装依赖后，执行 `npm start` 即可启动 mock server。
默认端口为 `8080`。可通过 `PORT` 环境变量覆盖端口，`HOST` 用于指定监听地址（默认监听所有网卡）：

```sh
PORT=9000 HOST=127.0.0.1 npm start
```

可通过 `localhost:8080/` 访问相关的 `mock` 接口。

## Links

- [vite](https://vitejs.dev/)
- [awesome-vite](https://github.com/vitejs/awesome-vite#helpers)
- [rspack-plugin-mock](https://github.com/pengzhanbo/rspack-plugin-mock) - **Rspack** 和 **Rsbuild** 的 API mock 服务插件

## 贡献指南

在为本项目做出贡献之前，请阅读 [贡献指南](./CONTRIBUTING.zh-CN.md)。

## LICENSE

[MIT License](./LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_large)
