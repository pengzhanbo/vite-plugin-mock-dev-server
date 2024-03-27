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
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/pengzhanbo/vite-plugin-mock-dev-server/lint.yml?style=flat-square">
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
- 💡 ESModule/commonjs
- 🦾 Typescript
- 🔥 热更新
- 🏷 支持 `json` / `json5` 编写 mock 数据
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
- ⚜️ 支持模拟 `WebSocket`
- 🗂 支持构建可独立部署的小型mock服务

## 文档

查看 [Documentation](https://vite-plugin-mock-dev-server.netlify.app/) 了解更多。

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

## 使用

### 安装

```sh
# npm
npm i -D vite-plugin-mock-dev-server
# yarn
yarn add vite-plugin-mock-dev-server
# pnpm
pnpm add -D vite-plugin-mock-dev-server
```

### 配置

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
    proxy: {
      '^/api': { target: 'http://example.com' }
    }
  }
})
```

插件会读取 `server.proxy` 或 `options.prefix` 的配置，对匹配的 url 启用mock 匹配。

插件也会读取 `define` 配置， 支持在 mock 文件中直接使用。

> 因为一般场景下，我们只需要对有代理的url进行mock，这样才能通过 vite 提供的 http 服务进行 代理和 mock，
> 但你也可以使用 `options.prefix`配置 mock

### 编写mock文件

默认配置，在你的项目根目录的 `mock` 目录中编写mock数据：

`mock/**/*.mock.ts` :

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: { a: 1, b: 2 }
})
```

## 方法

### mockDevServerPlugin(options)

vite plugin

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ]
})
```

#### options

- `options.prefix`

  **类型:** `string | string[]`

  为mock服务器配置自定义匹配规则。任何请求路径以 `prefix` 值开头的请求将被代理到对应的目标。如果 `prefix` 值以 `^` 开头，将被识别为 RegExp。

  > 一般情况下, `server.proxy` 已经足够满足需求，添加此项是为了与某些场景兼容。

  **默认值:** `[]`

- `options.wsPrefix`

  **类型:** `string | string[]`

  配置 webSocket 服务 匹配规则。任何请求路径以 `wsPrefix` 值开头的 `ws/wss` 协议请求，将被代理到对应的目标。
  如果`wsPrefix`值以 `^` 开头,将被识别为 RegExp。

  > 与 http mock 默认使用 `viteConfig.server.proxy` 不同的是，`websocket mock` 不会使用 `viteConfig.server.proxy` 中的 ws 相关的配置，且配置在 `wsPrefix` 中的规则，不能同时配置在 `viteConfig.server.proxy`中，因为会导致在 vite 在启动服务时产生冲突，因为不能对同一个请求实现多个的 `WebSocketServer`实例。
  > 该冲突既不是 `vite` 的问题，也不是插件的问题，这属于合理的错误类型。在进行 `WebSocket Mock`和 `WebSocket Proxy` 切换时，请注意配置不要出现重复导致冲突。

- `option.include`

  **类型：** `string | string[]`

  配置读取 mock文件，可以是一个 目录，glob，或者一个数组

  **默认值：** `['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']` (相对于根目录)

- `options.exclude`

  **类型：** `string | string[]`

  配置读取 mock文件时，需要排除的文件， 可以是一个 目录、glob、或者一个数组

  **默认值：** `['**/node_modules/**', '**/.vscode/**', '**/.git/**']`

- `options.reload`

  **Type:** `boolean`

  mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。当你希望每次修改mock文件都刷新页面时，可以打开此选项。

  **Default:** `false`

- `options.cors`

  **Type:** `boolean | CorsOptions`

  默认启用.

  配置 `cors`, 查看 [cors](https://github.com/expressjs/cors#configuration-options)

- `options.log`

  **Type:** `boolean | 'info' | 'warn' | 'error' | 'silent'`

  启动日志，以及配置日志打印级别

- `options.formidableOptions`

  配置 `formidable`，查看 [formidable options](https://github.com/node-formidable/formidable#options)

  **默认值:** `{}`

  示例: 配置文件上传的存放目录

  ```ts
  MockDevServerPlugin({
    formidableOptions: {
      uploadDir: path.join(process.cwd(), 'uploads'),
    }
  })
  ```

- `options.cookiesOptions`

  配置 `cookies`, 查看 [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

  **默认值:** `{}`

- `options.bodyParserOptions`

  配置 `co-body`, 查看 [co-body](https://github.com/cojs/co-body#options)

- `options.build`

  需要构建可独立部署的小型mock服务时配置。

  **类型：** `boolean | ServerBuildOptions`

  **默认值：**`false`

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

  - `options.priority`

  自定义 路径匹配规则优先级。[查看更多](#自定义匹配优先级)

  **默认值：** `undefined`

### defineMock(config)

mock 配置帮助函数，提供类型检查帮助

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

### createDefineMock(transformer)

返回一个自定义的 defineMock 函数，用于支持对 mock config 的预处理。

```ts
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

## Mock 配置

```ts
// 配置 http mock
export default defineMock({
  /**
   * 请求地址，支持 `/api/user/:id` 格式
   * 插件通过 `path-to-regexp` 匹配路径
   * @see https://github.com/pillarjs/path-to-regexp
   */
  url: '/api/test',
  /**
   * 接口支持的请求方法
   * @type string | string[]
   * @default ['POST','GET']
   *
   */
  method: ['GET', 'POST'],
  /**
   * 是否启用当前 mock请求
   * 在实际场景中，我们一般只需要某几个mock接口生效，
   * 而不是所以mock接口都启用。
   * 对当前不需要mock的接口，可设置为 false
   * @default true
   */
  enabled: true,
  /**
   * 设置接口响应延迟，如果传入的是一个数组，则代表延迟时间的范围
   * 单位：ms
   * @default 0
   */
  delay: 1000,
  /**
   * 响应状态码
   * @default 200
   */
  status: 200,
  /**
   * 响应状态文本
   */
  statusText: 'OK',
  /**
   * 响应状态 headers
   * @type Record<string, any>
   * @type (({ query, body, params, headers }) => Record<string, any>)
   * 入参部分为 请求相关信息
   */
  headers: {
    'Content-Type': 'application/json'
  },

  /**
   * 响应体 cookies
   * @type Record<string, string | [value: string, option: CookieOption]>
   * @see https://github.com/pillarjs/cookies#cookiessetname--values--options
   */
  cookies: {
    'your-cookie': 'your cookie value',
    'cookie&option': ['cookie value', { path: '/', httpOnly: true }]
  },

  /**
   * 响应体数据类型, 可选值包括 `text, json, buffer`，
   * 还支持`mime-db`中的包含的类型。
   * 当响应体返回的是一个文件，而你不确定应该使用哪个类型时，可以将文件名作为值传入，
   * 插件内部会根据文件名后缀查找匹配的`content-type`。
   * 但如果是 `typescript`文件如 `a.ts`，可能不会被正确匹配为 `javascript`脚本，
   * 你需要将 `a.ts` 修改为 `a.js`作为值传入才能正确识别。
   * @see https://github.com/jshttp/mime-db
   * @default 'json'
   */
  type: 'json',

  /**
   * 响应体数据
   * 定义返回的响应体数据内容。
   * 在这里，你可以直接返回JavaScript支持的数据类型如 `string/number/array/object` 等
   * 同时，你也可以使用如 `mockjs` 等库来生成数据内容
   *
   * @type string | number | array | object
   *  直接返回定义的数据
   *
   * @type (request: { headers, query, body, params }) => any | Promise<any>
   * 如果传入一个函数，那么可以更加灵活的定义返回响应体数据
   */
  body: '',

  /**
   * 如果通过 body 配置不能解决mock需求，
   * 那么可以通过 配置 response，暴露http server 的接口，
   * 实现完全可控的自定义配置
   * 在 req参数中，已内置了 query、body、params 的解析，
   * 你可以直接使用它们。
   * 别忘了，需要通过 `res.end()` 返回响应体数据，
   * 或者需要跳过mock，那么别忘了调用 `next()`
   */
  response(req, res, next) {
    res.end()
  },
  /**
   * 请求验证器，通过验证器则返回 mock数据，否则不使用当前mock。
   * 这对于一些场景中，某个接口需要通过不同的入参来返回不同的数据，验证器可以很好的解决这一类问题，
   * 将同个 url 分为多个 mock配置，根据 验证器来判断哪个mock配置生效。
   *
   * @type { headers, body, query, params, refererQuery }
   * 如果 validator 传入的是一个对象，那么验证方式是 深度比较 请求的接口
   * 中 headers/body/query/params/refererQuery 是否包含 validator 的 key-value。
   *
   * @type (request) => boolean
   * 如果 validator 传入的是一个函数，那么会将 请求的接口相关数据作为入参，
   * 提供给使用者进行自定义校验，并返回一个 boolean
   *
   */
  validator: {
    headers: {},
    body: {},
    query: {},
    params: {},
    /**
     * refererQuery 验证了请求来源页面 URL 中的查询参数，
     * 这使得可以直接在浏览器地址栏中修改参数以获取不同的模拟数据。
     */
    refererQuery: {}
  },
})
```

```ts
// 配置 WebSocket mock
export default defineMock({
  /**
   * 请求地址，支持 `/api/user/:id` 格式
   * 插件通过 `path-to-regexp` 匹配路径
   * @see https://github.com/pillarjs/path-to-regexp
   */
  url: '/api/test',
  /**
   * 必须显式的指定值为 `true`
   * 插件内部需要根据此值进行判断
   */
  ws: true,
  /**
   * 配置 WebSocketServer
   * @see https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocketserver
   * 如果在 setup 函数中有一些 额外的 自动执行任务或循环任务，
   * 那么需要在 `onCleanup()` 传入一个回调，用于清除这些任务，
   * 这是由于插件在热更新时，需要重新执行 setup，需要清除之前的任务，否则可能会导致重复任务产生冲突。
   * `onCleanup()`可以在 setup 内部多次调用
   * @type `(wss: WebSocketServer, context: SetupContext) =>  void`
   */
  setup(wss, { onCleanup }) {
    wss.on('connection', (ws, request) => {
      ws.on('message', (rawData) => {})
      const timer = setInterval(() => ws.send('data'), 1000)
      onCleanup(() => clearInterval(timer))
    })
  }
})
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

> **注意:**
>
> `priority` 虽然可以调整优先级，但大多数时候，你都没有必要这么做。
> 对于一些特殊情况的请求，可以使用 静态规则来替代 `priority`，静态规则总是拥有最高优先级。

## Example

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

查看更多示例： [example](/example/)

**exp:** 命中 `/api/test` 请求，并返回一个 数据为空的响应体内容

```ts
export default defineMock({
  url: '/api/test',
})
```

**exp:** 命中 `/api/test` 请求，并返回一个固定内容数据

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

**exp:** 限定只允许 `GET` 请求

```ts
export default defineMock({
  url: '/api/test',
  method: 'GET'
})
```

**exp:**  在返回的响应头中，添加自定义 header 和 cookie

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

**exp:**  定义多个相同url请求mock，并使用验证器匹配生效规则

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

**exp:**  延迟接口响应：

```ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // 延迟 6秒
})
```

**exp:**  使接口请求失败

```ts
export default defineMock({
  url: '/api/test',
  status: 502,
  statusText: 'Bad Gateway'
})
```

**exp:** 动态路由匹配

```ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return { userId: params.userId }
  }
})
```

路由中的 `userId`将会解析到 `request.params` 对象中.

**exp:** 使用 buffer 响应数据

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

**exp:** 响应文件类型

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

**exp:** 使用 `mockjs` 生成响应数据:

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

**exp:** 使用 `response` 自定义响应

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

**exp:** 使用 json / json5

```json
{
  "url": "/api/test",
  "body": {
    "a": 1
  }
}
```

**exp:** multipart, 文件上传.

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

**exp:** Graphql

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

**exp:** WebSocket Mock

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

## Archives

[awesome-vite](https://github.com/vitejs/awesome-vite#helpers)

## LICENSE

[MIT](/LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_large)
