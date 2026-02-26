# createSSEStream

创建 Server-Sent Events (SSE) 写入流，用于支持模拟 EventSource 接口。

## 函数签名

```ts
function createSSEStream(
  req: IncomingMessage,
  res: ServerResponse
): SSEStream
```

## 参数

### req

- **类型**: `IncomingMessage`
- **描述**: HTTP 请求对象
- **必填**: 是

### res

- **类型**: `ServerResponse`
- **描述**: HTTP 响应对象
- **必填**: 是

## 返回值

- **类型**: `SSEStream`
- **描述**: SSE 流实例，提供写入消息和结束流的方法

## SSEStream 方法

### write(message)

向流中写入一条 SSE 消息。

- **参数**: `SSEMessage` 对象
  - `data`: 消息数据（字符串或对象）
  - `event`: 事件名称
  - `id`: 事件 ID
  - `retry`: 重试间隔（毫秒）
  - `comment`: 注释
- **返回值**: `boolean` - 写入是否成功

### end()

结束 SSE 流。

### destroy(error?)

销毁流，可选传入错误信息。

### pipe(destination)

将流管道传输到目标。

## 示例

### 基础 SSE

```ts [sse.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/events',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // 发送初始消息
    sse.write({
      event: 'connected',
      data: { message: 'Connected to event stream' }
    })

    // 定时发送消息
    let count = 0
    const timer = setInterval(() => {
      count++
      sse.write({
        event: 'message',
        id: String(count),
        data: { count, timestamp: Date.now() }
      })

      // 发送 10 条后结束
      if (count >= 10) {
        clearInterval(timer)
        sse.end()
      }
    }, 1000)

    // 客户端断开时清理
    req.on('close', () => {
      clearInterval(timer)
    })
  }
})
```

### 实时通知

```ts [notifications.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/notifications',
  response: (req, res) => {
    const sse = createSSEStream(req, res)
    const notifications = [
      { type: 'info', message: 'Welcome!' },
      { type: 'success', message: 'Data synced' },
      { type: 'warning', message: 'Low storage' },
      { type: 'error', message: 'Connection lost' }
    ]

    let index = 0
    const sendNotification = () => {
      if (index < notifications.length) {
        sse.write({
          event: 'notification',
          data: notifications[index++]
        })
        setTimeout(sendNotification, 2000)
      }
      else {
        sse.end()
      }
    }

    sendNotification()

    req.on('close', () => {
      index = notifications.length // 停止发送
    })
  }
})
```

### 实时数据流

```ts [metrics.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/metrics/stream',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // 模拟实时指标数据
    const sendMetrics = () => {
      const metrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        timestamp: Date.now()
      }

      sse.write({
        event: 'metrics',
        data: metrics
      })
    }

    // 每秒发送一次
    const interval = setInterval(sendMetrics, 1000)

    // 10 秒后自动结束
    setTimeout(() => {
      clearInterval(interval)
      sse.write({ event: 'complete', data: 'Stream ended' })
      sse.end()
    }, 10000)

    req.on('close', () => {
      clearInterval(interval)
    })
  }
})
```

### 带重试配置的 SSE

```ts [retry.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/retry-demo',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // 设置重试间隔为 5 秒
    sse.write({
      event: 'config',
      retry: 5000,
      data: { message: 'Retry interval set to 5s' }
    })

    // 发送事件
    let count = 0
    const timer = setInterval(() => {
      sse.write({
        event: 'update',
        id: String(++count),
        data: { count }
      })
    }, 3000)

    req.on('close', () => {
      clearInterval(timer)
    })
  }
})
```

### 多事件类型

```ts [multi-event.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/chat/stream',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // 用户加入
    sse.write({
      event: 'user-joined',
      data: { user: 'Alice', time: Date.now() }
    })

    // 发送消息
    setTimeout(() => {
      sse.write({
        event: 'message',
        data: { user: 'Alice', text: 'Hello!' }
      })
    }, 1000)

    // 用户离开
    setTimeout(() => {
      sse.write({
        event: 'user-left',
        data: { user: 'Alice', time: Date.now() }
      })
      sse.end()
    }, 5000)
  }
})
```

## 客户端使用示例

```ts [app.ts]
// 创建 EventSource 连接
const es = new EventSource('/api/events')

// 监听特定事件
es.addEventListener('connected', (e) => {
  console.log('Connected:', JSON.parse(e.data))
})

es.addEventListener('message', (e) => {
  console.log('Message:', JSON.parse(e.data))
})

// 监听所有消息
es.onmessage = (e) => {
  console.log('Default:', e.data)
}

// 错误处理
es.onerror = (e) => {
  console.error('SSE Error:', e)
}

// 关闭连接
function closeConnection() {
  es.close()
}
```

## 注意事项

1. **连接保持**: SSE 连接会一直保持，直到服务器调用 `end()` 或客户端关闭连接
2. **资源清理**: 务必在连接关闭时清理定时器和资源
3. **浏览器兼容**: 现代浏览器都支持 EventSource，IE 需要使用 polyfill
4. **跨域**: 跨域使用时需要配置 CORS
5. **连接数限制**: 浏览器对同一域名的 SSE 连接数有限制（通常是 6 个）
