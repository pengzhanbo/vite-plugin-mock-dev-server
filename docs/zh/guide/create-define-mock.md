# createDefineMock(transformer)

传入一个转换函数，创建自定义的 `defineMock` 辅助函数。实现预处理 mock 配置。

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

## Types

```ts
function createDefineMock(
  transformer: (mock: MockOptionsItem) => MockOptionsItem | void
): typeof defineMock
```
