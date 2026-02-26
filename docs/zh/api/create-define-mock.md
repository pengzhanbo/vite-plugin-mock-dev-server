# createDefineMock

创建自定义的 `defineMock` 函数，用于对 Mock 配置进行预处理。

## 函数签名

```ts
function createDefineMock(
  transformer: (
    mock: MockHttpItem | MockWebsocketItem
  ) => MockHttpItem | MockWebsocketItem | void
): typeof defineMock
```

## 参数

### transformer

- **类型**: `(mock: MockHttpItem | MockWebsocketItem) => MockHttpItem | MockWebsocketItem | void`
- **描述**: 预处理函数，接收一个 Mock 配置对象，可以修改并返回，或返回新的配置对象
- **必填**: 是

## 返回值

- **类型**: `typeof defineMock`
- **描述**: 自定义的 defineMock 函数，用法与原版相同

## 使用场景

1. **统一添加路径前缀**: 避免在每个配置中重复写相同的前缀
2. **统一添加响应头**: 为所有 Mock 添加统一的响应头
3. **统一设置延迟**: 为所有 Mock 添加统一的响应延迟
4. **配置转换**: 将自定义配置转换为插件支持的格式

## 示例

### 统一路径前缀

```ts [defineApiMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineApiMock = createDefineMock((mock) => {
  mock.url = `/api${mock.url}`
})
```

```ts [user.mock.ts]
import { defineApiMock } from './defineApiMock'

// 实际匹配的 URL 是 /api/users
export default defineApiMock({
  url: '/users',
  body: [{ id: 1, name: 'John' }]
})
```

### 统一响应头

```ts [defineAuthMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineAuthMock = createDefineMock((mock) => {
  mock.headers = {
    ...mock.headers,
    'X-Auth-Required': 'true'
  }
})
```

```ts [profile.mock.ts]
import { defineAuthMock } from './defineAuthMock'

export default defineAuthMock({
  url: '/api/profile',
  body: { name: 'John', role: 'admin' }
})
```

### 统一延迟设置

```ts [defineDelayedMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineDelayedMock = createDefineMock((mock) => {
  mock.delay = 1000 // 统一延迟 1 秒
})
```

### 组合多个转换器

```ts [defineStandardMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineStandardMock = createDefineMock((mock) => {
  // 添加 API 前缀
  if (!mock.url.startsWith('/api')) {
    mock.url = `/api${mock.url}`
  }

  // 设置默认延迟
  if (!mock.delay) {
    mock.delay = 500
  }

  // 添加默认响应头
  mock.headers = {
    'Content-Type': 'application/json',
    ...mock.headers
  }
})
```

### 条件转换

```ts [defineEnvMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

const isDev = process.env.NODE_ENV === 'development'

export const defineEnvMock = createDefineMock((mock) => {
  // 开发环境下添加调试信息
  if (isDev) {
    mock.headers = {
      ...mock.headers,
      'X-Debug': 'true'
    }
  }
})
```

## 注意事项

1. **数组处理**: 当传入数组配置时，转换器会对每个元素分别调用
2. **返回值**: 转换器可以返回新的配置对象，也可以直接修改并返回原对象
3. **类型安全**: 自定义的 defineMock 函数保持完整的类型推断
4. **链式调用**: 可以通过函数组合实现多个转换器的链式调用

```ts
// 链式调用示例
const defineMockA = createDefineMock((mock) => { /* ... */ })
const defineMockB = createDefineMock((mock) => { /* ... */ })

// 组合使用
const config = defineMockB(defineMockA({ url: '/test' }))
```
