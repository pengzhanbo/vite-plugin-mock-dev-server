# defineMock

Type helper function for defining Mock configurations, providing type hints and code completion.

## Function Signature

```ts
// HTTP Mock
function defineMock(config: MockHttpItem): MockHttpItem

// WebSocket Mock
function defineMock(config: MockWebsocketItem): MockWebsocketItem

// Multiple Mock configurations
function defineMock(config: MockOptions): MockOptions
```

## Parameters

### config

- **Type**: `MockHttpItem | MockWebsocketItem | MockOptions`
- **Description**: Mock configuration object or configuration array
- **Required**: Yes

## Return Value

- **Type**: Same as input parameter
- **Description**: Returns the passed configuration object (no actual processing at runtime, only for type inference)

## Examples

### Basic HTTP Mock

```ts [user.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  method: 'GET',
  body: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }
})
```

### Dynamic Response

```ts [dynamic.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user/:id',
  method: 'GET',
  body: ({ params, query }) => {
    return {
      id: params.id,
      name: `User ${params.id}`,
      timestamp: Date.now(),
      filter: query.filter
    }
  }
})
```

### Multiple Configurations

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/users',
    method: 'GET',
    body: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
  },
  {
    url: '/api/users',
    method: 'POST',
    body: ({ body }) => {
      return {
        id: Date.now(),
        ...body
      }
    }
  },
  {
    url: '/api/users/:id',
    method: 'DELETE',
    status: 204
  }
])
```

### WebSocket Mock

```ts [ws.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/chat',
  ws: true,
  setup(wss, { onCleanup }) {
    const clients = new Set()

    wss.on('connection', (ws, req) => {
      clients.add(ws)

      ws.on('message', (data) => {
        // Broadcast message to all clients
        clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(data)
          }
        })
      })

      ws.on('close', () => {
        clients.delete(ws)
      })
    })

    onCleanup(() => clients.clear())
  }
})
```

### Using Validators

```ts [validator.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/search',
    validator: { query: { type: 'user' } },
    body: { result: 'user search result' }
  },
  {
    url: '/api/search',
    validator: { query: { type: 'post' } },
    body: { result: 'post search result' }
  },
  {
    url: '/api/search',
    validator: request => request.query.type === 'comment',
    body: { result: 'comment search result' }
  }
])
```

## Type Inference

The `defineMock` function automatically infers types based on the configuration:

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

// TypeScript will automatically infer config type as MockHttpItem
const config = defineMock({
  url: '/api/test',
  // Complete type hints here
  body: { message: 'hello' }
})
```
