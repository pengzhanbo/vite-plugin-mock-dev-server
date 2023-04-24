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

- ⚡️ light weight，flexible，fast.
- 🧲 Not injection-based, non-intrusive to client code.
- 💡 ESModule/commonjs.
- 🦾 Typescript.
- 🔥 HMR
- 🏷 Support `json` / `json5`.
- 📦 Auto import mock file.
- 🎨 Support any lib，like `mockjs`，or not use it.
- 📥 Path rule matching, request parameter matching.
- ⚙️ Support Enabled/Disabled any one of api mock
- 📀 Supports response body content type such as `text/json/buffer/stream`.
- ⚖️ Use `server.proxy`
- 🍕 Support `viteConfig.define` in mock file.
- ⚓️ Support `viteConfig.resolve.alias` in mock file.
- 🌈 Support `vite preview` mode.
- 📤 Support `multipart` content-type，mock upload file.
- 📥 Support mock download file.
- 🗂 Support building small independent deployable mock services.


## Documentation

See the [documentation](https://vite-plugin-mock-dev-server.netlify.app/) to learn more.

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

## Playground

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/pengzhanbo/vite-plugin-mock-dev-server/tree/main/playground)

## Usage

### Install

```sh
# npm
npm i -D vite-plugin-mock-dev-server
# yarn 
yarn add vite-plugin-mock-dev-server
# pnpm
pnpm add -D vite-plugin-mock-dev-server
```

### Configuration

`vite.config.ts`
```ts
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
      '^/api': {
        target: 'http://example.com'
      }
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

`mock/api.mock.ts` :
```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {
    a: 1,
    b: 2,
  }
})
```

## Methods

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

  **Type:** `string | string[]`
  
  Configure custom matching rules for mock server. Any request path starting with the value of `prefix` will be proxied to the corresponding target. If the `prefix` value starts with ^, it will be recognized as a RegExp.

  > In general, `server.proxy` is sufficient to meet the needs. Adding this item is for compatibility with certain scenarios.

  **Default:** `[]`

- `option.include` 

  **Type:** `string | string[]`
  
  Configure to read mock files, which can be a directory, glob, or an array.

  **Default：** `['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']` (Relative to the root directory.)

- `options.exclude`

  **Type:** `string | string[]`
  
  When reading mock files for configuration, the files that need to be excluded can be a directory, glob, or an array.

  **Default：**
  ```ts
  [
    '**/node_modules/**',
    '**/.vscode/**',
    '**/.git/**',
  ]
  ```

- `options.reload`
  
  **Type:** `boolean`

  When the mock resource is hot updated, only the data content is updated, but the page is not refreshed by default. If you want to refresh the page every time you modify the mock file, you can open this option.


  **Default:** `false`

- `options.formidableOptions`
  
  Configure to `formidable`，see [formidable options](https://github.com/node-formidable/formidable#options)

  **Default:** `{}`

  example: Configure to file upload dir
  ```ts
  MockDevServerPlugin({
    formidableOptions: {
      uploadDir: path.join(process.cwd(), 'uploads'),
    }
  })
  ```

- `options.cookiesOptions`
  
  Configure to `cookies`, see [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

  **Default:** `{}`

- `options.build`
  
  Configuration needed to build a small, independently deployable mock service.

  **Type：** `boolean | ServerBuildOptions` 

  **Default：** `false`

  ```ts
  interface ServerBuildOptions {
    /**
     * server port
     * @default 8080
     */
    serverPort?: number
    /**
     * build output dir
     @default 'mockServer'
     */
    dist?: string
  }
  ```

### defineMock(config)

Mock Type Helper

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

### createDefineMock(transformer)

Return a custom defineMock function to support preprocessing of mock config.

```ts
import path from 'path'
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

```ts
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
  enable: true,
  /**
   * Set interface response delay, unit: ms.
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
   * Request validator, return mock data if validated, otherwise do not use current mock. 
   * This is useful in scenarios where an interface needs to return different data based 
   * on different input parameters. 
   * Validators can solve this type of problem well by dividing the same URL into multiple 
   * mock configurations and determining which one is effective based on the validator.
   * 
   * @type { headers?: object; body?: object; query?: object; params?: object; refererQuery?: object  }
   * 
   * If the validator passes in an object, 
   * then the validation method is to strictly compare whether the `value` 
   * of each `key` in headers/body/query/params in the request interface is exactly equal. 
   * If they are all equal, then the validation passes.
   * @type ({ headers: object; body: object; query: object; params: object; refererQuery: object }) => boolean
   *
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

The original type of `response` is `http.ServerResponse<http.IncomingMessage>`. The plugin adds `setCookie(name, value)` method for configuration cookie on this basis.

```ts
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

## Example

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

See more examples： [example](/example/)

**exp:** Match `/api/test`，And returns a response body content with empty data
```ts
export default defineMock({
  url: '/api/test',
})
```

**exp:** Match `/api/test` ，And returns a static content data
```ts
export default defineMock({
  url: '/api/test',
  body: { a: 1 },
})
```


**exp:** Only Support `GET` Method
```ts
export default defineMock({
  url: '/api/test',
  method: 'GET'
})
```

**exp:** In the response header, add a custom header and cookie
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


**exp:** Define multiple mock requests for the same url and match valid rules with validators
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
    body: { message: 'query.a == 3' }
  }
])
```


**exp:** Response Delay
```ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // delay 6 seconds
})
```


**exp:** The interface request failed
```ts
export default defineMock({
  url: '/api/test',
  status: 502,
  statusText: 'Bad Gateway'
})
```


**exp:** Dynamic route matching
```ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return { userId: params.userId }
  }
})
```

The `userId` in the route will be resolved into the `request.params` object.

**exp:** Use buffer to respond data
```ts
// Since the default value of type is json,
// although buffer is used for body during transmission,
// the content-type is still json.
export default defineMock({
  url: 'api/buffer',
  body: Buffer.from(JSON.stringify({ a: 1 }))
})
```
```ts
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

Simulate file download, pass in the file reading stream.
```ts
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
You need installed `mockjs`


**exp:** Use `response` to customize the response
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


**exp:** Use json / json5
```json
{
  "url": "/api/test",
  "body": {
    "a": 1
  }
}
```



**exp:** multipart, upload file.

use [`formidable`](https://www.npmjs.com/package/formidable#readme) to supported.
``` html
<form action="/api/upload" method="post" enctype="multipart/form-data">
    <p>
      <span>file: </span>
      <input type="file" name="files" multiple />
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

## Mock Services

In some scenarios, it may be necessary to use the data provided by mock services for display purposes, but the project may have already been packaged, built and deployed without support from `vite` and this plugin's mock service. Since this plugin supports importing various `node` modules in mock files at the design stage, the mock file cannot be inline into client build code.

To meet such scenarios, on one hand, the plugin provides support under `vite preview`, and on the other hand, it also builds a small independent mock service application that can be deployed to relevant environments during `vite build`. This can then be forwarded through other HTTP servers like nginx to actual ports for mock support.

The default output is built into the directory `dist/mockServer`, generating files as follows:
```sh
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

## LICENSE

[MIT](/LICENSE)


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_large)
