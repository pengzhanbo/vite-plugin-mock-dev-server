# WebSocket Configuration Guide

This chapter provides a detailed introduction on how to configure and develop WebSocket Mock services using `vite-plugin-mock-dev-server`.

## Overview

WebSocket provides a full-duplex communication channel, suitable for real-time chat, real-time data push, online collaboration, and other scenarios. The plugin supports WebSocket Mock through the `ws` option.

## Basic Configuration

### Enable WebSocket Support

Specify the WebSocket path prefix in the plugin configuration:

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // HTTP Mock path prefix
      prefix: ['/api'],
      // WebSocket Mock path prefix
      wsPrefix: ['/ws', '/socket.io']
    })
  ]
})
```

::: warning Important
Paths in `wsPrefix` should not be configured in `vite.config.ts`'s `server.proxy` at the same time, as this will cause WebSocket conflicts.
:::

### Basic WebSocket Mock

Create a WebSocket Mock file:

```ts [mock/chat.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/ws/chat',
  ws: true,
  setup(wss) {
    // Listen for connection events
    wss.on('connection', (ws, req) => {
      console.log('Client connected:', req.url)

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'system',
        message: 'Welcome to chat!'
      }))

      // Listen for messages
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())
        console.log('Received:', message)

        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'message',
              data: message
            }))
          }
        })
      })

      // Listen for close
      ws.on('close', () => {
        console.log('Client disconnected')
      })
    })
  }
})
```

## Configuration Options

### `ws` Option

Enable WebSocket support:

```ts
export default defineMock({
  url: '/ws/endpoint',
  ws: true, // Enable WebSocket
  setup(wss, options) {
    // WebSocket server logic
  }
})
```

### `setup` Function

The core configuration function for the WebSocket server:

```ts
function setup(wss, options): void
```

Parameter descriptions:
- `wss`: WebSocketServer - WebSocket server instance
- `options`: Contains the `onCleanup` cleanup callback registration function

#### `wss` (WebSocketServer)

WebSocket server instance, providing the following features:

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `clients` | `Set<WebSocket>` | All connected clients |
| `on(event, callback)` | `Function` | Listen for events |
| `emit(event, data)` | `Function` | Emit events |

#### `options.onCleanup`

Register cleanup callbacks, executed during hot reload:

```ts
export default defineMock({
  url: '/ws/chat',
  ws: true,
  setup(wss, { onCleanup }) {
    const interval = setInterval(() => {
      // Regularly broadcast heartbeat
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'heartbeat' }))
        }
      })
    }, 30000)

    // Register cleanup function
    onCleanup(() => {
      clearInterval(interval)
      console.log('Cleanup WebSocket resources')
    })
  }
})
```

## WebSocket Events

### Server Events

#### `connection` Event

Triggered when a new client connects:

```ts
wss.on('connection', (ws, req) => {
  // ws: WebSocket instance
  // req: HTTP request object

  console.log('New connection from:', req.socket.remoteAddress)
  console.log('URL:', req.url)
  console.log('Headers:', req.headers)
})
```

### Client Events

#### `message` Event

Triggered when a message is received from the client:

```ts
ws.on('message', (data, isBinary) => {
  if (isBinary) {
    // Process binary data
    console.log('Binary data received:', data)
  }
  else {
    // Process text data
    const text = data.toString()
    console.log('Text message:', text)
  }
})
```

#### `close` Event

Triggered when the client disconnects:

```ts
ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} - ${reason}`)
})
```

#### `error` Event

Triggered when an error occurs:

```ts
ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})
```

## Real-world Application Scenarios

### Scenario 1: Real-time Chat Room

```ts [mock/chat-room.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: number
}

// Store chat history
const chatHistory = defineMockData<ChatMessage[]>('chat-history', [])

// Store online users
const onlineUsers = defineMockData<Map<string, { username: string, joinTime: number }>>
('online-users', new Map())

export default defineMock({
  url: '/ws/chat-room',
  ws: true,
  setup(wss, { onCleanup }) {
    // Broadcast message to all clients
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

              // Send history
              ws.send(JSON.stringify({
                type: 'history',
                data: chatHistory.value.slice(-50) // Last 50 messages
              }))

              // Broadcast user joined
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

              // Save to history
              chatHistory.value = [...chatHistory.value, chatMessage]

              // Broadcast message
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

    // Cleanup
    onCleanup(() => {
      onlineUsers.value.clear()
    })
  }
})

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
```

### Scenario 2: Real-time Data Push

```ts [mock/realtime-data.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/ws/realtime',
  ws: true,
  setup(wss, { onCleanup }) {
    // Simulate real-time data
    const generateMetrics = () => ({
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 1000,
      timestamp: Date.now()
    })

    // Push data periodically
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
      // Send current data immediately
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

### Scenario 3: Online Collaborative Editing

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

      // Send current document content
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

          // Apply operation
          applyOperation(op)
          operations.value = [...operations.value, op]

          // Broadcast to other clients
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

## Client Usage Examples

### Native WebSocket

```ts [client.ts]
const ws = new WebSocket('ws://localhost:5173/ws/chat')

// Connection established
ws.onopen = () => {
  console.log('Connected')

  // Send join message
  ws.send(JSON.stringify({
    type: 'join',
    userId: 'user-123',
    username: 'John'
  }))
}

// Receive message
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

// Connection closed
ws.onclose = () => {
  console.log('Disconnected')
}

// Send message
function sendMessage(content: string) {
  ws.send(JSON.stringify({
    type: 'message',
    username: 'John',
    content
  }))
}
```

### Using Socket.io

If using the Socket.io client:

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

## Debugging Tips

### Enable Debug Logging

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

### Using Chrome DevTools

1. Open Chrome DevTools
2. Switch to Network panel
3. Select WS (WebSocket) filter
4. View WebSocket connections and messages

### Command Line Testing

Test using the `wscat` tool:

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:5173/ws/chat

# Send message
> {"type":"join","userId":"1","username":"test"}
```

## Important Notes

1. **Connection Limit**: Browsers have a limit on the number of WebSocket connections to the same domain (usually 6)
2. **Heartbeat Mechanism**: It is recommended to implement heartbeat detection to prevent connections from being disconnected by middleware
3. **Error Handling**: Always add error handling to avoid uncaught exceptions
4. **Resource Cleanup**: Use `onCleanup` to clean up timers and resources
5. **Message Format**: It is recommended to use JSON format uniformly for easier processing

## FAQ

### Q: WebSocket connection failed?

Check the following:
1. Is the `wsPrefix` configuration correct?
2. Ensure the same path is not configured in `vite.config.ts`'s `proxy`
3. Use `ws://` or `wss://` protocol, not `http://`

### Q: How to broadcast messages?

```ts
wss.clients.forEach((client) => {
  if (client.readyState === 1) { // Ensure connection is open
    client.send(message)
  }
})
```

### Q: How to get client information?

```ts
wss.on('connection', (ws, req) => {
  console.log('IP:', req.socket.remoteAddress)
  console.log('URL:', req.url)
  console.log('Headers:', req.headers)
})
```
