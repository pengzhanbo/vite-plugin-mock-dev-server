# Request Lifecycle

Understanding the Mock request processing flow helps you better troubleshoot issues and optimize configurations.

## Overview

When the browser initiates a request, the plugin processes it according to the following flow:

```txt
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │ -> │   Path      │ -> │  Validator  │ -> │  Response   │
│   Enter     │    │   Matching  │    │  Processing │    │  Generation │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       v                  v                  v                  v
  Parse request      Find Mock       Execute        Return Mock
  info (URL/Method/  config and      validators     data or forward
  Headers/Body)      sort by priority check conditions to backend
```

## Detailed Flow

### 1. Request Entry Stage

**Processing Content**:

- Receive HTTP request
- Parse URL, Method, Headers
- Parse request body
- Parse Cookies

**Key Code**:

```ts
// Request information is automatically parsed into the request object
export default defineMock({
  url: '/api/users',
  body: request => ({
    // request contains the following information:
    method: request.method, // 'GET'
    url: request.url, // '/api/users?page=1'
    query: request.query, // { page: '1' }
    headers: request.headers, // { 'content-type': 'application/json' }
    body: request.body, // POST/PUT request body
    params: request.params, // Route parameters
    getCookie: request.getCookie // Method to get Cookie
  })
})
```

### 2. Path Matching Stage

**Processing Content**:

- Check if request path matches `prefix` configuration
- Traverse all Mock configurations for matching
- Sort matching results by priority

**Matching Priority**:

1. **Prefix Matching**: Request path must start with `prefix`

   ```ts
   mockDevServerPlugin({
     prefix: ['/api', '/mock'] // Only process requests with these prefixes
   })
   ```

2. **URL Matching**: Use `path-to-regexp` to match `url` configuration

   ```ts
   export default defineMock({
     url: '/api/users/:id', // Matches /api/users/123
     body: ({ params }) => ({ id: params.id })
   })
   ```

3. **Method Matching**: Check if HTTP method matches

   ```ts
   export default defineMock({
     url: '/api/users',
     method: ['GET', 'POST'], // Only matches GET and POST
     body: { list: [] }
   })
   ```

### 3. Validator Processing Stage

**Processing Content**:

- Execute `validator` validators
- Check request parameters, query strings, request body
- Determine the final matched Mock configuration

**Validator Types**:

```ts
// 1. Object validation - exact match
export default defineMock({
  url: '/api/search',
  validator: { query: { type: 'user' } },
  body: { result: 'users' }
})

// 2. Function validation - custom logic
export default defineMock({
  url: '/api/data',
  validator: (request) => {
    return request.headers['x-role'] === 'admin'
  },
  body: { sensitive: 'data' }
})
```

### 4. Response Generation Stage

**Processing Content**:

- Execute `body` function or `response` function
- Set response status code, headers, Cookies
- Return response data

**Response Types**:

```ts
// 1. Static response
export default defineMock({
  url: '/api/static',
  status: 200,
  headers: { 'x-custom': 'value' },
  body: { message: 'ok' }
})

// 2. Dynamic response
export default defineMock({
  url: '/api/dynamic',
  body: ({ query, params }) => ({
    page: query.page,
    id: params.id
  })
})

// 3. Custom response
export default defineMock({
  url: '/api/custom',
  response: (req, res) => {
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ custom: true }))
  }
})
```

## WebSocket Lifecycle

WebSocket connections have an independent lifecycle:

```txt
Connection Established -> Message Processing -> Connection Closed
        |                       |                       |
        v                       v                       v
     upgrade                message                cleanup
   protocol upgrade        bidirectional          resource cleanup
                           communication
```

### WebSocket Processing Flow

```ts
export default defineMock({
  url: '/ws/chat',
  ws: true,
  setup(wss, { onCleanup }) {
    // 1. Connection establishment stage
    wss.on('connection', (ws, req) => {
      console.log('Client connected')

      // 2. Message processing stage
      ws.on('message', (data) => {
        // Process message and broadcast
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(data)
          }
        })
      })

      // 3. Connection close stage
      ws.on('close', () => {
        console.log('Client disconnected')
      })
    })

    // 4. Cleanup stage (triggered during hot reload)
    onCleanup(() => {
      console.log('Cleaning up WebSocket server')
    })
  }
})
```

## Hot Reload Mechanism

### Mock File Hot Reload

When Mock files are modified:

1. **File Watching**: Plugin watches for file changes in the `mock` directory
2. **Reload**: Recompile the modified Mock files
3. **Cache Update**: Update Mock configuration cache
4. **Page Refresh** (optional): If `reload: true` is configured, refresh the page

```ts
mockDevServerPlugin({
  reload: false // Default false, hot reload does not refresh page
})
```

### Data Persistence

Use `defineMockData` to persist data across hot reloads:

```ts
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

// Data is preserved during hot reload
const users = defineMockData('users', [])

export default defineMock({
  url: '/api/users',
  body: () => users.value // Data persists after hot reload
})
```

## Debugging Lifecycle

### Enable Debug Logging

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

### Custom Debug Information

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
