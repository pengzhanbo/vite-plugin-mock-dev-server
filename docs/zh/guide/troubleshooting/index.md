# 故障排查

本章节帮助你解决在使用 `vite-plugin-mock-dev-server` 过程中遇到的常见问题。

## 快速诊断清单

遇到问题时，请按以下顺序检查：

1. ✅ 插件是否正确安装
2. ✅ `vite.config.ts` 中是否正确配置
3. ✅ Mock 文件是否在正确的目录
4. ✅ 开发服务器是否已重启
5. ✅ 请求路径是否匹配

## 常见问题

### Mock API 没有响应

#### 症状

请求 Mock API 时返回 404 或没有响应。

#### 可能原因及解决方案

**1. 插件未正确加载**

检查 `vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    // 确保插件已添加
    mockDevServerPlugin()
  ],
  // 确保代理配置正确
  server: {
    proxy: {
      // 插件读取 proxy 配置，匹配 /api 开头的请求
      '/api': 'http://example.com'
    }
  }
})
```

**2. Mock 文件位置错误**

默认情况下，插件会查找 `mock` 目录下的文件：

``` txt
project-root/
├── mock/                 # Mock 文件目录
│   ├── api.mock.ts
│   └── users.mock.ts
├── src/
└── vite.config.ts
```

如果使用了自定义目录：

```ts
mockDevServerPlugin({
  dir: 'my-mock-folder' // 确保目录存在
})
```

**3. 文件扩展名不匹配**

默认只识别以下扩展名：

- `.mock.js`
- `.mock.ts`
- `.mock.cjs`
- `.mock.mjs`
- `.mock.json`
- `.mock.json5`

**4. 开发服务器未重启**

修改 `vite.config.ts` 后需要重启开发服务器。

### 热更新不生效

#### 症状

修改 Mock 文件后，数据没有更新。

#### 解决方案

**1. 检查文件是否被监听**

开启调试日志查看文件监听状态：

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

**2. 检查文件路径**

确保修改的文件在配置的 `include` 范围内：

```ts
mockDevServerPlugin({
  include: ['**/*.mock.ts'], // 确保你的文件匹配这个模式
  exclude: ['**/node_modules/**', '**/*.test.mock.ts'] // 确保没有被排除
})
```

**3. 启用页面刷新**

热更新仅更新服务端数据，浏览器需要刷新才能看到更新。可以启用热更新时自动刷新浏览器页面：

```ts
mockDevServerPlugin({
  reload: true // 修改 Mock 文件后刷新页面
})
```

### 路径匹配失败

#### 症状

请求路径与 Mock 配置不匹配。

#### 调试方法

**1. 开启调试日志**

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

查看控制台输出。

**2. 检查路径格式**

常见错误：

```ts
// ❌ 错误：缺少前导斜杠
export default defineMock({
  url: 'api/users' // 应该是 '/api/users'
})

// ❌ 错误：尾部斜杠不一致
// Mock 配置
url: '/api/users'
// 实际请求
fetch('/api/users/') // 不匹配！

// ✅ 正确
url: '/api/users'
fetch('/api/users') // 匹配
```

**3. 检查前缀配置**

如果使用 `prefix` 配置，确保请求路径以 prefix 开头：

```ts
mockDevServerPlugin({
  prefix: ['/api'] // 只拦截 /api 开头的请求
})

// ✅ 会被拦截
fetch('/api/users')

// ❌ 不会被拦截
fetch('/mock/users')
```

### WebSocket 连接失败

#### 症状

WebSocket 连接无法建立或立即断开。

#### 解决方案

**1. 检查 WebSocket 前缀配置**

```ts
mockDevServerPlugin({
  wsPrefix: ['/ws', '/socket.io'] // WebSocket 路径前缀
})
```

**2. 确保没有在 Vite 代理中配置相同路径**

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // ❌ 错误：WebSocket 路径不应该在这里配置
      '/ws': 'http://localhost:8080'
    }
  },
  plugins: [
    mockDevServerPlugin({
      wsPrefix: ['/ws'] // 应该只在这里配置
    })
  ]
})
```

**3. 检查 WebSocket URL 格式**

```js
// ✅ 正确
const socket = new WebSocket('ws://localhost:5173/ws/chat')

// ❌ 错误：使用了 http 协议
const wrongSocket = new WebSocket('http://localhost:5173/ws/chat')
```

### Cookie 设置不生效

#### 症状

设置的 Cookie 在浏览器中看不到。

#### 解决方案

**1. 检查 Cookie 配置**

```ts
export default defineMock({
  url: '/api/login',
  cookies: {
    // ✅ 正确：设置 Cookie
    session: ['abc123', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24小时，单位是毫秒
    }]
  }
})
```

**2. 检查浏览器安全限制**

- `Secure` 标志要求 HTTPS
- `SameSite=Strict` 可能阻止跨站请求
- `HttpOnly` 的 Cookie 在 JavaScript 中不可见

**3. 检查请求是否跨域**

如果前端和 Mock 服务跨域，需要配置 CORS：

```ts
mockDevServerPlugin({
  cors: true // 或详细配置
})
```

### 文件上传失败

#### 症状

上传文件时返回 413 或无法解析文件。

#### 解决方案

**1. 配置文件大小限制**

```ts
mockDevServerPlugin({
  formidableOptions: {
    maxFileSize: 10 * 1024 * 1024, // 10MB，默认 5MB
    maxFieldsSize: 10 * 1024 * 1024
  }
})
```

**2. 检查文件保存路径**

```ts
import path from 'node:path'

mockDevServerPlugin({
  formidableOptions: {
    uploadDir: path.join(process.cwd(), 'uploads'), // 确保目录存在
    keepExtensions: true // 保留文件扩展名
  }
})
```

**3. 检查请求 Content-Type**

确保请求头包含正确的 Content-Type：

```txt
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
```

### 请求体解析失败

#### 症状

无法获取请求体数据或数据格式错误。

#### 解决方案

**1. 检查 Content-Type**

```ts
// 确保请求发送了正确的 Content-Type
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' // 默认为 json 格式，其他格式需指定
  },
  body: JSON.stringify({ name: 'John' })
})
```

**2. 配置请求体大小限制**

```ts
mockDevServerPlugin({
  bodyParserOptions: {
    jsonLimit: '10mb', // JSON 请求体大小限制
    formLimit: '10mb', // Form 请求体大小限制
    textLimit: '10mb' // Text 请求体大小限制
  }
})
```

**3. 检查请求体格式**

```ts
export default defineMock({
  url: '/api/users',
  method: 'POST',
  body: (request) => {
    console.log('Request body:', request.body) // 调试用
    return { received: request.body }
  }
})
```

### 与后端 API 冲突

#### 症状

Mock API 和真实后端 API 同时存在时发生冲突。

#### 解决方案

**配置 Vite 代理**

```ts
export default defineConfig({
  plugins: [mockDevServerPlugin({ prefix: ['/api'] })],
  server: {
    proxy: {
      // 未匹配到 Mock 的请求转发到后端
      '^/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

## 调试技巧

### 开启详细日志

```ts
mockDevServerPlugin({
  log: 'debug' // 'debug' | 'info' | 'warn' | 'error' | 'silent'
})
```

### 检查请求详情

```ts
export default defineMock({
  url: '/api/debug',
  body: request => ({
    // 查看完整请求信息
    method: request.method,
    url: request.url,
    query: request.query,
    params: request.params,
    body: request.body,
    headers: request.headers,
    cookies: request.getCookie('session')
  })
})
```

### 使用浏览器开发者工具

1. **Network 面板**: 查看请求和响应详情
2. **Console 面板**: 查看插件日志输出
3. **Application 面板**: 查看 Cookies 和 LocalStorage

## 获取帮助

如果以上方法都无法解决你的问题：

1. **查看文档**: 仔细阅读相关功能的使用文档
2. **搜索 Issues**: 在 [GitHub Issues](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues) 中搜索类似问题
3. **提交 Issue**: 如果确认是 bug，请提交 Issue 并提供：
   - 插件版本
   - Vite 版本
   - Node.js 版本
   - 最小可复现示例
   - 错误日志

## 已知限制

1. **某些中间件不兼容**: 与某些 Vite 插件可能存在冲突
