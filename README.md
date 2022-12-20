# vite-plugin-mock-dev-server

<br>
<br>
<p align="center">Vite Plugin for API mock dev server.</p>

<br>
<p align="center">
<a href="https://www.npmjs.com/package/vite-plugin-mock-dev-server"><img alt="npm" src="https://img.shields.io/npm/v/vite-plugin-mock-dev-server?style=flat-square"></a>
<img alt="node-current" src="https://img.shields.io/node/v/vite-plugin-mock-dev-server?style=flat-square">
<img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/vite-plugin-mock-dev-server/peer/vite?style=flat-square">
<img alt="GitHub" src="https://img.shields.io/github/license/pengzhanbo/vite-plugin-mock-dev-server?style=flat-square">
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
The plugin reads the configuration for `server.proxy` and enables mock matching only for urls where the proxy is set.

The plugin also reads the `define` configuration and supports direct use in mock files.

> In a general case, we only need to mock the url with the proxy so that we can proxy and mock through the http service provided by vite

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

- `option.include` 
  
  Configure to read mock files, which can be a directory, glob, or array

  Default： `['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']` (relative for `process.cwd()`)

- `options.exclude`
  
  When you configure the mock files to be read, the files you want to exclude can be a directory, a glob, or an array

  Default：
  ```ts
  [
    '**/node_modules/**',
    '**/test/**',
    '**/cypress/**',
    'src/**',
    '**/.vscode/**',
    '**/.git/**',
    '**/dist/**'
  ]
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
   * Address of request，support `/api/user/:id`
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
   * @type { header?: object; body?: object; query?: object; params?: object  }
   * 
   * If the validator incoming is an object, 
   * then the validation method is the comparison of the 
   * strict request of interface, headers/body/query/params 
   * each `key-value` congruent, congruent check through
   * 
   * @type ({ header: object; body: object; query: object; params: object }) => boolean
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
   * @type (request: { header, query, body, params }) => any | Promise<any>
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
Match `/api/test` ，And returns a fixed content data
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
      message: 'query.a === 1'
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
      message: 'query.a === 2'
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

#### Example 8：
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

### Example 9：
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

### Example 10：
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
