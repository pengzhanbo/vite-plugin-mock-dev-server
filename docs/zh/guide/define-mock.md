# defineMock(mockConfig)

`defineMock` 是用于定义 Mock 配置的类型辅助函数，提供完整的 TypeScript 类型提示和代码补全。

## 使用

```ts [*.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

支持传入数组定义多个配置：

```ts [*.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/test',
    body: {},
  },
  {
    url: '/api/test2',
    body: {}
  }
])
```

## 参数

### mockConfig

- **类型**: `MockHttpItem | MockHttpItem[] | MockWebsocketItem | MockWebsocketItem[]`
- **必填**: 是

Mock 配置对象或配置数组。

## 更多详情

- 查看 [mock 配置](./mock-config) 了解配置项详情
- 查看 [API 参考 - defineMock](../api/define-mock) 获取完整的类型定义和更多示例
