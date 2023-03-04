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
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/pengzhanbo/vite-plugin-mock-dev-server/lint.yml?style=flat-square">
<img alt="npm" src="https://img.shields.io/npm/dm/vite-plugin-mock-dev-server?style=flat-square">
</p>
<br>
<p align="center">
<span>English</span> | <a href="/README.zh-CN.md">简体中文</a>
</p>
<br>
<br>


## Feature

- ⚡️ light weight，flexible，fast
- 🧲 Non - injection, no intrusion to client code
- 💡 ESModule/commonjs
- 🦾 Typescript
- 🏷 Support json / json5
- 📦 Auto import mock file
- 🎨 Support any lib，like `mockjs`，or not use it.
- 📥 Path rules match and request parameters match
- ⚙️ Support Enabled/Disabled any one of api mock
- 🔥 HMR
- ⚖️ Use `server.proxy`
- 🍕 Support `viteConfig.define` in mock file
- 📤 Support `multipart` content-type，mock upload file.
- 🌈 Support `vite preview` mode
- 🗂 Support for building small mock services that can be deployed independently


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
The plugin reads the configuration for `server.proxy` or `options.prefix` and enables mock matching.

The plugin also reads the `define` configuration and supports direct use in mock files.

> In a general case, we only need to mock the url with the proxy so that we can proxy and mock through the http service provided by vite, but you can also configure the mock using 'options.prefix'

### Edit Mock File

By default, write mock data in the `mock` directory of your project root:

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
  
  Configure custom matches rules for the mock server. Any requests that request path starts with that `prefix` will be proxied to that specified target. If the `prefix` starts with ^, it will be interpreted as a RegExp.

  > In general, `server.proxy` is sufficient to meet the requirements, and this options is added to be compatible with some scenarios.

  **Default:** `[]`

- `option.include` 

  **Type:** `string | string[]`
  
  Configure to read mock files, which can be a directory, glob, or array

  **Default：** `['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']` (relative for `process.cwd()`)

- `options.exclude`

  **Type:** `string | string[]`
  
  When you configure the mock files to be read, the files you want to exclude can be a directory, glob, or array

  **Default：**
  ```ts
  [
    '**/node_modules/**',
    '**/test/**',
    'src/**',
    '**/.vscode/**',
    '**/.git/**',
    '**/dist/**'
  ]
  ```

- `options.reload`
  
  **Type:** `boolean`

  When mock resources are hot updated, only the data content is updated, but the page is not refreshed by default.
  Turn this on when you want to refresh the page every time you modify the mock file.


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

- `options.build`
  
  When building a small, independently deployable mock service.

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

## Mock Configuration

```ts
export default defineMock({
  /**
   * Address of request，and support like `/api/user/:id`
   */
  url: '/api/test',
  /**
   * The request method supported by the API
   * 
   * @type string | string[]
   * @default ['POST','GET']
   * 
   */
  method: ['GET', 'POST'],
  /**
   * enable/disable the current mock request
   * 
   * we typically only need a few mock interfaces to work.
   * set `false` to disable current mock
   * 
   * @default true
   */
  enable: true,
  /**
   * response delay， unit：ms
   * 
   * @default 0
   */
  delay: 1000,
  /**
   * response status
   * 
   * @default 200
   */
  status: 200,
  /**
   * response status text
   */
  statusText: 'OK',
  /**
   * Request a validator, through which the mock data 
   * is returned, otherwise not the current mock.
   * In some scenarios where an interface needs to 
   * return different data through different inputs, 
   * the validator can solve this kind of problem well. 
   * It divides the same url into multiple mock 
   * configurations and determines which mock configuration
   * is valid according to the validator.
   * 
   * @type { headers?: object; body?: object; query?: object; params?: object; refererQuery?: object  }
   * 
   * If the validator incoming is an object, 
   * then the validation method is the comparison of the 
   * strict request of interface, headers/body/query/params 
   * each `key-value` congruent, congruent check through
   * 
   * @type ({ headers: object; body: object; query: object; params: object; refererQuery: object }) => boolean
   * If the validator is passed a function, 
   * it takes the requested interface-related data as an input,
   * gives it to the consumer for custom validation, 
   * and returns a boolean
   * 
   */
  validator: {
    headers: {},
    body: {},
    query: {},
    params: {},
    /**
     * refererQuery validates the query in the url of the page from which the request originated, 
     * which makes it possible to modify parameters directly in the browser address bar to get 
     * different mock data
     */
    refererQuery: {}
  },
  /**
   * 
   * response headers
   * 
   * @type Record<string, any>
   * 
   * @type (({ query, body, params, headers }) => Record<string, any>)
   */
  headers: {
    'Content-Type': 'application/json'
  },

  /**
   * Response Body
   * Support `string/number/array/object` 
   * You can also use libraries such as' mockjs' to generate data content
   * 
   * @type string | number | array | object
   * 
   * @type (request: { headers, query, body, params }) => any | Promise<any>
   */
  body: {},

  /**
   * If the mock requirement cannot be addressed with the body configuration,
   * Then you can expose the http server interface by configuring response,
   * Achieve fully controlled custom configuration.
   */
  response(req, res, next) {
    res.end()
  }
})

```

> Tips：
> 
> If you write mock files using json/json5, 
> the 'response' method is not supported, 
> as is the function form that uses other fields.

`mock/**/*.mock.{ts,js,mjs,cjs,json,json5}`

See more examples： [example](/example/)

#### Example 1：
Match `/api/test`，And returns a response body content with empty data
```ts
export default defineMock({
  url: '/api/test',
})
```

#### Example 2：
Match `/api/test` ，And returns a static content data
```ts
export default defineMock({
  url: '/api/test',
  body: {
    a: 1
  }
})
```

#### Example 3：
Only Support `GET` Method
```ts
export default defineMock({
  url: '/api/test',
  method: 'GET'
})
```

#### Example 4：
In the response header, add a custom header
```ts
export default defineMock({
  url: '/api/test',
  headers: {
    'X-Custom': '12345678'
  }
})
```
```ts
export default defineMock({
  url: '/api/test',
  headers({ query, body, params, headers }) {
    return {
      'X-Custom': query.custom
    }
  }
})
```

#### Example 5：
Define multiple mock requests for the same url and match valid rules with validators
```ts
export default defineMock([
  // Match /api/test?a=1
  {
    url: '/api/test',
    validator: {
      query: {
        a: 1
      }
    },
    body: {
      message: 'query.a == 1'
    }
  },
  // Match /api/test?a=2
  {
    url: '/api/test',
    validator: {
      query: {
        a: 2
      }
    },
    body: {
      message: 'query.a == 2'
    }
  },
  {
    /**
     * `?a=3` will resolve to `validator.query`
     */
    url: '/api/test?a=3',
    body: {
      message: 'query.a == 3'
    }
  }
])
```

#### Example 6：
Response Delay
```ts
export default defineMock({
  url: '/api/test',
  delay: 6000, // delay 6 seconds
})
```

#### Example 7：
The interface request failed
```ts
export default defineMock({
  url: '/api/test',
  status: 504,
  statusText: 'Bad Gateway'
})
```

#### Example 8:
Dynamic route matching
```ts
export default defineMock({
  url: '/api/user/:userId',
  body({ params }) {
    return {
      userId: params.userId,
    }
  }
})
```

The `userId` in the route will be resolved into the `request.params` object.

#### Example 9：
Use `mockjs`:
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

### Example 10：
Use `response` to customize the response
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

### Example 11：
Use json / json5
```json
{
  // Support comment
  "url": "/api/test",
  "body": {
    "a": 1
  }
}
```

### Example 12:

multipart, upload file.

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

In some scenarios, you may need to use the data support provided by the mock service for display purposes, but it is possible that the project has been packaged and deployed as a build and is out of the mock service support provided by `vite` and this plugin. Since this plugin was designed to support the import of `node` modules into mock files, it cannot package mock files inline into client-side build code.

To cater for such scenarios, the plugin provides support under `vite preview` as well as the ability to build a small, independently deployable mock service application at `vite build` that can be deployed to the relevant environment. The mock support is then implemented by proxy forwarding to the actual port by another http server such as `nginx`.

Build the default output into the `dist/mockServer` directory and generate the following file:
```sh
./mockServer
├── index.js
├── mock-data.js
└── package.json
```

In this directory, after `npm install` to install the dependencies, `npm start` can be executed to start the mock server.

default port: `8080`。

Access the associated `mock` interface via `localhost:8080/`.

## Archives

[awesome-vite](https://github.com/vitejs/awesome-vite#helpers)

## LICENSE

[GPL-3.0](/LICENSE)
