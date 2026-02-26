# MockHttpItem

HTTP Mock 配置项接口，用于定义单个 HTTP 接口的 Mock 响应。

## 接口定义

```ts
interface MockHttpItem extends MockBaseItem {
  method?: Method | Method[]
  headers?: Headers | ResponseHeaderFn
  status?: number
  statusText?: string
  delay?: number | [number, number]
  cookies?: ResponseCookies | ResponseCookiesFn
  type?: 'text' | 'json' | 'buffer' | string
  body?: ResponseBody | ResponseBodyFn
  response?: ResponseFn
  validator?: Validator | ValidatorFn
  error?: MockErrorConfig
  ws?: false
}
```

## 基础属性

### url

- **类型**: `string`
- **必填**: 是
- **描述**: 请求路径，支持动态参数

使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 进行路径匹配。

```ts
export default defineMock({
  url: '/api/users', // 静态路径
  url: '/api/users/:id', // 动态参数
  url: '/api/*path', // 通配符匹配
})
```

### enabled

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否启用当前 Mock 配置

```ts
export default defineMock({
  url: '/api/test',
  enabled: false // 临时禁用
})
```

### method

- **类型**: `Method | Method[]`
- **默认值**: `['GET', 'POST']`
- **描述**: 允许的 HTTP 方法

```ts
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'

// 仅 GET
export default defineMock({
  url: '/api/users',
  method: 'GET'
})

// GET 或 POST
export default defineMock({
  url: '/api/users',
  method: ['GET', 'POST']
})
```

## 响应配置

### status

- **类型**: `number`
- **默认值**: `200`
- **描述**: HTTP 响应状态码

```ts
export default defineMock({
  url: '/api/not-found',
  status: 404
})
```

### statusText

- **类型**: `string`
- **默认值**: `'OK'`
- **描述**: HTTP 响应状态文本

```ts
export default defineMock({
  url: '/api/error',
  status: 500,
  statusText: 'Internal Server Error'
})
```

### headers

- **类型**: `Headers | (request: MockRequest) => Headers`
- **描述**: 自定义响应头

```ts
export default defineMock({
  url: '/api/custom',
  headers: {
    'X-Custom-Header': 'value',
    'X-Request-ID': '12345'
  }
})

// 动态响应头
export default defineMock({
  url: '/api/dynamic-header',
  headers: request => ({
    'X-User-Agent': request.headers['user-agent']
  })
})
```

### type

- **类型**: `'text' | 'json' | 'buffer' | string`
- **默认值**: `'json'`
- **描述**: 响应体类型，自动设置对应的 `Content-Type`

```ts
export default defineMock({
  url: '/api/text',
  type: 'text',
  body: 'Plain text response'
})

export default defineMock({
  url: '/api/file',
  type: 'application.pdf', // 自动解析为 application/pdf
  body: pdfBuffer
})
```

### body

- **类型**: `ResponseBody | (request: MockRequest) => ResponseBody | Promise<ResponseBody>`
- **描述**: 响应体数据

```ts
type ResponseBody = string | object | any[] | number | Buffer | Readable | null

// 静态数据
export default defineMock({
  url: '/api/user',
  body: { id: 1, name: 'John' }
})

// 动态数据
export default defineMock({
  url: '/api/user/:id',
  body: ({ params }) => ({
    id: params.id,
    name: `User ${params.id}`
  })
})

// 异步数据
export default defineMock({
  url: '/api/async',
  body: async ({ query }) => {
    const data = await fetchExternalData(query.id)
    return data
  }
})
```

### response

- **类型**: `(req: MockRequest, res: MockResponse, next: NextFunction) => void | Promise<void>`
- **描述**: 自定义响应处理函数

当 `body` 无法满足需求时，可以使用 `response` 完全控制响应过程。

```ts
export default defineMock({
  url: '/api/custom',
  response: (req, res, next) => {
    // 获取解析后的请求信息
    const { query, params, body, headers } = req

    // 设置响应头
    res.setHeader('Content-Type', 'application/json')
    res.setCookie('token', 'abc123', { httpOnly: true })

    // 发送响应
    res.statusCode = 200
    res.end(JSON.stringify({
      message: 'Custom response',
      query,
      params
    }))
  }
})
```

## 高级配置

### delay

- **类型**: `number | [number, number]`
- **默认值**: `0`
- **描述**: 响应延迟时间（毫秒）

```ts
export default defineMock({
  url: '/api/slow',
  delay: 2000 // 延迟 2 秒
})

// 随机延迟 1-3 秒
export default defineMock({
  url: '/api/random-delay',
  delay: [1000, 3000]
})
```

### cookies

- **类型**: `ResponseCookies | (request: MockRequest) => ResponseCookies`
- **描述**: 设置响应 Cookie

```ts
type CookieValue = string | [string, SetCookieOption]
type ResponseCookies = Record<string, CookieValue>

export default defineMock({
  url: '/api/login',
  cookies: {
    session: 'abc123',
    user: ['john', { path: '/', httpOnly: true }]
  }
})
```

### validator

- **类型**: `Partial<RequestOptions> | (request: MockRequest) => boolean`
- **描述**: 请求验证器

用于在多个相同 URL 的 Mock 配置中，根据请求参数决定使用哪个配置。

```ts
// 对象形式验证
export default defineMock([
  {
    url: '/api/search',
    validator: { query: { type: 'user' } },
    body: { users: [] }
  },
  {
    url: '/api/search',
    validator: { query: { type: 'post' } },
    body: { posts: [] }
  }
])

// 函数形式验证
export default defineMock([
  {
    url: '/api/data',
    validator: request => request.headers['x-role'] === 'admin',
    body: { sensitive: 'data' }
  },
  {
    url: '/api/data',
    body: { public: 'data' }
  }
])
```

### error

- **类型**: `MockErrorConfig`
- **描述**: 错误模拟配置

```ts
interface MockErrorConfig {
  probability?: number // 错误概率 0-1，默认 0.5
  status?: number // 错误状态码，默认 500
  statusText?: string // 错误状态文本
  body?: ResponseBody // 错误响应体
}

export default defineMock({
  url: '/api/unstable',
  error: {
    probability: 0.3, // 30% 概率返回错误
    status: 503,
    statusText: 'Service Unavailable'
  }
})
```

## 完整示例

```ts [complete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // 基础 GET 接口
  {
    url: '/api/users',
    method: 'GET',
    body: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
  },

  // 带延迟的 POST 接口
  {
    url: '/api/users',
    method: 'POST',
    delay: 500,
    body: ({ body }) => ({
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    })
  },

  // 动态路由
  {
    url: '/api/users/:id',
    method: 'GET',
    validator: { params: { id: /^\d+$/ } },
    body: ({ params }) => ({
      id: Number(params.id),
      name: `User ${params.id}`
    })
  },

  // 带 Cookie 的登录接口
  {
    url: '/api/login',
    method: 'POST',
    cookies: {
      'auth-token': ['jwt-token-here', { httpOnly: true, maxAge: 86400000 }]
    },
    body: ({ body }) => ({
      success: true,
      user: { id: 1, email: body.email }
    })
  },

  // 自定义响应
  {
    url: '/api/download',
    response: (req, res) => {
      res.setHeader('Content-Disposition', 'attachment; filename="data.json"')
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ data: 'content' }))
    }
  }
])
```
