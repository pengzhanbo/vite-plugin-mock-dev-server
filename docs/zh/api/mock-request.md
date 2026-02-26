# MockRequest

扩展的 HTTP 请求对象，在原始 Node.js `IncomingMessage` 基础上添加了常用请求信息的解析。

## 类型定义

```ts
type MockRequest = Connect.IncomingMessage & ExtraRequest

interface ExtraRequest {
  query: Record<string, any>
  refererQuery: Record<string, any>
  body: Record<string, any>
  params: Record<string, any>
  headers: Headers
  getCookie: (name: string, options?: GetCookieOption) => string | void
}
```

## 属性详解

### query

- **类型**: `Record<string, any>`
- **描述**: URL 查询参数对象

解析 URL 中 `?` 后面的查询字符串为 JSON 对象。

```ts
// 请求: /api/users?page=1&limit=10
export default defineMock({
  url: '/api/users',
  body: ({ query }) => ({
    page: query.page, // "1"
    limit: query.limit // "10"
  })
})
```

### params

- **类型**: `Record<string, any>`
- **描述**: 路由参数对象

解析动态路由中的参数。

```ts
// 请求: /api/users/123
export default defineMock({
  url: '/api/users/:id',
  body: ({ params }) => ({
    userId: params.id // "123"
  })
})

// 多个参数
// 请求: /api/users/123/posts/456
export default defineMock({
  url: '/api/users/:userId/posts/:postId',
  body: ({ params }) => ({
    userId: params.userId, // "123"
    postId: params.postId // "456"
  })
})
```

### body

- **类型**: `Record<string, any>`
- **描述**: 请求体数据

解析后的请求体，支持 JSON、FormData、Text 等格式。

```ts
// POST 请求体: { "name": "John", "email": "john@example.com" }
export default defineMock({
  url: '/api/users',
  method: 'POST',
  body: ({ body }) => ({
    id: Date.now(),
    name: body.name, // "John"
    email: body.email // "john@example.com"
  })
})
```

### headers

- **类型**: `Headers` (http.IncomingHttpHeaders)
- **描述**: 请求头对象

```ts
export default defineMock({
  url: '/api/info',
  body: ({ headers }) => ({
    userAgent: headers['user-agent'],
    contentType: headers['content-type'],
    authorization: headers.authorization
  })
})
```

### refererQuery

- **类型**: `Record<string, any>`
- **描述**: 来源页面 URL 的查询参数

解析 `Referer` 头中的查询字符串，可用于根据页面状态返回不同数据。

```ts
// 页面 URL: http://localhost:3000/dashboard?mode=dark
// API 请求: /api/theme
export default defineMock({
  url: '/api/theme',
  body: ({ refererQuery }) => ({
    mode: refererQuery.mode || 'light' // "dark"
  })
})
```

## 方法

### getCookie(name, options?)

- **参数**:
  - `name`: Cookie 名称
  - `options`: 可选配置
    - `signed`: 是否验证签名
- **返回值**: `string | void` - Cookie 值或 undefined
- **描述**: 获取请求中的 Cookie 值

```ts
export default defineMock({
  url: '/api/profile',
  body: ({ getCookie }) => {
    const token = getCookie('auth-token')
    const sessionId = getCookie('session-id')

    if (!token) {
      return { error: 'Unauthorized' }
    }

    return { user: getUserByToken(token) }
  }
})
```

## 完整示例

```ts [request-demo.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // 综合使用各种请求信息
  {
    url: '/api/analyze-request',
    body: (request) => {
      const { query, params, body, headers, refererQuery, getCookie } = request

      return {
        // URL 信息
        url: {
          query,
          params,
          refererQuery
        },

        // 请求体
        body,

        // 请求头
        headers: {
          contentType: headers['content-type'],
          userAgent: headers['user-agent'],
          accept: headers.accept
        },

        // Cookies
        cookies: {
          session: getCookie('session'),
          token: getCookie('token')
        },

        // 元信息
        meta: {
          timestamp: Date.now(),
          ip: headers['x-forwarded-for'] || 'unknown'
        }
      }
    }
  },

  // 根据查询参数返回不同数据
  {
    url: '/api/search',
    body: ({ query }) => {
      const { q, category, sort = 'relevance' } = query

      // 模拟搜索结果
      const results = [
        { id: 1, title: 'Result 1', category: 'tech' },
        { id: 2, title: 'Result 2', category: 'design' }
      ].filter(item =>
        !category || item.category === category
      )

      return {
        query: q,
        category,
        sort,
        results,
        total: results.length
      }
    }
  },

  // 认证检查
  {
    url: '/api/admin/data',
    body: ({ headers, getCookie }) => {
      const token = getCookie('admin-token')
        || headers.authorization?.replace('Bearer ', '')

      if (!token || !isValidToken(token)) {
        return {
          status: 401,
          body: { error: 'Unauthorized' }
        }
      }

      return { data: 'sensitive admin data' }
    }
  }
])
```

## 注意事项

1. **参数类型**: `query` 和 `params` 中的值都是字符串类型，需要手动转换为数字或其他类型
2. **大小写敏感**: `headers` 的键名是小写的
3. **Cookie 解析**: 需要配置 `cookiesOptions` 才能正确解析签名 Cookie
4. **大文件**: 对于大文件上传，`body` 可能包含文件流而不是完整内容
