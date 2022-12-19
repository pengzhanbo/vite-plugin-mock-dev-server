# mockConfig

`type: MockOptionsItem | MockOptionsItem[]`

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

## url

- Type: `string`
- 必填

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

- Type: `Method | Method[]`
- 选填
- 默认值： `['POST', 'GET']`

接口支持的请求方法。

仅符合的请求方法返回 `mock data`，否则忽略。可通过数组配置接口支持多种请求方法。

```ts
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'
```

## enable

- Type: `boolean`
- 选填
- 默认值： `true`

是否开启当前 mock config。

```ts
export default defineMock({
  url: 'api/test',
  enable: false, // 关闭当前 mock，api/test 将会不会生效
})
```

## delay

- Type: `number`
- 选填
- 单位： `ms`
- 默认值： `0`，表示不延迟

接口延迟响应。

延迟接口一段时间后再返回响应数据。

## status

- Type: `number`
- 选填
- 默认值： `200`

响应状态码。

## statusText

- Type: `string`
- 选填
- 默认值： `'OK'`

响应状态文本。

## headers

- Type: `Record<string, string> | (request: RequestOptions) => Record<string, string>`
- 选填
- 默认值： `{ 'Content-Type': 'application/json' }`

配置请求响应头

```ts
// 请求接口包含的信息
interface RequestOptions {
  query: Record<string, string> // query string parse
  params: Record<string, string> // params parse
  headers: Record<string, string> // request headers
  body: any // request body
}
```

## body

- Type: `ResponseBody | ((request: RequestOptions) => ResponseBody | Promise<ResponseBody>)`
- 选填
- 默认值： `{}`

响应体数据。

定义返回的响应体内容。

支持使用 `mockjs` 等第三方库生成 `mock data` body。

``` ts
type ResponseBody = string | number | array | object
```

## response

- Type: `(req, res, next) => void | Promise<void>`
- 选填
- 默认值： `null`

如果通过 body 配置不能解决mock需求，那么可以通过 配置 response，暴露http server 的接口，实现完全可控的自定义配置
在 req参数中，已内置了 query、body、params 的解析，你可以直接使用它们别忘了，需要通过 `res.end()` 返回响应体数据，
或者需要跳过mock，那么别忘了调用 `next()`。

## validator

- Type: `{ header?: object; body?: object; query?: object; params?: object  }`
- Type: `(request: RequestOptions) => boolean`
- 选填
- 默认值： `null`

请求验证器，通过验证器则返回 mock数据，否则不是用当前mock。

这对于一些场景中，某个接口需要通过不同的入参来返回不同的数据， 验证器可以很好的解决这一类问题，将同个 url 分为多个 mock配置，
根据 验证器来判断哪个mock配置生效。

如果 validator 传入的是一个对象，那么验证方式是严格比较 请求的接口中，headers/body/query/params 的各个`key`的`value`是否全等，全等则校验通过

如果 validator 传入的是一个函数，那么会讲 请求的接口相关数据作为入参，提供给使用者进行自定义校验，并返回一个 boolean。

```ts
export default defineMock([
  {
    url: 'api/list',
    validator: {
      query: { p: 1 }
    },
    body: {
      result: [
        { title: 'p1' }
      ],
      page: 1,
    }
  },
  {
    url: 'api/list',
    validator: {
      query: { p: 2 }
    },
    body: {
      result: [
        { title: 'p2' }
      ],
      page: 2,
    }
  }
])
```

## 注意

::: warning
如果使用 json/json5 编写 mock文件，则不支持使用 response 方法，以及不支持使用其他字段的函数形式。
:::
