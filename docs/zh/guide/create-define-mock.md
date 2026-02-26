# createDefineMock(transformer)

创建自定义的 `defineMock` 函数，用于对 Mock 配置进行预处理。

## 使用

```ts [*.mock.ts]
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

const definePostMock = createDefineMock((mock) => {
  mock.url = path.join('/api/post', mock.url)
})

export default definePostMock({
  url: 'list', // 路径会拼接为 /api/post/list
  body: {
    list: []
  }
})
```

## 参数

### transformer

- **类型**: `(mock: MockHttpItem | MockWebsocketItem) => MockHttpItem | MockWebsocketItem | void`
- **必填**: 是

预处理函数，接收一个 Mock 配置对象，可以修改并返回，或返回新的配置对象。

## 使用场景

1. **统一添加路径前缀**: 避免在每个配置中重复写相同的前缀
2. **统一添加响应头**: 为所有 Mock 添加统一的响应头
3. **统一设置延迟**: 为所有 Mock 添加统一的响应延迟

## 更多详情

查看 [API 参考 - createDefineMock](../api/create-define-mock) 获取完整的类型定义和更多示例。
