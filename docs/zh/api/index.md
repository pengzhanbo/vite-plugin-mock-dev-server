# API 参考

本章节提供 `vite-plugin-mock-dev-server` 的完整 API 参考文档，包括所有类型定义、辅助函数和配置选项的详细说明。

## 辅助函数

| 函数 | 描述 |
|------|------|
| [mockDevServerPlugin](./mock-dev-server-plugin) | 创建 Mock Dev Server 插件 |
| [defineMock](./define-mock) | 定义 Mock 配置的类型辅助函数 |
| [createDefineMock](./create-define-mock) | 创建自定义的 defineMock 函数 |
| [defineMockData](./define-mock-data) | 定义可共享的 Mock 数据 |
| [createSSEStream](./create-sse-stream) | 创建 Server-Sent Events 流 |

## 类型定义

| 类型 | 描述 |
|------|------|
| [MockServerPluginOptions](./mock-server-plugin-options) | 插件配置选项 |
| [MockHttpItem](./mock-http-item) | HTTP Mock 配置项 |
| [MockRequest](./mock-request) | 扩展的请求对象 |
| [MockResponse](./mock-response) | 扩展的响应对象 |

## 快速导航

### 插件配置

```ts
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      dir: 'mock',
      // ... 更多配置
    })
  ]
})
```

### Mock 配置

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  method: 'GET',
  body: { id: 1, name: 'John' }
})
```

### 共享数据

```ts
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

const users = defineMockData('users', [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
])

export default defineMock({
  url: '/api/users',
  body: () => users.value
})
```
