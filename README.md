# vite-plugin-mock-dev-server

<br>
<br>
<p align="center">
 <b>Vite Plugin for API mock dev server.</b>
</p>

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
  <span>English</span> | <a href="/README.zh-CN.md">简体中文</a>
</p>
<br>
<br>

## Feature

- ⚡️ Lightweight, Flexible, Fast.
- 🧲 Not injection-based, non-intrusive to client code.
- 💡 ESModule/commonjs.
- 🦾 Typescript.
- 🔥 HMR
- 🏷 Support `json` / `json5`.
- 📦 Auto import mock file.
- 🎨 Support any lib, like `mockjs`, or do not use it.
- 📥 Path rule matching, request parameter matching.
- ⚙️ Support Enabled/Disabled any one of the API mock.
- 📀 Supports response body content type such as `text/json/buffer/stream`.
- ⚖️ Use `server.proxy`
- 🍕 Support `viteConfig.define` and `env` in the mock file.
- ⚓️ Support `viteConfig.resolve.alias` in the mock file.
- 🌈 Support `vite preview` mode.
- 📤 Support `multipart` content-type, mock upload file.
- 📥 Support mock download file.
- ⚜️ Support `WebSocket Mock`
- 🗂 Support building small independent deployable mock services.

## Documentation

See the [documentation](https://vite-plugin-mock-dev-server.netlify.app/en/) to learn more.

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

## Usage

### Install

``` sh
# npm
npm i -D vite-plugin-mock-dev-server
# yarn
yarn add vite-plugin-mock-dev-server
# pnpm
pnpm add -D vite-plugin-mock-dev-server
```

### Configuration

`vite.config.ts`

``` ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ],
  // The fields defined here can also be used in mock.
  define: {},
  server: {
    proxy: {
      '^/api': { target: 'http://example.com' }
    }
  }
})
```

The plugin will read the configuration of `server.proxy` or `options.prefix`, and enable mock matching for matched URLs.

The plugin will also read the `define` configuration, which supports direct use in mock files.

> Because in general scenarios, we only need to mock URLs with proxies so that we can use the proxy and mock services provided by Vite's HTTP service.
>
> However, you can also configure mocks using `options.prefix`.

### Edit Mock File

By default, write mock data in the `mock` directory of your project's root directory:

`mock/**/*.mock.ts` :

``` ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: { a: 1, b: 2 }
})
```

## Methods

### mockDevServerPlugin(options)

Vite plugin

`vite.config.ts`

``` ts
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

  **Type:** `string | string[]`

  Configure custom matching rules for the mock server. Any request path starting with the value of `prefix` will be proxied to the corresponding target. If the `prefix` value starts with ^, it will be recognized as a RegExp.

  > In general, `server.proxy` is sufficient to meet the needs. Adding this item is for compatibility with certain scenarios.

  **Default:** `[]`

- `options.wsPrefix`

  **Type:** `string | string[]`

  Configure the matching rules for the WebSocket service. Any request path starting with the value of `wsPrefix` and using the `ws/wss` protocol will be proxied to the corresponding target.

  If the value of `wsPrefix` starts with `^`, it will be recognized as a RegExp.

  > Different from using `viteConfig.server.proxy` by default for http mock, `websocket mock` does not use the ws-related configuration in `viteConfig.server.proxy`. Also, rules configured in `wsPrefix` cannot be configured simultaneously in `viteConfig.server.proxy`, as it will cause conflicts when starting the vite server because multiple instances of WebSocketServer cannot be implemented for the same request.
  > This conflict is neither a problem with Vite nor with the plugin; it belongs to a reasonable error type. When switching between WebSocket Mock and WebSocket Proxy, please pay attention to avoid duplicate configurations that may cause conflicts.

- `option.include`

  **Type:** `string | string[]`

  Configure to read mock files, which can be a directory, glob, or an array.

  **Default：** `['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']` (Relative to the root directory.)

- `options.exclude`

  **Type:** `string | string[]`

  When reading mock files for configuration, the files that need to be excluded can be a directory, glob, or array.

  **Default：** `['**/node_modules/**','**/.vscode/**','**/.git/**']`

- `options.reload`

  **Type:** `boolean`

  When the mock resource is hot updated, only the data content is updated, but the page is not refreshed by default. If you want to refresh the page every time you modify the mock file, you can open this option.

- `options.cors`

  **Type:** `boolean | CorsOptions`

  Enable by default.

  Configure to `cors`, see [cors](https://github.com/expressjs/cors#configuration-options)

  **Default:** `true`

- `options.log`

  **Type:** `boolean | 'info' | 'warn' | 'error' | 'silent'`

  Enable log and configure log level.

- `options.formidableOptions`

  Configure to `formidable`, see [formidable options](https://github.com/node-formidable/formidable#options)

  **Default:** `{}`

  example: Configure to file upload dir

  ``` ts
  MockDevServerPlugin({
    formidableOptions: {
      uploadDir: path.join(process.cwd(), 'uploads'),
    }
  })
  ```

- `options.cookiesOptions`

  Configure to `cookies`, see [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

  **Default:** `{}`

- `options.bodyParserOptions`

  Configure to `co-body`, see [co-body](https://github.com/cojs/co-body#options)

  **Default:** `{}`

- `options.build`

  The configuration needed to build a small, independently deployable mock service.

  **Type：** `boolean | ServerBuildOptions`

  **Default：** `false`

  ``` ts
  interface ServerBuildOptions {
    /**
     * server port
     * @default 8080
     */
    serverPort?: number
    /**
     * build output dir
     * @default 'mockServer'
     */
    dist?: string
    /**
     * log level
     * @default 'error'
     */
    log?: LogLevel
  }
  ```

- `options.priority`

  Custom path matching rule priority。[read more](#custom-path-matching-priority)

  **Default：** `undefined`

### defineMock(config)

Mock Type Helper

``` ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

### createDefineMock(transformer)

Return a custom defineMock function to support preprocessing of mock config.

``` ts
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

// Preprocessed mock url
const defineAPIMock = createDefineMock((mock) => {
  mock.url = path.join('/api', mock.url)
})

export default defineApiMock({
  url: '/test' // Complete as '/api/test'
})
```

## Mock Configuration

``` ts
// Configure the http mock
export default defineMock({
  /**
   * Request address, supports the `/api/user/:id` format.
   * The plugin matches the path through `path-to-regexp`.
   * @see https://github.com/pillarjs/path-to-regexp
   */
  url: '/api/test',
  /**
   * Supported request methods of the interface.
   * @type string | string[]
   * @default ['POST','GET']
   *
   */
  method: ['GET', 'POST'],
  /**
   * In practical scenarios,
   * we usually only need certain mock interfaces to take effect,
   * rather than enabling all mock interfaces.
   * For interfaces that do not currently require mocking,
   * they can be set to false.
   *
   * @default true
   */
  enabled: true,
  /**
   * Set interface response delay, if an array is passed in,
   * it represents the range of delay time.
   * unit: ms.
   * @default 0
   */
  delay: 1000,
  /**
   * response status
   * @default 200
   */
  status: 200,
  /**
   * response status text
   */
  statusText: 'OK',
  /**
   * response headers
   * @type Record<string, any>
   * @type (({ query, body, params, headers }) => Record<string, any>)
   */
  headers: {
    'Content-Type': 'application/json'
  },

  /**
   * response cookies
   * @type Record<string, string | [value: string, option: CookieOption]>
   * @see https://github.com/pillarjs/cookies#cookiessetname--values--options
   */
  cookies: {
    'your-cookie': 'your cookie value',
    'cookie&option': ['cookie value', { path: '/', httpOnly: true }]
  },
  /**
   * Response body data type, optional values include `text, json, buffer`.
   * And also support types included in `mime-db`.
   * When the response body returns a file and you are not sure which type to use,
   * you can pass the file name as the value. The plugin will internally search for matching
   * `content-type` based on the file name suffix.
   * However, if it is a TypeScript file such as `a.ts`, it may not be correctly matched
   * as a JavaScript script. You need to modify `a.ts` to `a.js` as the value passed
   * in order to recognize it correctly.
   * @see https://github.com/jshttp/mime-db
   * @default 'json'
   */
  type: 'json',

  /**
   * Response Body
   * Support `string/number/array/object/buffer/ReadableStream`
   * You can also use libraries such as' mockjs' to generate data content
   * @type string | number | array | object | ReadableStream | buffer
   * @type (request: { headers, query, body, params, refererQuery, getCookie }) => any | Promise<any>
   */
  body: '',

  /**
   * If the mock requirement cannot be solved through `body` configuration,
   * then it can be achieved by configuring response and exposing the interface of http server
   * to realize fully controllable custom configuration in req parameters.
   * The parsing of query, body and params has been built-in, so you can use them directly.
   * Don't forget to return response data through `res.end()` or skip mock by calling `next()`.
   */
  response(req, res, next) {
    res.end()
  },
  /**
   * Request validator, return mock data if validated, otherwise do not use current mock.
   * This is useful in scenarios where an interface needs to return different data based
   * on different input parameters.
   * Validators can solve this type of problem well by dividing the same URL into multiple
   * mock configurations and determining which one is effective based on the validator.
   *
   * @type { headers, body, query, params, refererQuery }
   * If the validator passed in is an object,
   * then the validation method is to deeply compare whether
   * `headers/body/query/params/refererQuery` of the requested interface contain
   * the `key-value` of the validator.
   *
   * @type (request) => boolean
   * If the validator passed in is a function,
   * then the data related to the requested interface will be provided as input parameters
   * for users to perform custom validation and return a boolean.
   *
   */
  validator: {
    headers: {},
    body: {},
    query: {},
    params: {},
    /**
     * refererQuery validates the query parameters in the URL of the request source page,
     * which allows for direct modification of parameters in the browser address bar
     * to obtain different simulated data.
     */
    refererQuery: {}
  },
})
```

``` ts
// Configure the WebSocket mock
export default defineMock({
  /**
   * Request address, supports the `/api/user/:id` format.
   * The plugin matches the path through `path-to-regexp`.
   * @see https://github.com/pillarjs/path-to-regexp
   */
  url: '/api/test',
  /**
   * Value must be explicitly specified as `true`.
   * The plugin needs to make a judgment based on this field.
   */
  ws: true,
  /**
   * Configure the WebSocketServer
   * @see https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocketserver
   * If there are some additional automatically executed tasks or loop
   * tasks in the setup function,a callback needs to be passed in
   * `onCleanup()` to clear these tasks.
   * This is because when the plugin is hot updated,
   * it needs to re-execute setup and clear previous tasks; otherwise,
   * duplicate tasks may cause conflicts.
   * `onCleanup()` can be called multiple times within setup.
   * @type `(wss: WebSocketServer, context: SetupContext) => void`
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

### Request/Response Enhance

When defining methods using `headers`, `body`, and `response`, the plugin adds new content to the `request` and `response` parameters.

**In Request:**

The original type of `request` is [`Connect.IncomingMessage`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/connect/index.d.ts). The plugin adds data such as `query`, `params`, `body`, `refererQuery`, and the `getCookie(name)` method for obtaining cookie information on this basis.

```ts
type Request = Connect.IncomingMessage & {
  query: object
  params: object
  body: any
  refererQuery: object
  getCookie: (name: string, option?: Cookies.GetOption) => string | undefined
}
```

**In Response:**

The original type of `response` is `http.ServerResponse<http.IncomingMessage>`. The plugin adds `setCookie(name, value)` method for configuration cookies on this basis.

``` ts
type Response = http.ServerResponse<http.IncomingMessage> & {
  setCookie: (
    name: string,
    value?: string | null,
    option?: Cookies.SetOption,
  ) => void
}
```

> **Tips：**
>
> If you write mock files using json/json5,
> the 'response' method is not supported,
> as is the function form that uses other fields.

## Share Mock Data

Due to each `mock` file being compiled as a separate entry point, the local files they depend on are also compiled within. Additionally, each mock file has an independent scope. This means that even if multiple mock files collectively depend on a `data.ts` file, they cannot share data. If one mock file modifies the data in `data.ts`, other mock files will not receive the updated data.

To address this, the plugin offers a `defineMockData` function, which allows using `data.ts` as a shared data source within mock files.

```ts
type defineMockData<T> = (
  key: string, // key
  initialData: T, // initial data
) => [getter, setter] & { value: T }
```

### Exp

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

> **Tips：**
>
> The `defineMockData` function relies solely on the shared data support provided by `memory`.
> If persistent mock data is required, it is recommended to use a `nosql` database like `lowdb` or `level`.

## Custom-Path-Matching-Priority

> Custom rules only affect links with dynamic parameters, such as: `/api/user/:id`

The priority of the path matching rules built into the plugin can already meet most needs, but if you need more flexible customization of the matching rule priority, you can use the `priority` parameter.

Exp：

```ts
import { defineConfig } from 'vite'
import mockPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockPlugin({
      priority: {
        // The priority of matching rules is global.
        // The rules declared in this option will take priority over the default rules.
        // The higher the position of the rule in the array, the higher the priority.
        global: ['/api/:a/b/c', '/api/a/:b/c', '/api/a/b/:c'],
        // For some special cases where the priority of certain rules needs to be adjusted,
        // this option can be used. For example, when a request matches both Rule A and Rule B,
        // and Rule A has a higher priority than Rule B, but it is desired for Rule B to take effect.
        special: {
          // When both A and B or C match, and B or C is at the top of the sort order,
          // insert A into the top position.
          // The `when` option is used to further constrain the priority adjustment to
          // be effective only for certain requests.
          '/api/:a/:b/c': {
            rules: ['/api/a/:b/:c', '/api/a/b/:c'],
            when: ['/api/a/b/c']
          },
          // If no `when` is specified, it means that all requests matching the rules need to have their priorities adjusted. It can be abbreviated as `[key]: [...rules]`
          '/api/:a/b': ['/api/a/:b'],
        }
      }
    })
  ]
})
```

> **Tip:**
>
> `priority` although it can adjust the priority,
> most of the time you do not need to do so. For some special requests,
> you can use static rules instead of `priority`,
> as static rules always have the highest priority.

## Example

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

See more examples： [example](/example/)

**exp:** Match `/api/test`, And returns a response body content with empty data

``` ts
export default defineMock({
  url: '/api/test',
})
```

**exp:** Match `/api/test` , And returns a static content data

``` ts
export default defineMock({
  url: '/api/test',
  body: { a: 1 },
})
```

**exp:** Only Support `GET` Method

``` ts
export default defineMock({
  url: '/api/test',
  method: 'GET'
})
```

**exp:** In the response header, add a custom header and cookie

``` ts
export default defineMock({
  url: '/api/test',
  headers: { 'X-Custom': '12345678' },
  cookies: { 'my-cookie': '123456789' },
})
```

``` ts
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

**exp:** Define multiple mock requests for the same URL and match valid rules with validators

``` ts
export default defineMock([
  // Match /api/test?a=1
  {
    url: '/api/test',
    validator: {
      query: { a: 1 },
    },
    body: { message: 'query.a == 1' },
  },
  // Match /api/test?a=2
  {
    url: '/api/test',
    validator: {
      query: { a: 2 },
    },
    body: { message: 'query.a == 2' },
  },
  {
    // `?a=3` will resolve to `validator.query`
    url: '/api/test?a=3',
    body: { message: 'query.a == 3' }
  },
  // Hitting the POST /api/test request, and in the request body,
  // field a is an array that contains items with values of 1 and 2.
  {
    url: '/api/test',
    method: ['POST'],
    validator: { body: { a: [1, 2] } }
  }
])
```

**exp:** Response Delay

``` ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // delay 6 seconds
})
```

**exp:** The interface request failed

``` ts
export default defineMock({
  url: '/api/test',
  status: 502,
  statusText: 'Bad Gateway'
})
```

**exp:** Dynamic route matching

``` ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return { userId: params.userId }
  }
})
```

The `userId` in the route will be resolved into the `request.params` object.

**exp**:** Use the buffer to respond data

```ts
import { Buffer } from 'node:buffer'

// Since the default value of type is json,
// although buffer is used for body during transmission,
// the content-type is still json.
export default defineMock({
  url: 'api/buffer',
  body: Buffer.from(JSON.stringify({ a: 1 }))
})
```

``` ts
// When the type is buffer, the content-type is application/octet-stream.
// The data passed in through body will be converted to a buffer.
export default defineMock({
  url: 'api/buffer',
  type: 'buffer',
  // Convert using Buffer.from(body) for internal use
  body: { a: 1 }
})
```

**exp:** Response file type

Simulate file download, and pass in the file reading stream.

``` ts
import { createReadStream } from 'node:fs'

export default defineMock({
  url: '/api/download',
  // When you are unsure of the type, you can pass in the file name for internal parsing by the plugin.
  type: 'my-app.dmg',
  body: () => createReadStream('./my-app.dmg')
})
```

```html
<a href="/api/download" download="my-app.dmg">Download File</a>
```

**exp:** Use `mockjs`:

``` ts
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

You need install `mockjs`

**exp:** Use `response` to customize the response

``` ts
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

**exp:** Use json / json5

``` json
{
  "url": "/api/test",
  "body": {
    "a": 1
  }
}
```

**exp:** multipart, upload files.

use [`formidable`](https://www.npmjs.com/package/formidable#readme) to support.

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

fields `files` mapping to `formidable.File`

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

``` ts
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

``` ts
fetch('/api/graphql', {
  method: 'POST',
  body: JSON.stringify({ source: '{ hello }' })
})
```

**exp:** WebSocket Mock

``` ts
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

``` ts
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

## Mock Services

In some scenarios, it may be necessary to use the data provided by mock services for display purposes, but the project may have already been packaged, built and deployed without support from `Vite` and this plugin's mock service. Since this plugin supports importing various `node` modules in mock files at the design stage, the mock file cannot be inline into client build code.

To meet such scenarios, on one hand, the plugin provides support under `vite preview`, and on the other hand, it also builds a small independent mock service application that can be deployed to relevant environments during `vite build`. This can then be forwarded through other HTTP servers like Nginx to actual ports for mock support.

The default output is built into the directory `dist/mockServer`, generating files as follows:

``` sh
./mockServer
├── index.js
├── mock-data.js
└── package.json
```

In this directory, execute `npm install` to install dependencies, and then execute `npm start` to start the mock server.

The default port is `8080`.

You can access related `mock` interfaces through `localhost:8080/`.

## Archives

[awesome-vite](https://github.com/vitejs/awesome-vite#helpers)

## Contributors

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://pengzhanbo.cn"><img src="https://avatars.githubusercontent.com/u/16745751?v=4?s=100" width="100px;" alt="pengzhanbo"/><br /><sub><b>pengzhanbo</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=pengzhanbo" title="Documentation">📖</a> <a href="#ideas-pengzhanbo" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-pengzhanbo" title="Examples">💡</a> <a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=pengzhanbo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jiadesen"><img src="https://avatars.githubusercontent.com/u/22772994?v=4?s=100" width="100px;" alt="jiadesen"/><br /><sub><b>jiadesen</b></sub></a><br /><a href="#ideas-jiadesen" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues?q=author%3Ajiadesen" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/yogibaba"><img src="https://avatars.githubusercontent.com/u/152670?v=4?s=100" width="100px;" alt="yogibaba"/><br /><sub><b>yogibaba</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=yogibaba" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pfdgithub"><img src="https://avatars.githubusercontent.com/u/3262762?v=4?s=100" width="100px;" alt="pfdgithub"/><br /><sub><b>pfdgithub</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=pfdgithub" title="Code">💻</a> <a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues?q=author%3Apfdgithub" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## LICENSE

[MIT](/LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_large)
