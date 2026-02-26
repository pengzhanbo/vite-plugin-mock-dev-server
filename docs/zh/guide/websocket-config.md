# WebSocket 配置详解

本章节详细介绍如何使用 `vite-plugin-mock-dev-server` 配置和开发 WebSocket Mock 服务。

## 概述

WebSocket 提供了全双工通信通道，适用于实时聊天、实时数据推送、在线协作等场景。插件通过 `ws` 选项支持 WebSocket Mock。

## 基础配置

### 启用 WebSocket 支持

在插件配置中指定 WebSocket 路径前缀：

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // HTTP Mock 路径前缀
      prefix: ['/api'],
      // WebSocket Mock 路径前缀
      wsPrefix: ['/ws', '/socket.io']
    })
  ]
})
```

::: warning 重要
`wsPrefix` 中的路径不应该同时配置在 `vite.config.ts` 的 `server.proxy` 中，这会导致 WebSocket 冲突。
:::

### 基本 WebSocket Mock

创建 WebSocket Mock 文件：

```ts [mock/chat.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/ws/chat',
  ws: true,
  setup(wss) {
    // 监听连接事件
    wss.on('connection', (ws, req) => {
      console.log('Client connected:', req.url)

      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'system',
        message: 'Welcome to chat!'
      }))

      // 监听消息
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())
        console.log('Received:', message)

        // 广播给所有客户端
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'message',
              data: message
            }))
          }
        })
      })

      // 监听关闭
      ws.on('close', () => {
        console.log('Client disconnected')
      })
    })
  }
})
```

## 配置选项详解

### `ws` 选项

启用 WebSocket 支持：

```ts
export default defineMock({
  url: '/ws/endpoint',
  ws: true, // 启用 WebSocket
  setup(wss, options) {
    // WebSocket 服务器逻辑
  }
})
```

### `setup` 函数

WebSocket 服务器的核心配置函数：

```ts
function setup(wss, options): void
```

参数说明：
- `wss`: WebSocketServer - WebSocket 服务器实例
- `options`: 包含 `onCleanup` 清理回调注册函数

#### `wss` (WebSocketServer)

WebSocket 服务器实例，提供以下功能：

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `clients` | `Set<WebSocket>` | 所有连接的客户端 |
| `on(event, callback)` | `Function` | 监听事件 |
| `emit(event, data)` | `Function` | 触发事件 |

#### `options.onCleanup`

注册清理回调，在热更新时执行：

```ts
export default defineMock({
  url: '/ws/chat',
  ws: true,
  setup(wss, { onCleanup }) {
    const interval = setInterval(() => {
      // 定期广播心跳
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'heartbeat' }))
        }
      })
    }, 30000)

    // 注册清理函数
    onCleanup(() => {
      clearInterval(interval)
      console.log('Cleanup WebSocket resources')
    })
  }
})
```

## WebSocket 事件

### 服务器事件

#### `connection` 事件

新客户端连接时触发：

```ts
wss.on('connection', (ws, req) => {
  // ws: WebSocket 实例
  // req: HTTP 请求对象

  console.log('New connection from:', req.socket.remoteAddress)
  console.log('URL:', req.url)
  console.log('Headers:', req.headers)
})
```

### 客户端事件

#### `message` 事件

收到客户端消息时触发：

```ts
ws.on('message', (data, isBinary) => {
  if (isBinary) {
    // 处理二进制数据
    console.log('Binary data received:', data)
  }
  else {
    // 处理文本数据
    const text = data.toString()
    console.log('Text message:', text)
  }
})
```

#### `close` 事件

客户端断开连接时触发：

```ts
ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} - ${reason}`)
})
```

#### `error` 事件

发生错误时触发：

```ts
ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})
```

## 实际应用场景

### 场景 1：实时聊天室

```ts [mock/chat-room.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: number
}

// 存储聊天记录
const chatHistory = defineMockData<ChatMessage[]>('chat-history', [])

// 存储在线用户
const onlineUsers = defineMockData<Map<string, { username: string, joinTime: number }>>
('online-users', new Map())

export default defineMock({
  url: '/ws/chat-room',
  ws: true,
  setup(wss, { onCleanup }) {
    // 广播消息给所有客户端
    const broadcast = (message: any, excludeWs?: WebSocket) => {
      const data = JSON.stringify(message)
      wss.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === 1) {
          client.send(data)
        }
      })
    }

    wss.on('connection', (ws, req) => {
      let userId: string | null = null

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())

          switch (message.type) {
            case 'join':
              userId = message.userId
              onlineUsers.value.set(userId, {
                username: message.username,
                joinTime: Date.now()
              })

              // 发送历史记录
              ws.send(JSON.stringify({
                type: 'history',
                data: chatHistory.value.slice(-50) // 最近50条
              }))

              // 广播用户加入
              broadcast({
                type: 'user-joined',
                userId,
                username: message.username,
                onlineCount: onlineUsers.value.size
              })
              break

            case 'message': {
              if (!userId)
                return

              const chatMessage: ChatMessage = {
                id: generateId(),
                userId,
                username: message.username,
                content: message.content,
                timestamp: Date.now()
              }

              // 保存到历史
              chatHistory.value = [...chatHistory.value, chatMessage]

              // 广播消息
              broadcast({
                type: 'new-message',
                data: chatMessage
              })
              break
            }

            case 'typing': {
              broadcast({
                type: 'user-typing',
                userId,
                username: message.username
              }, ws)
              break
            }
          }
        }
        catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }))
        }
      })

      ws.on('close', () => {
        if (userId) {
          const user = onlineUsers.value.get(userId)
          onlineUsers.value.delete(userId)

          broadcast({
            type: 'user-left',
            userId,
            username: user?.username,
            onlineCount: onlineUsers.value.size
          })
        }
      })
    })

    // 清理
    onCleanup(() => {
      onlineUsers.value.clear()
    })
  }
})

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
```

### 场景 2：实时数据推送

```ts [mock/realtime-data.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/ws/realtime',
  ws: true,
  setup(wss, { onCleanup }) {
    // 模拟实时数据
    const generateMetrics = () => ({
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 1000,
      timestamp: Date.now()
    })

    // 定期推送数据
    const interval = setInterval(() => {
      const data = generateMetrics()
      const message = JSON.stringify({
        type: 'metrics',
        data
      })

      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(message)
        }
      })
    }, 1000)

    wss.on('connection', (ws) => {
      // 立即发送当前数据
      ws.send(JSON.stringify({
        type: 'metrics',
        data: generateMetrics()
      }))
    })

    onCleanup(() => {
      clearInterval(interval)
    })
  }
})
```

### 场景 3：在线协作编辑

```ts [mock/collaboration.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

interface Operation {
  id: string
  userId: string
  type: 'insert' | 'delete'
  position: number
  content?: string
  timestamp: number
}

const documentContent = defineMockData<string>('doc-content', '')
const operations = defineMockData<Operation[]>('operations', [])

export default defineMock({
  url: '/ws/collaboration/:docId',
  ws: true,
  setup(wss) {
    wss.on('connection', (ws, req) => {
      const docId = req.url?.split('/').pop()

      // 发送当前文档内容
      ws.send(JSON.stringify({
        type: 'init',
        content: documentContent.value,
        docId
      }))

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())

        if (message.type === 'operation') {
          const op: Operation = {
            id: generateId(),
            userId: message.userId,
            type: message.operation.type,
            position: message.operation.position,
            content: message.operation.content,
            timestamp: Date.now()
          }

          // 应用操作
          applyOperation(op)
          operations.value = [...operations.value, op]

          // 广播给其他客户端
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'operation',
                data: op
              }))
            }
          })
        }
      })
    })

    function applyOperation(op: Operation) {
      const content = documentContent.value
      if (op.type === 'insert' && op.content) {
        documentContent.value
          = content.slice(0, op.position)
            + op.content
            + content.slice(op.position)
      }
      else if (op.type === 'delete') {
        documentContent.value
          = content.slice(0, op.position)
            + content.slice(op.position + (op.content?.length || 1))
      }
    }

    function generateId(): string {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }
})
```

## 客户端使用示例

### 原生 WebSocket

```ts [client.ts]
const ws = new WebSocket('ws://localhost:5173/ws/chat')

// 连接建立
ws.onopen = () => {
  console.log('Connected')

  // 发送加入消息
  ws.send(JSON.stringify({
    type: 'join',
    userId: 'user-123',
    username: 'John'
  }))
}

// 接收消息
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'history':
      console.log('Chat history:', message.data)
      break
    case 'new-message':
      console.log('New message:', message.data)
      break
    case 'user-joined':
      console.log(`${message.username} joined`)
      break
  }
}

// 连接关闭
ws.onclose = () => {
  console.log('Disconnected')
}

// 发送消息
function sendMessage(content: string) {
  ws.send(JSON.stringify({
    type: 'message',
    username: 'John',
    content
  }))
}
```

### 使用 Socket.io

如果使用 Socket.io 客户端：

```ts
import { io } from 'socket.io-client'

const socket = io('ws://localhost:5173', {
  path: '/ws/chat'
})

socket.on('connect', () => {
  console.log('Connected')
})

socket.on('new-message', (data) => {
  console.log('New message:', data)
})

socket.emit('message', {
  username: 'John',
  content: 'Hello!'
})
```

## 调试技巧

### 开启调试日志

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

### 使用 Chrome DevTools

1. 打开 Chrome DevTools
2. 切换到 Network 面板
3. 选择 WS (WebSocket) 过滤器
4. 查看 WebSocket 连接和消息

### 命令行测试

使用 `wscat` 工具测试：

```bash
# 安装 wscat
npm install -g wscat

# 连接 WebSocket
wscat -c ws://localhost:5173/ws/chat

# 发送消息
> {"type":"join","userId":"1","username":"test"}
```

## 注意事项

1. **连接数限制**: 浏览器对同一域名的 WebSocket 连接数有限制（通常 6 个）
2. **心跳机制**: 建议实现心跳检测，防止连接被中间件断开
3. **错误处理**: 始终添加错误处理，避免未捕获的异常
4. **资源清理**: 使用 `onCleanup` 清理定时器和资源
5. **消息格式**: 建议统一使用 JSON 格式，便于处理

## 常见问题

### Q: WebSocket 连接失败？

检查以下几点：
1. `wsPrefix` 配置是否正确
2. 确保没有在 `vite.config.ts` 的 `proxy` 中配置相同路径
3. 使用 `ws://` 或 `wss://` 协议，不是 `http://`

### Q: 如何广播消息？

```ts
wss.clients.forEach((client) => {
  if (client.readyState === 1) { // 确保连接打开
    client.send(message)
  }
})
```

### Q: 如何获取客户端信息？

```ts
wss.on('connection', (ws, req) => {
  console.log('IP:', req.socket.remoteAddress)
  console.log('URL:', req.url)
  console.log('Headers:', req.headers)
})
```
