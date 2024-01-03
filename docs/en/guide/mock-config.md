# mockConfig

`type: MockOptionsItem | MockOptionsItem[]`

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

**Type Definition**
```ts
interface RequestOptions {
  query: Record<string, string> // query string parse
  params: Record<string, string> // params parse
  headers: Record<string, string> // request headers
  body: any // request body
  getCookie: (name: string, option?: Cookies.GetOption) => string | void
}
```

**Description**

::: warning
If using json/json5 to write mock files, the `response` method is not supported, nor is the use of other field functions.
:::

## url

- **Type**: `string`
- **Required**

Request address.

Matching paths through the `path-to-regexp` library, supporting static URL matching and dynamic URL matching.

```ts
export default defineMock([
  {
    url: '/api/post/list',
  },
  {
    url: '/api/post/:postId',
  }
])
```

## method

- **Type**: `Method | Method[]`
- **Optional**
- **Default**： `['POST', 'GET']`

Supported request methods.

Only the matching request methods will return `mock data`, otherwise they will be ignored. Multiple request methods can be configured using an array.

```ts
type Method =
  | 'GET' | 'POST' | 'PUT' | 'DELETE'
  | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'
```

## enabled

- **Type**: `boolean`
- **Optional**
- **Default**： `true`

Whether to enable the current mock config.

```ts
export default defineMock({
  url: 'api/test',
  enabled: false, // Disable this mock, api/test will not take effect
})
```

## status

- **Type**: `number`
- **Optional**
- **Default**： `200`

Response status code.

## statusText

- **Type**: `string`
- **Optional**
- **Default**： `'OK'`

Response status text.

## delay

- **Type**: `number | [number, number]`
- **Optional**
- **Unit**： `ms`
- **Default**： `0`，not delay

Delayed Interface Response.

The response data is returned after a delay in responding to the interface. If an array is passed in, it represents the time range for delayed response.

## type

- **Type**: `'text' | 'json' | 'buffer' | string`
- **Optional**
- **Default**： `'json'`

Set the `content-type` type. If it is a response of a file type, you can pass the file name as the value to `type`.

The actual `content-type` is determined internally by the plugin using `mime-types`.

## headers

- **Type**: `Record<string, string> | (request: RequestOptions) => Record<string, string>`
- **Optional**
- **Default**：

  The default value is determined based on the value of [type](#type):
  | Type     | Default                                                  |
  | -------- | -------------------------------------------------------- |
  | `text`   | `{ 'Content-Type': 'text/plain' }`                       |
  | `json`   | `{ 'Content-Type': 'application/json' }`                 |
  | `buffer` | `{ 'Content-Type': 'application/octet-stream'  }`        |
  | other    | Determined based on the input value using `mime-types`   |

Response headers

## cookies

- **Type**: `ResponseCookies | ResponseCookiesFn`
- **Optional**
- **Default**: `undefined`

Response cookies

```ts
type CookieValue = string | [string, Cookies.SetOption]
type ResponseCookies = Record<string, CookieValue>
type ResponseCookiesFn = (
  request: RequestOptions,
) => ResponseCookies | Promise<ResponseCookies>
```

## body

- **Type**: `ResponseBody | ((request: RequestOptions) => ResponseBody | Promise<ResponseBody>)`
- **Optional**
- **Default**： `{}`

Response body data.

Define the content of the response body.

Support generating mock data body using `mockjs` or other third-party libraries.

``` ts
type ResponseBody = string | number | array | object | Buffer | ReadableStream
```

## response

- **Type**: `(req, res, next) => void | Promise<void>`
- **Optional**
- **Default**： `null`

If the mock requirements cannot be resolved through the `body` configuration, you can customize the configuration by exposing the HTTP server interface through the `response` configuration.
The `req` parameter already includes the parsing of `query`, `body`, `params`, and `refererQuery`, as well as the `getCookie` method.
The `res` parameter also includes the `setCookie` method, which you can use directly.

Don't forget to use `res.end()` to return the response body data, or use `next()` to skip the mock if necessary.

## validator

- **Type**: `Validator` | `ValidatorFn`
  ```ts
  interface Validator {
    header?: object
    body?: object
    query?: object
    params?: object
    refererQuery?: object
  }
  interface ValidatorFn {
    (request: RequestOptions): boolean
  }
  ```
- **Optional**
- **Default**： `null`

Validator is used to determine whether to return mock data or not based on certain conditions.

This is useful in scenarios where an API needs to return different data based on different input parameters. By using a validator, you can divide the same URL into multiple mock configurations and determine which configuration to use based on the validator.

If the validator is an object, starting from version `v1.1.14`, it will check if the `headers/query/params/body/refererBody` configuration in the validator object is a subset of the corresponding request data. The comparison is deep, and if the attribute value is an array, all items in the array need to be present in the corresponding request data array.

If the validator is a function, the function will receive the relevant data of the request API as input and allow the user to perform custom validation. The function should return a boolean value.

Internally, the plugin parses the source page address that requests the mock API and extracts the `query` part of the URL, which is then parsed into `refererQuery`. This allows you to modify the page's `queryString` directly in the browser's address bar and determine the data returned by the mock API based on different `queryString` values.

```ts
export default defineMock([
  {
    url: 'api/list',
    validator: { query: { p: 1 } },
    body: {
      result: [{ title: 'p1' }],
      page: 1,
    }
  },
  {
    url: 'api/list',
    validator: { query: { p: 2 } },
    body: {
      result: [{ title: 'p2' }],
      page: 2,
    }
  }
])
```

## ws

- **Type**: `Boolean`
- **Optional**
- **Default**： `false`

If you want to configure emulation of `Websocket`, you must explicitly specify the value of `ws` to be `true`

## setup

- **Type**：`(wss: WebSocketServer) =>  void`
- **Optional**， If `ws` is `true`, this option is required

This option is only used for simulating `Websocket`.

```ts
export default {
  ws: true,
  setup(wss, { onCleanup }) {
    // `wss` is an instance of `WebSocketServer` on the server side,
    // where each request address corresponds to a `wss`.
    // However, multiple clients are allowed to simultaneously request
    // this address to establish a WebSocket connection.
    // In the `connection` event listener, the callback parameter `ws`
    // represents the `ws` connection of one of the clients.
    wss.on('connection', (ws, res) => {
      ws.on('message', (raw) => {
        console.log(raw)
      })
      const timer = setInterval(() => {
        ws.send('data')
      }, 2000)
      // Clear automatic tasks or terminate other method executions in this function
      // However, there is no need to delete the event listeners for wss and ws inside this function
      // The plugin will automatically handle this during hot updates to avoid duplicate event listeners
      onCleanup(() => clearInterval(timer))
    })
  }
}
```
