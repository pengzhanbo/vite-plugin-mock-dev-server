# defineMock

定义 Mock 配置的类型辅助函数，提供类型提示和代码补全。

## 函数签名

```ts
// HTTP Mock
function defineMock(config: MockHttpItem): MockHttpItem

// WebSocket Mock
function defineMock(config: MockWebsocketItem): MockWebsocketItem

// 多个 Mock 配置
function defineMock(config: MockOptions): MockOptions
```

## 参数

### config

- **类型**: `MockHttpItem | MockWebsocketItem | MockOptions`
- **描述**: Mock 配置对象或配置数组
- **必填**: 是

## 返回值

- **类型**: 与输入参数相同
- **描述**: 返回传入的配置对象（运行时无实际处理，仅用于类型推断）

## 示例

### 基础 HTTP Mock

```ts [user.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  method: 'GET',
  body: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }
})
```

### 动态响应

```ts [dynamic.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user/:id',
  method: 'GET',
  body: ({ params, query }) => {
    return {
      id: params.id,
      name: `User ${params.id}`,
      timestamp: Date.now(),
      filter: query.filter
    }
  }
})
```

### 多个配置

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/users',
    method: 'GET',
    body: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
  },
  {
    url: '/api/users',
    method: 'POST',
    body: ({ body }) => {
      return {
        id: Date.now(),
        ...body
      }
    }
  },
  {
    url: '/api/users/:id',
    method: 'DELETE',
    status: 204
  }
])
```

### WebSocket Mock

```ts [ws.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/chat',
  ws: true,
  setup(wss, { onCleanup }) {
    const clients = new Set()

    wss.on('connection', (ws, req) => {
      clients.add(ws)

      ws.on('message', (data) => {
        // 广播消息给所有客户端
        clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(data)
          }
        })
      })

      ws.on('close', () => {
        clients.delete(ws)
      })
    })

    onCleanup(() => clients.clear())
  }
})
```

### 使用验证器

```ts [validator.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/search',
    validator: { query: { type: 'user' } },
    body: { result: 'user search result' }
  },
  {
    url: '/api/search',
    validator: { query: { type: 'post' } },
    body: { result: 'post search result' }
  },
  {
    url: '/api/search',
    validator: request => request.query.type === 'comment',
    body: { result: 'comment search result' }
  }
])
```

## 类型推断

`defineMock` 函数会根据配置自动推断类型：

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

// TypeScript 会自动推断 config 的类型为 MockHttpItem
const config = defineMock({
  url: '/api/test',
  // 这里会有完整的类型提示
  body: { message: 'hello' }
})
```
