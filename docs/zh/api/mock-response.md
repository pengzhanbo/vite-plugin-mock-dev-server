# MockResponse

扩展的 HTTP 响应对象，在原始 Node.js `ServerResponse` 基础上添加了便捷方法。

## 类型定义

```ts
type MockResponse = http.ServerResponse<http.IncomingMessage> & {
  setCookie: (
    name: string,
    value?: string | null,
    options?: SetCookieOption
  ) => void
}
```

## 方法详解

### setCookie(name, value?, options?)

设置响应 Cookie。

- **参数**:
  - `name`: Cookie 名称（必填）
  - `value`: Cookie 值，设为 `null` 可删除 Cookie
  - `options`: Cookie 选项
    - `maxAge`: 有效期（毫秒）
    - `expires`: 过期日期（Date 对象）
    - `path`: 路径
    - `domain`: 域名
    - `secure`: 仅 HTTPS
    - `httpOnly`: 禁止 JavaScript 访问
    - `sameSite`: SameSite 策略（'strict' | 'lax' | 'none'）
    - `signed`: 是否签名
    - `overwrite`: 是否覆盖同名 Cookie

- **返回值**: `void`

## 基础用法

### 使用 response 方法

```ts
export default defineMock({
  url: '/api/custom',
  response: (req, res, next) => {
    // 设置状态码
    res.statusCode = 200

    // 设置响应头
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-Custom-Header', 'value')

    // 设置 Cookie
    res.setCookie('session', 'abc123', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24小时
    })

    // 发送响应
    res.end(JSON.stringify({ success: true }))
  }
})
```

### 与 body 配合使用

虽然 `body` 配置更简洁，但有时需要 `response` 来实现复杂逻辑：

```ts
export default defineMock([
  // 简单响应 - 使用 body
  {
    url: '/api/simple',
    body: { message: 'Hello' }
  },

  // 复杂响应 - 使用 response
  {
    url: '/api/complex',
    response: (req, res) => {
      // 条件判断
      if (!req.headers.authorization) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Bearer')
        res.end(JSON.stringify({ error: 'Unauthorized' }))
        return
      }

      // 设置多个 Cookie
      res.setCookie('user', 'john', { path: '/' })
      res.setCookie('session', 'xyz', { httpOnly: true })

      // 流式响应
      res.setHeader('Content-Type', 'text/plain')
      res.write('Line 1\n')
      res.write('Line 2\n')
      res.end('Line 3')
    }
  }
])
```

## Cookie 操作示例

### 设置 Cookie

```ts
export default defineMock({
  url: '/api/login',
  method: 'POST',
  response: (req, res) => {
    // 基础 Cookie
    res.setCookie('username', 'john')

    // 带选项的 Cookie
    res.setCookie('session', generateSessionId(), {
      httpOnly: true, // 禁止 JS 访问
      secure: true, // 仅 HTTPS
      sameSite: 'strict', // SameSite 策略
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    })

    // 签名 Cookie（需要配置 keys）
    res.setCookie('user-id', '12345', {
      signed: true
    })

    res.end(JSON.stringify({ success: true }))
  }
})
```

### 删除 Cookie

```ts
export default defineMock({
  url: '/api/logout',
  method: 'POST',
  response: (req, res) => {
    // 通过设置 null 值删除 Cookie
    res.setCookie('session', null)
    res.setCookie('user-id', null)

    res.end(JSON.stringify({ message: 'Logged out' }))
  }
})
```

### 更新 Cookie

```ts
export default defineMock({
  url: '/api/refresh',
  method: 'POST',
  response: (req, res) => {
    // 延长 session 有效期
    res.setCookie('session', generateNewSession(), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      overwrite: true // 覆盖同名 Cookie
    })

    res.end(JSON.stringify({ refreshed: true }))
  }
})
```

## 高级响应示例

### 文件下载

```ts
import { createReadStream } from 'node:fs'
import path from 'node:path'

export default defineMock({
  url: '/api/download/:filename',
  response: (req, res) => {
    const { params } = req
    const filePath = path.join(process.cwd(), 'files', params.filename)

    // 设置下载头
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${params.filename}"`
    )

    // 流式传输文件
    const stream = createReadStream(filePath)
    stream.pipe(res)
  }
})
```

### 重定向

```ts
export default defineMock({
  url: '/api/redirect',
  response: (req, res) => {
    res.statusCode = 302
    res.setHeader('Location', '/api/new-endpoint')
    res.end()
  }
})
```

### 分块传输

```ts
export default defineMock({
  url: '/api/stream',
  response: (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Transfer-Encoding', 'chunked')

    let count = 0
    const interval = setInterval(() => {
      count++
      res.write(`Chunk ${count}\n`)

      if (count >= 5) {
        clearInterval(interval)
        res.end()
      }
    }, 1000)

    req.on('close', () => {
      clearInterval(interval)
    })
  }
})
```

### 条件响应

```ts
export default defineMock({
  url: '/api/conditional',
  response: (req, res, next) => {
    const acceptHeader = req.headers.accept || ''

    // 根据 Accept 头返回不同格式
    if (acceptHeader.includes('application/xml')) {
      res.setHeader('Content-Type', 'application/xml')
      res.end('<root><message>Hello</message></root>')
      return
    }

    if (acceptHeader.includes('text/plain')) {
      res.setHeader('Content-Type', 'text/plain')
      res.end('Hello')
      return
    }

    // 默认 JSON
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Hello' }))
  }
})
```

## 注意事项

1. **调用顺序**: 必须先设置头部，再调用 `res.end()`
2. **Cookie 编码**: Cookie 值会自动进行 URL 编码
3. **重复设置**: 多次调用 `setCookie` 同名会添加多个 Cookie，使用 `overwrite: true` 覆盖
4. **签名验证**: 签名 Cookie 需要先在插件配置中设置 `cookiesOptions.keys`
5. **流处理**: 使用流式响应时，注意处理客户端断开连接的情况
