# Mock 配置

Mock 配置用于定义单个接口的 Mock 响应行为。

## 基本结构

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  method: 'GET',
  body: { message: 'Hello World' }
})
```

## 配置项概览

| 配置项 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [url](../api/mock-http-item#url) | `string` | 是 | - | 请求路径，支持动态参数 |
| [method](../api/mock-http-item#method) | `Method \| Method[]` | 否 | `['GET','POST']` | 允许的 HTTP 方法 |
| [enabled](../api/mock-http-item#enabled) | `boolean` | 否 | `true` | 是否启用 |
| [status](../api/mock-http-item#status) | `number` | 否 | `200` | 响应状态码 |
| [statusText](../api/mock-http-item#statustext) | `string` | 否 | `'OK'` | 响应状态文本 |
| [headers](../api/mock-http-item#headers) | `Headers \| Function` | 否 | - | 响应头 |
| [body](../api/mock-http-item#body) | `ResponseBody \| Function` | 否 | `{}` | 响应体 |
| [response](../api/mock-http-item#response) | `Function` | 否 | - | 自定义响应处理 |
| [delay](../api/mock-http-item#delay) | `number \| [number, number]` | 否 | `0` | 响应延迟 |
| [cookies](../api/mock-http-item#cookies) | `ResponseCookies \| Function` | 否 | - | 响应 Cookies |
| [validator](../api/mock-http-item#validator) | `Validator \| Function` | 否 | - | 请求验证器 |
| [error](../api/mock-http-item#error) | `MockErrorConfig` | 否 | - | 错误模拟配置 |

## 多个配置

可以在一个文件中导出多个 Mock 配置：

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/users',
    method: 'GET',
    body: []
  },
  {
    url: '/api/users',
    method: 'POST',
    body: { id: 1 }
  }
])
```

## 详细文档

查看 [API 参考 - MockHttpItem](../api/mock-http-item) 获取完整的配置项说明和示例。
