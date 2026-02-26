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

> [!IMPORTANT]
> 插件已适配 `vite@7.x` 以上版本，现在会根据 `vite` 版本自动选择 `esbuild`/`rolldown`编译 mock 文件。

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
- 🗂 支持构建可独立部署的小型mock服务

## 文档

查看 [Documentation](https://vite-plugin-mock-dev-server.netlify.app/zh/) 了解更多。

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

> [!IMPORTANT]
> 插件不再支持 `CommonJS` 导入使用，请使用 `ESModule` 导入插件

----

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

## 使用

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ],
  // 这里定义的字段，在mock中也能使用
  define: {},
  server: {
    // 插件将会读取 `server.proxy`
    proxy: {
      '^/api': { target: 'http://example.com' }
    }
  }
})
```

插件会读取 `server.proxy` 或 `options.prefix` 的配置，对匹配的 url 启用mock 匹配。

插件也会读取 `define` 配置， 支持在 mock 文件中直接使用。

## 编写mock文件

默认配置，在你的项目根目录的 `mock` 目录中编写mock数据：

`mock/**/*.mock.ts` :

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user/:id',
  body: { a: 1, b: 2 }
})
```

## 方法

### mockDevServerPlugin(options)

vite 插件

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({/* 插件配置 */}),
  ]
})
```

### defineMock(mockOptions)

Mock 配置类型帮助

``` ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

### createDefineMock(transformer)

返回一个自定义的 defineMock 函数，用于支持对 mock config 的预处理。

``` ts
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

// 预处理 mock url
const defineAPIMock = createDefineMock((mock) => {
  mock.url = path.join('/api', mock.url)
})

export default defineApiMock({
  url: '/test' // 补全为 '/api/test'
})
```

### createSSEStream(req, res)

创建一个 `Server-sent events` 写入流，用于支持模拟 `EventSource`。

``` ts
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/sse',
  response: (req, res) => {
    const sse = createSSEStream(req, res)
    sse.write({ event: 'message', data: { message: 'hello world' } })
    sse.end()
  }
})
```

## Plugin Options

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

  配置读取 mock文件，可以是一个 目录，glob，或者一个数组

### exclude

- **类型：** `string | string[]`
- **默认值：** `['**/node_modules/**']`
- **详情：**

  配置读取 mock文件时，需要排除的文件， 可以是一个 目录、glob、或者一个数组

### reload

- **类型：** `boolean`
- **默认值：** `false`
- **详情：**

  mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。当你希望每次修改mock文件都刷新页面时，可以打开此选项。

### cors

- **类型：** `boolean | CorsOptions`
- **默认值：** `true`
- **详情：**

  配置 `cors`, 查看 [cors](https://github.com/expressjs/cors#configuration-options)

### log

- **类型：** `boolean | 'info' | 'warn' | 'error' | 'silent' | 'debug'`
- **默认值：** `info`
- **详情：**

  启动日志，以及配置日志打印级别

### formidableOptions

- **类型：** `formidable.Options`
- **详情：**

  配置 `formidable`，查看 [formidable options](https://github.com/node-formidable/formidable#options)

  **示例：** 配置文件上传的存放目录

  ```ts
  MockDevServerPlugin({
    formidableOptions: {
      uploadDir: path.join(process.cwd(), 'uploads'),
    }
  })
  ```

### cookiesOptions

- **类型：** `cookies.Options`
- **详情：**

  配置 `cookies`, 查看 [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

### bodyParserOptions

- **类型：** `BodyParserOptions`
- **详情：**

  配置 `co-body`, 查看 [co-body](https://github.com/cojs/co-body#options)

### build

- **类型：** `boolean | ServerBuildOptions`
- **默认值：**`false`
- **详情：**

  需要构建可独立部署的小型mock服务时配置。

  ```ts
  interface ServerBuildOptions {
    /**
     * 服务端口
     * @default 8080
     */
    serverPort?: number
    /**
     * 构建输出目录
     * @default 'mockServer'
     */
    dist?: string

    /**
     * 日志级别
     * @default 'error'
     */
    log?: LogLevel
  }
  ```

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
  body: { message: 'hello world' }
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
  }
})
```

### options.url

- **类型：** `string`
- **详情：**

  需要进行 mock 的接口地址, 由 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 提供路径匹配支持。

### options.enabled

- **类型：** `boolean`
- **默认值：** `true`
- **详情：**

  是否启动对该接口的mock，在多数场景下，我们仅需要对部分接口进行 mock，
  而不是对所有配置了mock的请求进行全量mock，所以是否能够配置是否启用很重要

### options.method

- **类型：** `Method | Method[]`

  ```ts
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH'
  ```

- **默认值：** `['GET', 'POST']`
- **详情：**

  该接口允许的 请求方法，默认同时支持 GET 和 POST

### options.type

- **类型：** `'text' | 'json' | 'buffer' | string`
- **详情：**

  响应体数据类型。 还支持 [mime-db](https://github.com/jshttp/mime-db) 中的包含的类型。

  当响应体返回的是一个文件，而你不确定应该使用哪个类型时，可以将文件名作为值传入，
  插件内部会根据文件名后缀查找匹配的`content-type`。

### options.headers

- **类型：** `object | (request: MockRequest) => object | Promise<object>`
- **默认值：** `{ 'Content-Type': 'application/json' }`
- **详情：**

  配置响应体 headers

### options.status

- **类型：** `number`
- **默认值：** `200`
- **详情：**

  配置 响应头状态码

### options.statusText

- **类型：** `string`
- **默认值：** `"OK"`
- **详情：**

  配置响应头状态文本

### options.delay

- **类型：** `number | [number, number]`
- **默认值：** `0`
- **详情：**

  配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围。

  单位： `ms`

### options.body

- **类型：** `Body | (request: MockRequest) => Body | Promise<Body>`

  ```ts
  type Body = string | object | Buffer | Readable
  ```

- **详情：**

  配置响应体数据内容 `body` 优先级高于 `response`.

### options.response

- **类型：** `(req: MockRequest, res: MockResponse, next: (err?: any) => void) => void | Promise<void>`
- **详情：**

  如果需要设置复杂的响应内容，可以使用 response 方法，
  该方法是一个 middleware，你可以在这里拿到 http 请求的 req、res等信息，
  然后通过 `res.write() | res.end()` 返回响应数据， 否则需要执行 `next()` 方法。
  在 `req` 中，还可以拿到 `query、params、body, refererQuery` 等已解析的请求信息。

### options.cookies

- **类型：** `CookiesOptions | (request: MockRequest) => CookiesOptions | Promise<CookiesOptions>`

  ```ts
  type CookiesOptions = Record<string, CookieValue>

  type CookieValue = string | [string, SetCookie]
  ```

- **详情：**

  配置响应体 cookies

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
     * 请求体中 headers
     */
    headers: Headers
  }
  ```

- **详情：**

  请求验证器

  有时候，一个相同的API请求，需要根据不同的请求参数，来决定返回数据，
  但全部都在单个 mock中的 body或者 response 中写，内容会很庞杂，不好管理，
  验证器的功能，允许你同时配置多条相同url的mock，通过验证器来判断使哪个mock生效。

### options.ws

- **类型：** `boolean`
- **默认值：** `false`
- **详情：**

  配置是否开启 WebSocket Mock

### options.setup

- **类型：** `(wss: WebSocketServer, ctx: WebSocketSetupContext) => void`
- **详情：**

  配置 Websocket Server

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
  getCookie: (name: string, option?: Cookies.GetOption) => string | undefined
}
```

**Response:**

`response` 的原始数据类型是`http.ServerResponse<http.IncomingMessage>`. 插件在此基础上增加了 `setCookie(name, value)` 方法用于设置cookie

```ts
type Response = http.ServerResponse<http.IncomingMessage> & {
  setCookie: (
    name: string,
    value?: string | null,
    option?: Cookies.SetOption,
  ) => void
}
```

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
) => [getter, setter] & { value: T }
```

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
    body: () => posts.value
  },
  {
    url: '/api/posts/delete/:id',
    body: (params) => {
      const id = params.id
      posts.value = posts.value.filter(post => post.id !== id)
      return { success: true }
    }
  }
])
```

> **注意：**
>
> `defineMockData` 仅是基于 `memory` 提供的共享数据支持，
> 如果需要做 mock 数据持久化，建议使用 `nosql`， 如 `lowdb` 或 `level` 等。

## 自定义匹配优先级

> 自定义规则仅影响包含动态参数的链接，如： `/api/user/:id`

插件内置的路径匹配规则优先级，已经能够满足大部分需求，但如果你需要更加灵活的自定义匹配规则优先级，
可以使用 `priority` 参数。

示例：

```ts
import { defineConfig } from 'vite'
import mockPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockPlugin({
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
            when: ['/api/a/b/c']
          },
          // 如果不需要 when, 则表示命中规则的请求都需要调整优先级。
          // 可以简写为 [key]: [...rules]
          '/api/:a/b': ['/api/a/:b'],
        }
      }
    })
  ]
})
```

> **注意：**
>
> `priority` 虽然可以调整优先级，但大多数时候，你都没有必要这么做。
> 对于一些特殊情况的请求，可以使用 静态规则来替代 `priority`，静态规则总是拥有最高优先级。

## 示例

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

查看更多示例： [example](/example/)

**示例：** 命中 `/api/test` 请求，并返回一个 数据为空的响应体内容

```ts
export default defineMock({
  url: '/api/test',
})
```

**示例：** 命中 `/api/test` 请求，并返回一个固定内容数据

```ts
export default defineMock({
  url: '/api/test',
  body: { a: 1 },
})
```

```ts
export default defineMock({
  url: '/api/test',
  body: () => ({ a: 1 })
})
```

**示例：** 限定只允许 `GET` 请求

```ts
export default defineMock({
  url: '/api/test',
  method: 'GET'
})
```

**示例：**  在返回的响应头中，添加自定义 header 和 cookie

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
  }
})
```

**示例：**  定义多个相同url请求mock，并使用验证器匹配生效规则

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
    validator: { body: { a: [1, 2] } }
  }
])
```

**示例：**  延迟接口响应：

```ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // 延迟 6秒
})
```

**示例：**  使接口请求失败

```ts
export default defineMock({
  url: '/api/test',
  status: 502,
  statusText: 'Bad Gateway'
})
```

**示例：** 动态路由匹配

```ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return { userId: params.userId }
  }
})
```

路由中的 `userId`将会解析到 `request.params` 对象中.

**示例：** 使用 buffer 响应数据

```ts
import { Buffer } from 'node:buffer'

// 由于 type 默认值是 json，虽然在传输过程中body使用buffer，
// 但是 content-type 还是为 json
export default defineMock({
  url: 'api/buffer',
  body: Buffer.from(JSON.stringify({ a: 1 }))
})
```

```ts
// 当 type 为 buffer 时，content-type 为 application/octet-stream，
// body 传入的数据会被转为 buffer
export default defineMock({
  url: 'api/buffer',
  type: 'buffer',
  // 内部使用 Buffer.from(body) 进行转换
  body: { a: 1 }
})
```

**示例：** 响应文件类型

模拟文件下载，传入文件读取流

```ts
import { createReadStream } from 'node:fs'

export default defineMock({
  url: '/api/download',
  // 当你不确定类型，可传入文件名由插件内部进行解析
  type: 'my-app.dmg',
  body: () => createReadStream('./my-app.dmg')
})
```

```html
<a href="/api/download" download="my-app.dmg">下载文件</a>
```

**示例：** 使用 `mockjs` 生成响应数据:

```ts
import Mock from 'mockjs'

export default defineMock({
  url: '/api/test',
  body: Mock.mock({
    'list|1-10': [{
      'id|+1': 1
    }]
  })
})
```

请先安装 `mockjs`

**示例：** 使用 `response` 自定义响应

```ts
export default defineMock({
  url: '/api/test',
  response(req, res, next) {
    const { query, body, params, headers } = req
    console.log(query, body, params, headers)

    res.status = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      query,
      body,
      params,
    }))
  }
})
```

**示例：** 使用 json / json5

```json
{
  "url": "/api/test",
  "body": {
    "a": 1
  }
}
```

**示例：** multipart, 文件上传.

通过 [`formidable`](https://www.npmjs.com/package/formidable#readme) 支持。

``` html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <p>
    <span>file: </span>
    <input type="file" name="files" multiple="multiple">
  </p>
  <p>
    <span>name:</span>
    <input type="text" name="name" value="mark">
  </p>
  <p>
    <input type="submit" value="submit">
  </p>
</form>
```

fields `files` 映射为 `formidable.File` 类型。

``` ts
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

**示例：** Graphql

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
  body: JSON.stringify({ source: '{ hello }' })
})
```

**示例：** WebSocket Mock

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
        if (data.type === 'ping')
          return
        // Broadcast
        for (const [_token, _ws] of wsMap.entires()) {
          if (_token !== token)
            _ws.send(raw)
        }
      })
    })
    wss.on('error', (err) => {
      console.error(err)
    })
    onCleanup(() => wsMap.clear())
  }
})
```

```ts
// app.ts
const ws = new WebSocket('ws://localhost:5173/socket.io')
ws.addEventListener('open', () => {
  setInterval(() => {
    // heartbeat
    ws.send(JSON.stringify({ type: 'ping' }))
  }, 1000)
}, { once: true })
ws.addEventListener('message', (raw) => {
  console.log(raw)
})
```

**示例：** EventSource Mock

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

## 独立部署的小型mock服务

在一些场景中，可能会需要使用mock服务提供的数据支持，用于展示，但可能项目已完成打包构建部署，已脱离 `vite` 和本插件提供的 mock服务支持。由于本插件在设计之初，支持在mock文件中引入各种 `node` 模块，所以不能将 mock文件打包内联到客户端构建代码中。

为了能够满足这类场景，插件一方面提供了 `vite preview` 下的支持，同时还提供了在 `vite build` 时，也构建一个可独立部署的 小型mock服务应用，可以将这个应用部署到相关的环境，后通过其他http服务器如nginx做代理转发到实际端口实现mock支持。

构建默认输出到 `dist/mockServer` 目录中，并生成如下文件：

```sh
./mockServer
├── index.js
├── mock-data.js
└── package.json
```

在该目录下，执行 `npm install` 安装依赖后，执行 `npm start` 即可启动 mock server。
默认端口为 `8080`。
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
