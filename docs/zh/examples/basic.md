# 基础示例

## 请求拦截

拦截 `api/test` 接口请求，并响应数据：

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  body: {
    name: 'Mark',
    age: 18,
  }
})
```

## 允许请求方法

配置当前接口只允许的请求方法

<<< @/../example/mock/allow-method.mock.ts

## 响应状态

配置当前接口的响应状态码和响应状态文本

一般来说，只需要显式的指定 状态码， 插件内部会根据状态码设置对应的状态文本

<<< @/../example/mock/fail.mock.ts

## 开启/关闭 mock

针对某一个 mock 请求配置，关闭使其被忽略。

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  enabled: false
})
```

`enabled` 设置为 `false` 后， 发起的 `/api/text` 请求不再经过 `mock-server`，而是经过原来的
`server.proxy` 配置的代理转发。

## 动态路径匹配

<<< @/../example/mock/dynamic-match-url.mock.ts

## 响应延迟

<<< @/../example/mock/delay.mock.ts
