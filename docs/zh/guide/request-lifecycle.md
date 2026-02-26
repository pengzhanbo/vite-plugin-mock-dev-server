# 请求生命周期

理解 Mock 请求的处理流程，有助于你更好地排查问题和优化配置。

## 概述

当浏览器发起一个请求时，插件会按照以下流程处理：

```txt
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   请求进入  │ -> │  路径匹配   │ -> │  验证处理   │ -> │  响应生成   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       v                  v                  v                  v
  解析请求信息       查找 Mock 配置      执行验证器        返回 Mock 数据
  (URL/Method/       按优先级排序        检查条件          或转发到后端
   Headers/Body)
```

## 详细流程

### 1. 请求进入阶段

**处理内容**：

- 接收 HTTP 请求
- 解析 URL、Method、Headers
- 解析请求体（Body）
- 解析 Cookies

**关键代码**：

```ts
// 请求信息会自动解析到 request 对象
export default defineMock({
  url: '/api/users',
  body: request => ({
    // request 包含以下信息：
    method: request.method, // 'GET'
    url: request.url, // '/api/users?page=1'
    query: request.query, // { page: '1' }
    headers: request.headers, // { 'content-type': 'application/json' }
    body: request.body, // POST/PUT 请求体
    params: request.params, // 路由参数
    getCookie: request.getCookie // 获取 Cookie 的方法
  })
})
```

### 2. 路径匹配阶段

**处理内容**：

- 检查请求路径是否匹配 `prefix` 配置
- 遍历所有 Mock 配置进行匹配
- 按优先级排序匹配结果

**匹配优先级**：

1. **前缀匹配**：请求路径必须以 `prefix` 开头

   ```ts
   mockDevServerPlugin({
     prefix: ['/api', '/mock'] // 只处理这些前缀的请求
   })
   ```

2. **URL 匹配**：使用 `path-to-regexp` 匹配 `url` 配置

   ```ts
   export default defineMock({
     url: '/api/users/:id', // 匹配 /api/users/123
     body: ({ params }) => ({ id: params.id })
   })
   ```

3. **Method 匹配**：检查 HTTP 方法是否匹配

   ```ts
   export default defineMock({
     url: '/api/users',
     method: ['GET', 'POST'], // 只匹配 GET 和 POST
     body: { list: [] }
   })
   ```

### 3. 验证处理阶段

**处理内容**：

- 执行 `validator` 验证器
- 检查请求参数、查询字符串、请求体
- 确定最终匹配的 Mock 配置

**验证器类型**：

```ts
// 1. 对象验证 - 精确匹配
export default defineMock({
  url: '/api/search',
  validator: { query: { type: 'user' } },
  body: { result: 'users' }
})

// 2. 函数验证 - 自定义逻辑
export default defineMock({
  url: '/api/data',
  validator: (request) => {
    return request.headers['x-role'] === 'admin'
  },
  body: { sensitive: 'data' }
})
```

### 4. 响应生成阶段

**处理内容**：

- 执行 `body` 函数或 `response` 函数
- 设置响应状态码、响应头、Cookies
- 返回响应数据

**响应类型**：

```ts
// 1. 静态响应
export default defineMock({
  url: '/api/static',
  status: 200,
  headers: { 'x-custom': 'value' },
  body: { message: 'ok' }
})

// 2. 动态响应
export default defineMock({
  url: '/api/dynamic',
  body: ({ query, params }) => ({
    page: query.page,
    id: params.id
  })
})

// 3. 自定义响应
export default defineMock({
  url: '/api/custom',
  response: (req, res) => {
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ custom: true }))
  }
})
```

## WebSocket 生命周期

WebSocket 连接有独立的生命周期：

```txt
连接建立 -> 消息处理 -> 连接关闭
    |           |            |
    v           v            v
  upgrade    message      cleanup
  协议升级   双向通信     资源清理
```

### WebSocket 处理流程

```ts
export default defineMock({
  url: '/ws/chat',
  ws: true,
  setup(wss, { onCleanup }) {
    // 1. 连接建立阶段
    wss.on('connection', (ws, req) => {
      console.log('Client connected')

      // 2. 消息处理阶段
      ws.on('message', (data) => {
        // 处理消息并广播
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(data)
          }
        })
      })

      // 3. 连接关闭阶段
      ws.on('close', () => {
        console.log('Client disconnected')
      })
    })

    // 4. 清理阶段（热更新时触发）
    onCleanup(() => {
      console.log('Cleaning up WebSocket server')
    })
  }
})
```

## 热更新机制

### Mock 文件热更新

当 Mock 文件修改时：

1. **文件监听**：插件监听 `mock` 目录下的文件变化
2. **重新加载**：重新编译修改的 Mock 文件
3. **缓存更新**：更新 Mock 配置缓存
4. **页面刷新**（可选）：如果配置了 `reload: true`，刷新页面

```ts
mockDevServerPlugin({
  reload: false // 默认 false，热更新不刷新页面
})
```

### 数据持久化

使用 `defineMockData` 可以在热更新时保持数据：

```ts
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

// 数据在热更新时会被保留
const users = defineMockData('users', [])

export default defineMock({
  url: '/api/users',
  body: () => users.value // 热更新后数据仍然存在
})
```

## 调试生命周期

### 开启调试日志

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

### 自定义调试信息

```ts
export default defineMock({
  url: '/api/debug',
  body: (request) => {
    console.log('[Debug] Request:', {
      method: request.method,
      url: request.url,
      query: request.query,
      body: request.body
    })
    return { debug: true }
  }
})
```
