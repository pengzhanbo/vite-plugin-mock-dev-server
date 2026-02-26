# createSSEStream

Create a Server-Sent Events (SSE) write stream for simulating the EventSource interface.

## Function Signature

```ts
function createSSEStream(
  req: IncomingMessage,
  res: ServerResponse
): SSEStream
```

## Parameters

### req

- **Type**: `IncomingMessage`
- **Description**: HTTP request object
- **Required**: Yes

### res

- **Type**: `ServerResponse`
- **Description**: HTTP response object
- **Required**: Yes

## Return Value

- **Type**: `SSEStream`
- **Description**: SSE stream instance, providing methods to write messages and end the stream

## SSEStream Methods

### write(message)

Write an SSE message to the stream.

- **Parameter**: `SSEMessage` object
  - `data`: Message data (string or object)
  - `event`: Event name
  - `id`: Event ID
  - `retry`: Retry interval (milliseconds)
  - `comment`: Comment
- **Return Value**: `boolean` - Whether write was successful

### end()

End the SSE stream.

### destroy(error?)

Destroy the stream, optionally passing an error message.

### pipe(destination)

Pipe the stream to a destination.

## Examples

### Basic SSE

```ts [sse.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/events',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // Send initial message
    sse.write({
      event: 'connected',
      data: { message: 'Connected to event stream' }
    })

    // Send messages periodically
    let count = 0
    const timer = setInterval(() => {
      count++
      sse.write({
        event: 'message',
        id: String(count),
        data: { count, timestamp: Date.now() }
      })

      // End after sending 10 messages
      if (count >= 10) {
        clearInterval(timer)
        sse.end()
      }
    }, 1000)

    // Cleanup when client disconnects
    req.on('close', () => {
      clearInterval(timer)
    })
  }
})
```

### Real-time Notifications

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
      index = notifications.length // Stop sending
    })
  }
})
```

### Real-time Data Stream

```ts [metrics.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/metrics/stream',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // Simulate real-time metrics data
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

    // Send every second
    const interval = setInterval(sendMetrics, 1000)

    // Auto end after 10 seconds
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

### SSE with Retry Configuration

```ts [retry.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/retry-demo',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // Set retry interval to 5 seconds
    sse.write({
      event: 'config',
      retry: 5000,
      data: { message: 'Retry interval set to 5s' }
    })

    // Send events
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

### Multiple Event Types

```ts [multi-event.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/chat/stream',
  response: (req, res) => {
    const sse = createSSEStream(req, res)

    // User joined
    sse.write({
      event: 'user-joined',
      data: { user: 'Alice', time: Date.now() }
    })

    // Send message
    setTimeout(() => {
      sse.write({
        event: 'message',
        data: { user: 'Alice', text: 'Hello!' }
      })
    }, 1000)

    // User left
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

## Client Usage Example

```ts [app.ts]
// Create EventSource connection
const es = new EventSource('/api/events')

// Listen for specific events
es.addEventListener('connected', (e) => {
  console.log('Connected:', JSON.parse(e.data))
})

es.addEventListener('message', (e) => {
  console.log('Message:', JSON.parse(e.data))
})

// Listen for all messages
es.onmessage = (e) => {
  console.log('Default:', e.data)
}

// Error handling
es.onerror = (e) => {
  console.error('SSE Error:', e)
}

// Close connection
function closeConnection() {
  es.close()
}
```

## Important Notes

1. **Connection Persistence**: SSE connections remain open until the server calls `end()` or the client closes the connection
2. **Resource Cleanup**: Be sure to clean up timers and resources when the connection closes
3. **Browser Compatibility**: Modern browsers support EventSource, IE requires polyfill
4. **Cross-Origin**: CORS needs to be configured when using cross-origin
5. **Connection Limit**: Browsers have a limit on the number of SSE connections to the same domain (usually 6)
