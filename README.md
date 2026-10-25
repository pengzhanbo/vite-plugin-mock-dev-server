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
  <img alt="package esm only" src="https://img.shields.io/badge/package-ESM--only-ffe536.svg">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/pengzhanbo/vite-plugin-mock-dev-server/release.yaml?style=flat-square">
  <a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_shield"><img alt="fossa status" src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=shield"></a>
</p>
<br>
<p align="center">
  <span>English</span> | <a href="/README.zh-CN.md">简体中文</a>
</p>
<br>
<br>

## Features

- ⚡️ Lightweight, Flexible, Fast.
- 🧲 Not injection-based, non-intrusive to client code.
- 💡 Pure ESModule.
- 🦾 Typescript.
- 🔥 HMR
- 🏷 Support `.[cm]?js` / `.ts` / `.json` / `.json5`.
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
- ⚜️ Support `WebSocket Mock` and `Server-Sent Events Mock`
- 🎭 Support switching mock data by scene.
- 🎲 Support random error simulation for a mock.
- 📝 Support **recording** and **replay requests**
- 🗂 Support building small independent deployable mock services.

## Documentation

See the [documentation](https://vite-plugin-mock-dev-server.netlify.app/) for more details.

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

> [!IMPORTANT]
> The plugin no longer supports `CommonJS` imports. Please use `ESModule` to import the plugin.

---

> [!IMPORTANT]
> The current document is for the `v2` version of the plugin. If you are using the `v1` version, please refer to the [Migration Guide](https://vite-plugin-mock-dev-server.netlify.app/guide/migrate-v2).

## Install

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
> - Node.js `^20.19.0 || >=22` and Vite `>=5` are required.
> - Mock files are bundled by [`rolldown`](https://rolldown.rs/) when it is installed, otherwise by [`esbuild`](https://esbuild.github.io/).

## Usage

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [mockDevServerPlugin(/* plugin options */)],
  // The fields defined here can also be used in mock.
  define: {},
  server: {
    // plugin will read `server.proxy`
    proxy: {
      '^/api': { target: 'http://example.com' },
    },
  },
})
```

The plugin enables mock matching for requests whose path matches a `server.proxy` key (WebSocket proxies are excluded) or an `options.prefix` entry.

WebSocket mocks are matched by `options.wsPrefix` only. Entries configured in `wsPrefix` are removed from `server.proxy` by the plugin, to avoid conflicts between the Vite WebSocket proxy and the mock WebSocket server.

```ts
export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      wsPrefix: ['/socket.io'],
    }),
  ],
})
```

The plugin also reads `define`, `resolve.alias` and `env`, which can be used directly in mock files.

## Edit Mock File

By default, write mock data in the `mock` directory of your project's root directory:

`mock/**/*.mock.ts` :

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user/:id',
  body: { a: 1, b: 2 },
})
```

A mock file can export a single mock item, an array of items (recommended), or an object whose values are items. `defineMock()` is only a type helper: it returns the configuration as is.

```ts
export default defineMock([
  { url: '/api/users', body: [] },
  { url: '/api/users/:id', body: ({ params }) => ({ id: params.id }) },
])
```

Mock files are bundled by `rolldown` / `esbuild`, so TypeScript and ESM syntax, `node:` built-in modules and third-party packages are all available. `viteConfig.define`, `viteConfig.env` and `viteConfig.resolve.alias` are injected as well.

A mock file, and every local file it imports, is watched. Editing them re-compiles only the affected rules; set [`reload`](#reload) to `true` if the page should be refreshed after the update.

`.json` / `.json5` mock files only support static data: function fields such as `body(request)` and `response` cannot be used.

## Methods

### mockDevServerPlugin(pluginOptions)

Vite plugin. It returns an array of plugins (`Plugin[]`); when `options.enabled` is `false`, an empty array is returned and the mock server is disabled.

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [mockDevServerPlugin({/* plugin options */})],
})
```

### defineMock(mockOptions)

Mock Options Type Helper. It accepts a single mock item, an array of items, or an object of items.

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {},
})
```

### createDefineMock(transformer)

Return a custom defineMock function to support preprocessing of mock config.

The `transformer` receives each mock item, may mutate it in place or return a new item, and is applied to every item when an array is passed.

```ts
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

// Preprocessed mock url
const defineAPIMock = createDefineMock((mock) => {
  mock.url = path.join('/api', mock.url)
})

export default defineApiMock({
  url: '/test', // Complete as '/api/test'
})
```

### defineMockData(key, initialData, options)

Create a data source shared by all mock files. See [Share Mock Data](#share-mock-data).

### createSSEStream(req, res)

Create a `Server-sent events` write stream to support mocking `EventSource`.

`sse.write()` accepts `{ data, event, id, retry, comment }`; object `data` is serialized as JSON. Call `sse.end()` when the stream is finished.

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

### Types

The public types (`MockServerPluginOptions`, `MockHttpItem`, `MockWebsocketItem`, `MockOptions`, `MockRequest`, `MockResponse`, `FormidableFile`, ...) are exported from the package root, and are also available from the `vite-plugin-mock-dev-server/types` subpath.

## Plugin Options

### enabled

- **Type:** `boolean`
- **Default:** `true`
- **Details:**

  Whether to enable mock server. If set to `false`, no plugin is registered (an empty array is returned) and the mock server will not work.

### prefix

- **Type:** `string | string[]`
- **Default:** `[]`
- **Details:**

  Configure custom matching rules for the mock server. Any request path starting with the value of `prefix` will be proxied to the corresponding target. If the `prefix` value starts with ^, it will be recognized as a RegExp.

  > In general, `server.proxy` is sufficient to meet the needs. Adding this item is for compatibility with certain scenarios.

### wsPrefix

- **Type:** `string | string[]`
- **Default:** `[]`
- **Details:**

  Configure the matching rules for the WebSocket service. Any request path starting with the value of `wsPrefix` and using the `ws/wss` protocol will be proxied to the corresponding target.

  If the value of `wsPrefix` starts with `^`, it will be recognized as a RegExp.

  > Different from using `viteConfig.server.proxy` by default for http mock, `websocket mock` does not use the ws-related configuration in `viteConfig.server.proxy`. Also, rules configured in `wsPrefix` cannot be configured simultaneously in `viteConfig.server.proxy`, as it will cause conflicts when starting the vite server because multiple instances of WebSocketServer cannot be implemented for the same request.
  > This conflict is neither a problem with Vite nor with the plugin; it belongs to a reasonable error type. When switching between WebSocket Mock and WebSocket Proxy, please pay attention to avoid duplicate configurations that may cause conflicts.
  >
  > To avoid the conflict, the plugin removes the entries of `wsPrefix` from `server.proxy` before the Vite server starts. Proxies declared with `ws: true` in `server.proxy` are not used for mock matching (neither HTTP nor WebSocket).

### cwd

- **Type:** `string`
- **Default:** `process.cwd()`
- **Details:**

  Configure the matching context for `include` and `exclude`.

### dir

- **Type:** `string`
- **Default:** `'mock'`
- **Details:**

  Configure the directory to read mock files.

### include

- **Type:** `string | string[]`
- **Default:** `['**/*.mock.{js,ts,cjs,mjs,json,json5}']`
- **Details:**

  Configure to read mock files, which can be a directory, glob, or an array.

  Patterns starting with `!` are treated as exclusions, and files inside `node_modules` are always ignored.

### exclude

- **Type:** `string | string[]`
- **Default:** `[]`
- **Details:**

  When reading mock files for configuration, the files that need to be excluded can be a directory, glob, or array. Files inside `node_modules` are always ignored, even when they are not listed here.

### reload

- **Type:** `boolean`
- **Default:** `false`
- **Details:**

  When the mock resource is hot updated, only the data content is updated, but the page is not refreshed by default. If you want to refresh the page every time you modify the mock file, you can open this option.

### awaitInitialLoad

- **Type:** `boolean`
- **Default:** `true` in a test environment (`NODE_ENV=test`, Vitest or Jest), otherwise `false`
- **Details:**

  Whether to wait for the initial mock files to be compiled before the dev server starts serving requests.

  Mock files are compiled in the background by default, so the first requests after a cold start may arrive before the compilation has finished and fall through to the real proxy (or return a 404). Enabling this option delays the startup until every mock file is loaded; the trade-off is a slower startup, proportional to the number of mock files. It is useful for integrations that send requests immediately after the server is created, such as `page.goto` in end-to-end tests.

  The middleware is registered before the wait, so requests arriving during the initial load still pass through the mock layer.

### activeScene

- **Type:** `string | string[]`
- **Default:** `[]`
- **Details:**

  Active scenario(s) for filtering mocks.

  Only mocks whose [`scene`](#optionsscene) intersects with this value (or have no `scene` configured) will be considered for matching. Can be overridden per-request via the `X-Mock-Scene` header.

### cors

- **Type:** `boolean | CorsOptions`
- **Default:** `true`
- **Details:**

  Enable by default. Configure to `cors`, see [cors](https://github.com/expressjs/cors#configuration-options).

  The plugin inherits Vite's `server.cors` configuration, and disabling either `cors` or `server.cors` (setting it to `false`) turns CORS off. When the inherited configuration does not restrict the origin (`server.cors` is `true` or has no `origin`), mock responses only allow Vite's default localhost origins (`localhost`, `127.0.0.1`, `[::1]`) instead of every origin; set `origin` explicitly (such as `origin: '*'`) to allow other origins.

  CORS preflight requests (`OPTIONS` with `Access-Control-Request-Method`) are answered by the plugin when the path has a mock that supports the requested method, and are passed through otherwise.

### log

- **Type:** `boolean | 'info' | 'warn' | 'error' | 'silent' | 'debug'`
- **Default:** `'info'`
- **Details:**

  Enable log and configure log level. `false` is equivalent to `'silent'`.

### formidableOptions

- **Type:** `formidable.Options`
- **Details:**

  Configure to `formidable`, see [formidable options](https://github.com/node-formidable/formidable#options)

  example: Configure to file upload dir

  ```ts
  mockDevServerPlugin({
    formidableOptions: {
      uploadDir: path.join(process.cwd(), 'uploads'),
    },
  })
  ```

### cookiesOptions

- **Type:** `CookiesOption`
- **Details:**

  Configure to `cookies`, see [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

### bodyParserOptions

- **Type:** `BodyParserOptions`
- **Details:**

  Configure to `co-body`, see [co-body](https://github.com/cojs/co-body#options).

  The `limit` / `jsonLimit` / `formLimit` / `textLimit` options of `co-body` only take effect after the whole body has been buffered, so they cannot protect the memory of the dev server. `maxBodySize` (default `'50mb'`, `0` disables it) limits the raw request body while it is being read; requests exceeding it are answered with `413 Payload Too Large`. The smaller one of `maxBodySize` and the matching `co-body` limit is used.

  ```ts
  mockDevServerPlugin({
    bodyParserOptions: {
      jsonLimit: '10mb',
      // Raw body limit, exceeded requests get 413; `0` disables it
      maxBodySize: '32mb',
    },
  })
  ```

### build

- **Type:** `boolean | ServerBuildOption`
- **Default:** `false`
- **Details:**

  The configuration needed to build a small, independently deployable mock service.

  ```ts
  interface ServerBuildOption {
    /**
     * server port
     * @default 8080
     */
    serverPort?: number
    /**
     * build output dir, resolved against Vite `build.outDir` when relative
     * @default 'mockServer'
     */
    dist?: string
    /**
     * log level
     * @default 'error'
     */
    log?: LogLevel
    /**
     * Whether to bundle recorded request files into the output
     * Independent of `record.enabled`, so existing recordings can be
     * included when only replay is enabled.
     * @default the resolved `replay` option (which follows `record.enabled`)
     */
    includeRecord?: boolean
  }
  ```

  The generated server listens on `serverPort` by default; the `PORT` environment variable overrides it and `HOST` sets the host to listen on (all interfaces by default).

  Options that cannot be serialized (such as a `RegExp` / function `cors.origin`, or functions inside `formidableOptions`) are reported with a build-time warning and ignored in the generated server. A configured `formidableOptions.uploadDir` is relocated to a directory inside the output by the same name, so the generated server stays portable.

### record

- **Type:** `false | RecordOptions`
- **Default:** `false`
- **Details：**

  Whether to enable the request recording feature. Once enabled, the plugin will record all request data for subsequent request playback.

  Based on `vite.server.proxy`, the plugin records request data proxied by `http-proxy` (non-WebSocket proxies only). After receiving a response, the plugin writes the request data and response data to the specified directory.

  Recordings are stored as pretty-printed JSON, one file per pathname (for example `mock/.recordings/api-users-1a2b3c4d.json`, the suffix is a short hash of the pathname). A `.gitignore` containing `*` is created in the recording directory by default; set `gitignore: false` to disable it.

  Compressed text responses (`gzip` / `deflate` / `br` / `zstd`) are decompressed before being stored, so the recordings stay readable. `zstd` uses built-in `zlib` on Node.js `>=22.15`, otherwise it requires the optional `zstd-codec` package.

  ````ts
  interface RecordOptions {
    /**
     * Whether to enable the record feature
     * - true: Enable, automatically record proxy responses
     * - false: Disable (default)
     * @default false
     */
    enabled?: boolean
    /**
     * Filter requests to record
     * - Function: Custom filter function, return true to record
     * - Object: Include/exclude patterns with glob or path-to-regexp mode
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
           * Include the request links that need to be recorded
           *
           * String: Glob pattern or path-to-regexp pattern
           * (Use the mode option to set the mode, default is glob)
           *
           * When omitted, all requests are included, and only `exclude` filters.
           */
          include?: string | string[]
          /**
           * Exclude request links that do not need to be recorded
           *
           * String: Glob pattern or path-to-regexp pattern
           * (Use the mode option to set the mode, default is glob)
           */
          exclude?: string | string[]
          /**
           * Matching mode for include/exclude patterns
           * - 'glob': Glob pattern matching (default)
           * - 'path-to-regexp': Path-to-regexp pattern matching
           */
          mode: 'glob' | 'path-to-regexp'
        }

    /**
     * Directory to store recorded data
     * Relative to the `dir` option (default `mock`)
     * @default 'mock/.recordings'
     */
    dir?: string
    /**
     * Whether to overwrite existing recorded data
     * - true: Overwrite old data for the same request (default)
     * - false: Keep old data, do not record new data
     * @default true
     */
    overwrite?: boolean
    /**
     * Expiration time for recorded data in seconds
     * - 0: Never expire (default)
     * - Positive number: Expire after specified seconds
     * @default 0
     */
    expires?: number
    /**
     * Status codes to record
     * - Empty array: Record all status codes (default)
     * - Specify one or more status codes to filter
     * @default []
     */
    status?: number | number[]
    /**
     * Should a .gitignore be added to the recording directory
     * - true: Add (default)
     * - false: Do not add
     * @default true
     */
    gitignore?: boolean
  }
  ````

### replay

- **Type:** `boolean`
- **Default:** `false` (automatically `true` when `record.enabled` is `true`; set it to `false` explicitly to disable replay)
- **Details：**

  Whether to enable the request playback feature. Once enabled, the plugin will simulate responses based on the recorded request data.

  Replay is only used when no mock rule matches the request. Expired recordings (`record.expires`) are ignored, and when `record.status` is not configured a recording with status `200` is preferred.

  Replay works independently of recording, `replay: true` can be used with `record: { enabled: false }` to reuse existing recordings. A warning is printed at startup when recording is disabled.

### priority

- **Type:** `MockMatchPriority`
- **Details:**

  Custom path matching rule priority。[read more](#custom-path-matching-priority)

## Mock Options

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

- **Type:** `string`
- **Details:**

  The interface address that needs to be mocked, supported by [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) for path matching.

  ```txt
  /api/login
  /api/post/:id
  /api/users{/:id}    # optional segment
  /api/files/*path    # wildcard
  ```

  A query string included in `url` (such as `/api/test?a=1`) is parsed into the [`validator.query`](#optionsvalidator) of the mock.

  When several rules match the same request, static rules win over dynamic ones, then rules with fewer parameters, and wildcards have the lowest priority.

### options.enabled

- **Type:** `boolean`
- **Default:** `true`
- **Details:**

  Whether to enable mock for this interface. In most scenarios, we only need to mock some interfaces instead of all requests that have been configured with mock.
  Therefore, it is important to be able to configure whether to enable it or not.

### options.log

- **Type:** `boolean | 'info' | 'warn' | 'error' | 'silent' | 'debug'`
- **Default:** follows the plugin [`log`](#log) option
- **Details:**

  Configure the log level for this mock only. Useful to silence a mock that is requested very frequently.

### options.scene

- **Type:** `string | string[]`
- **Default:** `''`
- **Details:**

  Scenario identifier for this mock.

  When not configured, the mock is universal and always matches regardless of active scenario. When configured, the mock only matches when at least one of its scenarios matches one of the active scenarios (the [`activeScene`](#activescene) option or the `X-Mock-Scene` header).

  For the same `url`, mocks with a `scene` are matched before mocks without one, so a matching scene takes precedence over a validator of a universal mock.

### options.method

- **Type:** `Method | Method[]`

  ```ts
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'
  ```

- **Default:** `['GET', 'POST']`
- **Details:**

  The request methods allowed by the interface. Method names are case-insensitive (`'get'` is equivalent to `'GET'`), and an empty array falls back to the default.

### options.type

- **Type:** `'text' | 'json' | 'buffer' | string`
- **Default:** `'json'`
- **Details:**

  Response body data type. It determines the `Content-Type` header, and also supports types included in [mime-db](https://github.com/jshttp/mime-db).

  When the response body returns a file and you are not sure which type to use,
  you can pass the file name as the value. The plugin will internally search for matching
  `content-type` based on the file name suffix. For a TypeScript file such as `a.ts`, pass `a.js` instead, otherwise it may not be recognized as a JavaScript file.

### options.headers

- **Type:** `object | (request: MockRequest) => object | Promise<object>`
- **Default:** `{ 'Content-Type': <resolved from type> }`
- **Details:**

  Configure the response headers. The function form can be asynchronous.

  The plugin always sets `Content-Type` from [`type`](#optionstype), `Cache-Control: no-cache, max-age=0`, `X-Mock-Power-By: vite-plugin-mock-dev-server` and `X-File-Path` (path of the mock file); values returned by `headers` override them. Invalid header names or values are logged and skipped.

### options.status

- **Type:** `number`
- **Default:** `200`
- **Details:**

  Configure Response Header Status Code

### options.statusText

- **Type:** `string`
- **Default:** resolved from `status` (for example `OK` for `200`, `Not Found` for `404`)
- **Details:**

  Configure response header status text

### options.delay

- **Type:** `number | [number, number]`
- **Default:** `0`
- **Details:**

  Configure response delay time, If an array is passed in, it represents the range of delay time.

  The delay is measured from the request start time, and the time already spent on request parsing is deducted; if the parsing time already exceeds the configured delay (the upper bound for the array form), the response is sent immediately. Invalid values (negative numbers, `min > max`, malformed arrays) are normalized or ignored at compile time with a warning.

  unit: `ms`

### options.body

- **Type:** `Body | (request: MockRequest) => Body | Promise<Body>`

  ```ts
  type Body = string | number | object | any[] | Buffer | Readable | null
  ```

- **Details:**

  Configure response body data content. `body` takes precedence over `response`.

  When `type` is `buffer`, the content is converted to a `Buffer`; a `Readable` stream is piped to the response, which supports simulating file downloads.

### options.response

- **Type:** `(req: MockRequest, res: MockResponse, next: (err?: any) => void) => void | Promise<void>`
- **Details:**

  If you need to set complex response content, you can use the response method,
  which is a middleware. Here, you can get information such as req
  and res of the http request,
  and then return response data through res.write() | res.end().
  Otherwise, you need to execute next() method.
  In `req`, you can also get parsed request information such as
  `query`, `params`, `body` and `refererQuery`.

  Errors thrown by `response` are logged, and the current response is aborted instead of crashing the dev server.

### options.cookies

- **Type:** `CookiesOptions | (request: MockRequest) => CookiesOptions | Promise<CookiesOptions>`

  ```ts
  type CookiesOptions = Record<string, CookieValue>

  type CookieValue = string | [string, SetCookieOption]
  ```

- **Details:**

  Configure response body cookies. An array value is `[value, options]`, where `options` is the [`cookies` set option](https://github.com/pillarjs/cookies#cookiessetname--values--options). Invalid cookie names or options are logged and skipped without affecting the other cookies.

### options.validator

- **Type:** `Validator | (request: MockRequest) => boolean`

  ```ts
  interface Validator {
    /**
     * The query string located after `?` in the request address has been parsed into JSON.
     */
    query: Record<string, any>
    /**
     * The queryString located after `?` in the referer request has been parsed as JSON.
     */
    refererQuery: Record<string, any>
    /**
     * Body data in the request
     */
    body: Record<string, any>
    /**
     * The params parameter parsed from the `/api/id/:id` in the request address.
     */
    params: Record<string, any>
    /**
     * headers data in the request
     */
    headers: Headers
  }
  ```

- **Details:**

  Request Validator

  Sometimes, for the same API request, data needs to be returned based
  on different request parameters.

  However, if all of this is written in a single mock's body or response,
  the content can become cumbersome and difficult to manage.
  The function of a validator allows you to configure multiple mocks with
  the same URL simultaneously and determine which mock should be used through validation.

  All fields are optional. An object validator performs a deep subset comparison: only the declared fields (and nested keys) are compared, and header names are case-insensitive. For arrays, the declared items only need to exist in the request array (containment, order-independent). Query parameters written in `url` (such as `/api/test?a=1`) are merged into `validator.query`. A function validator receives the request and returns a boolean.

  A validator that throws is logged and treated as a non-match, so the next rule is tried instead of failing the request.

  For the same URL, mocks are tried in this order: mocks with `scene`, then a function validator, then object validators (more keys first), and finally mocks without a validator as the fallback.

### options.ws

- **Type:** `boolean`
- **Default:** `false`
- **Details:**

  Enable WebSocket interface simulation. With `ws: true`, the item is handled by the mock WebSocket server (its HTTP response fields are ignored), `scene` and the matching priority rules apply as well, and the path must be covered by [`wsPrefix`](#wsprefix).

### options.setup

- **Type:** `(wss: WebSocketServer, ctx: WebSocketSetupContext) => void`
- **Required:** yes, when `ws` is `true`
- **Details:**

  Configure Websocket Server. `setup()` is re-executed when the mock file is updated; use `onCleanup()` to clear timers and listeners created by the previous run.

```ts
interface WebSocketSetupContext {
  /**
   * When defining WSS, you may perform some automatic or looping tasks.
   * However, when hot updating, the plugin will re-execute `setup()`,
   * which may result in duplicate registration of listening events and looping tasks
   * such as setTimeout. You can use `onCleanup()` to clear these automatic or looping tasks.
   */
  onCleanup: (cleanup: () => void) => void
}
```

### options.error

- **Type:** `MockErrorConfig | undefined`
- **Details:**

  Configure error simulation, including error probability, error status code, error status text, and custom error response body.

```ts
interface MockErrorConfig {
  /**
   * Error probability (0-1), default is 0.5
   * @default 0.5
   */
  probability?: number
  /**
   * Error status code, default is 500
   * @default 500
   */
  status?: number
  /**
   * Error status text
   */
  statusText?: string
  /**
   * Custom error response body, suitable for when the status is 200, but the response body needs to simulate an error scenario
   * @example
   * { code: 500, msg: 'Internal Server Error', result: null }
   */
  body?: ResponseBody | ResponseBodyFn
}
```

## Request/Response Enhance

When defining methods using `headers`, `body`, and `response`, the plugin adds new content to the `request` and `response` parameters.

**In Request:**

The original type of `request` is [`http.IncomingMessage`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/connect/index.d.ts). The plugin adds data such as `query`, `params`, `body`, `refererQuery`, and the `getCookie(name)` method for obtaining cookie information on this basis.

```ts
type Request = http.IncomingMessage & {
  query: object
  params: object
  body: any
  refererQuery: object
  headers: Headers
  getCookie: (name: string, option?: GetCookieOption) => string | void
}
```

The request body is parsed according to `Content-Type`: `application/json`, `application/x-www-form-urlencoded`, `text/plain`, and `multipart/form-data` (via `formidable`, files are exposed as `formidable.File`). Requests exceeding [`bodyParserOptions.maxBodySize`](#bodyparseroptions) are answered with `413`.

**In Response:**

The original type of `response` is `http.ServerResponse<http.IncomingMessage>`. The plugin adds `setCookie(name, value, option?)` method for configuration cookies on this basis.

```ts
type Response = http.ServerResponse<http.IncomingMessage> & {
  setCookie: (name: string, value: string, option?: SetCookieOption) => void
}
```

When using `response(req, res, next)`, you must either end the response (`res.end()`) or call `next()` yourself.

## Share Mock Data

Due to each `mock` file being compiled as a separate entry point, the local files they depend on are also compiled within. Additionally, each mock file has an independent scope. This means that even if multiple mock files collectively depend on a `data.ts` file, they cannot share data. If one mock file modifies the data in `data.ts`, other mock files will not receive the updated data.

To address this, the plugin offers a `defineMockData` function, which allows using `data.ts` as a shared data source within mock files.

```ts
type defineMockData<T> = (
  key: string, // key
  initialData: T, // initial data
  options?: {
    persistOnHMR?: boolean // persist the data value on HMR
  }, // options
) => [getter, setter] & { value: T }
```

The returned tuple is callable: call it without arguments to read the current value, or call it with a new value (or an updater function) to write it. `.value` provides direct get/set access.

`persistOnHMR` defaults to `false`: when a mock file is hot updated, the data is reset to the newly compiled `initialData` if it changed. Set it to `true` to keep the current value across hot updates.

### Examples

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

The setter accepts a value or an updater function:

```ts
posts([...posts.value, newPost])
posts((list) => [...list, newPost])
```

> **Tips：**
>
> The `defineMockData` function relies solely on the shared data support provided by `memory`.
> If persistent mock data is required, it is recommended to use a `nosql` database like `lowdb` or `level`.

## Scenes

Use [`scene`](#optionsscene) to keep several variants of the same API and switch between them globally or per request.

`mock/user.mock.ts`

```ts
export default defineMock([
  { url: '/api/user', body: { name: 'default' } },
  { url: '/api/user', scene: 'test', body: { name: 'test user' } },
  { url: '/api/user', scene: ['dev', 'staging'], body: { name: 'dev user' } },
])
```

Activate scenes with the plugin option:

```ts
mockDevServerPlugin({
  activeScene: ['test'],
})
```

Or override it for a single request with the `X-Mock-Scene` header (comma-separated values are supported):

```sh
curl -H 'X-Mock-Scene: test' http://localhost:5173/api/user
```

A mock whose scene does not match is skipped, falling back to the universal mock of the same URL.

## Custom-Path-Matching-Priority

> Custom rules only affect links with dynamic parameters, such as: `/api/user/:id`

The built-in order is: static rules first, then rules with fewer dynamic parameters, optional parameters rank lower than required ones, and wildcards rank last.

The priority of the path matching rules built into the plugin can already meet most needs, but if you need more flexible customization of the matching rule priority, you can use the `priority` parameter.

Exp：

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
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
            when: ['/api/a/b/c'],
          },
          // If no `when` is specified, it means that all requests matching the rules need to have their priorities adjusted. It can be abbreviated as `[key]: [...rules]`
          '/api/:a/b': ['/api/a/:b'],
        },
      },
    }),
  ],
})
```

When a request satisfies several `special` rules at once, all of them are promoted to the front (not only the first one), and the declaration order is preserved.

> **Tip:**
>
> `priority` although it can adjust the priority,
> most of the time you do not need to do so. For some special requests,
> you can use static rules instead of `priority`,
> as static rules always have the highest priority.

## Examples

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

See more examples： [example](/example/)

<details>
<summary>Match <code>/api/test</code>, And returns a response body content with empty data</summary>

```ts
export default defineMock({
  url: '/api/test',
})
```

</details>

<details>
<summary>Match <code>/api/test</code> , And returns a static content data</summary>

```ts
export default defineMock({
  url: '/api/test',
  body: { a: 1 },
})
```

</details>

<details>
<summary>Only Support <code>GET</code> Method</summary>

```ts
export default defineMock({
  url: '/api/test',
  method: 'GET',
})
```

</details>

<details>
<summary>In the response header, add a custom header and cookie</summary>

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
<summary>Define multiple mock requests for the same URL and match valid rules with validators</summary>

```ts
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
    body: { message: 'query.a == 3' },
  },
  // Hitting the POST /api/test request, and in the request body,
  // field a is an array that contains items with values of 1 and 2.
  {
    url: '/api/test',
    method: ['POST'],
    validator: { body: { a: [1, 2] } },
  },
])
```

</details>

<details>
<summary>Response Delay</summary>

```ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // delay 6 seconds
})
```

</details>

<details>
<summary>The interface request failed</summary>

```ts
export default defineMock({
  url: '/api/test',
  status: 502,
  statusText: 'Bad Gateway',
})
```

</details>

<details>
<summary>Dynamic route matching</summary>

```ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return { userId: params.userId }
  },
})
```

The `userId` in the route will be resolved into the `request.params` object.

</details>

<details>
<summary>Use the buffer to respond data</summary>

```ts
import { Buffer } from 'node:buffer'

// Since the default value of type is json,
// although buffer is used for body during transmission,
// the content-type is still json.
export default defineMock({
  url: 'api/buffer',
  body: Buffer.from(JSON.stringify({ a: 1 })),
})
```

```ts
// When the type is buffer, the content-type is application/octet-stream.
// The data passed in through body will be converted to a buffer.
export default defineMock({
  url: 'api/buffer',
  type: 'buffer',
  // Convert using Buffer.from(body) for internal use
  body: { a: 1 },
})
```

</details>

<details>
<summary>Response file type</summary>

Simulate file download, and pass in the file reading stream.

```ts
import { createReadStream } from 'node:fs'

export default defineMock({
  url: '/api/download',
  // When you are unsure of the type, you can pass in the file name for internal parsing by the plugin.
  type: 'my-app.dmg',
  body: () => createReadStream('./my-app.dmg'),
})
```

```html
<a href="/api/download" download="my-app.dmg">Download File</a>
```

</details>

<details>
<summary>Use <code>mockjs</code></summary>

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

You need install `mockjs`

</details>

<details>

<summary>Use <code>response</code> to customize the response</summary>

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
<summary>Use json / json5</summary>

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
<summary>multipart, upload files.</summary>

use [`formidable`](https://www.npmjs.com/package/formidable#readme) to support.

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

fields `files` mapping to `formidable.File`

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

## Record and Replay

Record responses forwarded by `server.proxy`, then replay them when no mock rule matches — useful for working offline, debugging, or sharing responses with teammates.

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

Recordings are stored as JSON files under `mock/.recordings`. Replay is enabled automatically together with recording; to reuse existing recordings without recording new requests:

```ts
mockDevServerPlugin({
  record: { enabled: false },
  replay: true,
})
```

Notes:

- Only responses of non-WebSocket proxies are recorded.
- `record.filter`, `record.status`, `record.expires` and `record.overwrite` control what is recorded and how long it is kept.
- Compressed responses are decompressed before being stored, so recordings stay readable.
- A recording is replayed only when no mock rule matches the request; otherwise the mock rule wins.

See [`record`](#record) and [`replay`](#replay) for all options.

## Mock Services

In some scenarios, it may be necessary to use the data provided by mock services for display purposes, but the project may have already been packaged, built and deployed without support from `Vite` and this plugin's mock service. Since this plugin supports importing various `node` modules in mock files at the design stage, the mock file cannot be inline into client build code.

To meet such scenarios, on one hand, the plugin provides support under `vite preview`, and on the other hand, it also builds a small independent mock service application that can be deployed to relevant environments during `vite build`. This can then be forwarded through other HTTP servers like Nginx to actual ports for mock support.

The default output is built into the directory `dist/mockServer` (the `build.dist` option, resolved against Vite's `build.outDir` when relative), generating files as follows:

```sh
./mockServer
├── index.js
├── mock-data.js
├── package.json
└── mock/.recordings/...   # only when `build.includeRecord` is enabled
```

In this directory, execute `npm install` to install dependencies, and then execute `npm start` to start the mock server.

The default port is `8080`. The `PORT` environment variable overrides it, and `HOST` sets the host to listen on (all interfaces by default):

```sh
PORT=9000 HOST=127.0.0.1 npm start
```

You can access related `mock` interfaces through `localhost:8080/`.

## Links

- [vite](https://vitejs.dev/)
- [awesome-vite](https://github.com/vitejs/awesome-vite#helpers)
- [rspack-plugin-mock](https://github.com/pengzhanbo/rspack-plugin-mock) - **Rspack** and **Rsbuild** plugin for API mock server

## Contributing

Please read the [Contributing Guide](./CONTRIBUTING.md) before contributing to this project.

## Contributors

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors-)
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
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chuyuandu"><img src="https://avatars.githubusercontent.com/u/6959138?v=4?s=100" width="100px;" alt="chuyuan du"/><br /><sub><b>chuyuan du</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=chuyuandu" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.hlwen.com"><img src="https://avatars.githubusercontent.com/u/13469676?v=4?s=100" width="100px;" alt="hlwen"/><br /><sub><b>hlwen</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues?q=author%3Ahlwen" title="Bug reports">🐛</a> <a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=hlwen" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/weibangtuo"><img src="https://avatars.githubusercontent.com/u/4394281?v=4?s=100" width="100px;" alt="weibt"/><br /><sub><b>weibt</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=weibangtuo" title="Documentation">📖</a> <a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=weibangtuo" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Yuan-ZW"><img src="https://avatars.githubusercontent.com/u/31435244?v=4?s=100" width="100px;" alt="Yuan-ZW"/><br /><sub><b>Yuan-ZW</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues?q=author%3AYuan-ZW" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://yils.blog/"><img src="https://avatars.githubusercontent.com/u/62397373?v=4?s=100" width="100px;" alt="YILS"/><br /><sub><b>YILS</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues?q=author%3AYILS-LIN" title="Bug reports">🐛</a> <a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commits?author=YILS-LIN" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jbleijenbergh"><img src="https://avatars.githubusercontent.com/u/352080?v=4?s=100" width="100px;" alt="jbleijenbergh"/><br /><sub><b>jbleijenbergh</b></sub></a><br /><a href="https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues?q=author%3Ajbleijenbergh" title="Bug reports">🐛</a></td>
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

The plugin is licensed under the [MIT License](./LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_large)
