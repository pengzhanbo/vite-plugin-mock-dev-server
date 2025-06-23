# mockConfig

`type: MockOptionsItem | MockOptionsItem[]`

::: code-group

```ts [*.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

:::

**类型定义:**

```ts
// 请求接口包含的信息
interface RequestOptions {
  query: Record<string, string> // query string parse
  params: Record<string, string> // params parse
  headers: Record<string, string> // request headers
  body: any // request body
  getCookie: (name: string, option?: Cookies.GetOption) => string | void
}
```

**注意:**

::: warning
如果使用 json/json5 编写 mock文件，则不支持使用 response 方法，以及不支持使用其他字段的函数形式。
:::

## url

- **Type**: `string`
- **必填**

请求地址。

通过 `path-to-regexp` 库路径匹配，支持 静态url匹配和动态url匹配。

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
- **选填**
- **默认值**： `['POST', 'GET']`

接口支持的请求方法。

仅符合的请求方法返回 `mock data`，否则忽略。可通过数组配置接口支持多种请求方法。

```ts
type Method
  = | 'GET' | 'POST' | 'PUT' | 'DELETE'
    | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'
```

## enabled

- **Type**: `boolean`
- **选填**
- **默认值**： `true`

是否开启当前 mock config。

```ts
export default defineMock({
  url: 'api/test',
  enabled: false, // 关闭当前 mock，api/test 将不会生效
})
```

## status

- **Type**: `number`
- **选填**
- **默认值**： `200`

响应状态码。

## statusText

- **Type**: `string`
- **选填**
- **默认值**： `'OK'`

响应状态文本。

## delay

- **Type**: `number | [number, number]`
- **选填**
- **单位**： `ms`
- **默认值**： `0`，表示不延迟

接口延迟响应。

延迟接口一段时间后再返回响应数据。 如果传入的是一个数组，则表示延迟响应的时间范围。

## type

- **Type**: `'text' | 'json' | 'buffer' | string`
- **选填**
- **默认值**： `'json'`

设置 `content-type` 类型，如果是响应一个文件类型，可以将 文件名 作为值传给 `type`。

插件内部由 `mime-types` 判断获取真实的 `content-type`。

## headers

- **Type**: `Record<string, string> | (request: RequestOptions) => Record<string, string>`
- **选填**
- **默认值**：

  默认值根据 [type](#type) 的值确定：

  | type     | 默认值                                            |
  | -------- | ------------------------------------------------- |
  | `text`   | `{ 'Content-Type': 'text/plain' }`                |
  | `json`   | `{ 'Content-Type': 'application/json' }`          |
  | `buffer` | `{ 'Content-Type': 'application/octet-stream'  }` |
  | 其他值   | 根据传入值由  `mime-types` 判断获取               |

配置请求响应头

## cookies

- **Type**: `ResponseCookies | ResponseCookiesFn`
- **选填**
- **默认值**: `undefined`

设置响应体 cookies

```ts
type CookieValue = string | [string, Cookies.SetOption]
type ResponseCookies = Record<string, CookieValue>
type ResponseCookiesFn = (
  request: RequestOptions,
) => ResponseCookies | Promise<ResponseCookies>
```

## body

- **Type**: `ResponseBody | ((request: RequestOptions) => ResponseBody | Promise<ResponseBody>)`
- **选填**
- **默认值**： `{}`

响应体数据。

定义返回的响应体内容。

支持使用 `mockjs` 等第三方库生成 `mock data` body。

``` ts
type ResponseBody = string | number | array | object | Buffer | ReadableStream
```

## response

- **Type**: `(req, res, next) => void | Promise<void>`
- **选填**
- **默认值**： `null`

如果通过 body 配置不能解决mock需求，那么可以通过 配置 response，暴露http server 的接口，实现完全可控的自定义配置。
在 `req` 参数中，已内置了 `query、body、params、refererQuery` 的解析，以及 `getCookie` 方法，
在 `res`中添加了 `setCookie` 方法， 你可以直接使用它们。

别忘了，需要通过 `res.end()` 返回响应体数据，或者需要跳过mock，那么别忘了调用 `next()`。

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

- **选填**
- **默认值**： `null`

请求验证器，通过验证器则返回 mock数据，否则不使用当前mock。

这对于一些场景中，某个接口需要通过不同的入参来返回不同的数据， 验证器可以很好的解决这一类问题，将同个 url 分为多个 mock配置，
根据 验证器来判断哪个mock配置生效。

如果 validator 传入的是一个对象，从 `v1.1.14` 版本开始，将会判断 validator 配置 的 `headers/query/params/body/refererBody` 对象，是否是当前请求的对应的请求数据的子集，比较是深度比较，如果属性值是数组，则需要数组的所有项都在请求数据的对应的数据的数组中。

如果 validator 传入的是一个函数，那么会将 请求的接口相关数据作为入参，提供给使用者进行自定义校验，并返回一个 boolean。

在插件内，会解析请求该mock api 的来源页面地址，通过获取  `request.referer`，提取 url 中 `query`部分，解析为`refererQuery` 。这使得可以通过直接在浏览器地址栏中，修改页面 `queryString`, 根据不同的 `queryString` 来决定 mock api 返回的数据内容。

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

- **Type** `Boolean`
- **选填**
- **默认值**： `false`

如果需要配置 模拟 `Websocket` ，必须显式的指定 `ws` 的值为 `true`

## setup

- **Type**：`(wss: WebSocketServer) => void`
- **选填**， 如果 `ws`值为`true`， 则该选项必填

该选项仅用于 模拟 `Websocket`。

```ts
export default {
  ws: true,
  setup(wss, { onCleanup }) {
    // wss 是 WebSocketServer 的实例，在服务器端，一个请求地址对应一个 wss
    // 但是允许多个客户端同时请求该地址建立 ws连接。
    // 在 `connection` 事件监听中， 回调参数 `ws` 表示其中一个 客户端的 `ws` 连接。

    wss.on('connection', (ws, res) => {
      ws.on('message', (raw) => {
        console.log(raw)
      })
      const timer = setInterval(() => {
        ws.send('data')
      }, 2000)
      // 在该函数中 清除 自动执行任务、或者终止其他方法执行
      // 但是无需在此函数内 删除 wss、ws 的监听事件，
      // 插件内部在热更新时，会自动处理，避免重复的事件监听
      onCleanup(() => clearInterval(timer))
    })
  }
}
```
