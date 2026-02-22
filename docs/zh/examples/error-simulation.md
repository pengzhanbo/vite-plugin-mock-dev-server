# 错误模拟

插件支持错误模拟功能，允许你为 mock 请求配置错误概率和错误类型。

## 基本用法

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation',
  method: 'GET',
  body: { success: true, message: '请求成功' },
  error: {
    probability: 0.5, // 50% 的错误概率
    status: 500,
  }
})
```

## 配置选项

### `error`

- **类型**: `MockErrorConfig`
- **描述**: 配置错误模拟

#### `MockErrorConfig`

| 选项 | 类型 | 默认值 | 描述 |
| ---- | ---- | ------ | ---- |
| `probability` | `number` | `0.5` | 错误概率（0-1） |
| `status` | `number` | `500` | 错误状态码 |
| `statusText` | `string` | - | 错误状态文本 |
| `body` | `ResponseBody \| ResponseBodyFn` | - | 自定义错误响应体，适用于 status 为 200，但响应体需要模拟错误场景 |

## 示例

### 不同错误类型

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/error-simulation/404',
    method: 'GET',
    body: { success: true, message: '请求成功' },
    error: {
      probability: 0.7,
      status: 404,
    }
  },
  {
    url: '/api/error-simulation/text',
    method: 'GET',
    body: '请求成功',
    type: 'text',
    error: {
      probability: 0.5,
      status: 500,
    }
  }
])
```

### 自定义错误响应体

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation/custom-body',
  method: 'GET',
  body: { code: 200, msg: '成功', result: { data: 'some data' } },
  error: {
    probability: 0.5,
    status: 200, // 网络请求成功
    body: { code: 500, msg: '内部错误', result: null } // 但返回错误的数据结构
  }
})
```

### 空结果模拟

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation/empty-result',
  method: 'GET',
  body: { code: 200, msg: '成功', result: { data: 'some data' } },
  error: {
    probability: 0.5,
    status: 200,
    body: { code: 200, msg: '成功', result: {} } // 成功状态但结果为空
  }
})
```

### 动态错误响应

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation/dynamic-body',
  method: 'GET',
  body: { code: 200, msg: '成功', result: { data: 'some data' } },
  error: {
    probability: 0.5,
    status: 200,
    body: (request) => {
      // 根据请求参数动态生成错误响应
      return {
        code: 500,
        msg: `请求错误: ${request.query.id || 'unknown'}`,
        result: null
      }
    }
  }
})
```

## 为何使用错误模拟？

错误模拟在以下场景中非常有用：

- **测试错误处理**：验证应用程序是否正确处理来自服务器的错误响应。
- **模拟网络问题**：测试当服务器不可用或返回错误时，应用程序的行为表现。
- **提升测试覆盖率**：通过模拟多种错误场景，增加测试的覆盖范围。
- **重试机制**：测试应用程序在发生错误时如何处理重试操作。
- **概率控制**：使用`probability`选项来控制错误发生的概率，从而实现更真实的测试场景。
