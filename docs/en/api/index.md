# API Reference

This section provides the complete API reference documentation for `vite-plugin-mock-dev-server`, including detailed descriptions of all type definitions, helper functions, and configuration options.

## Helper Functions

| Function | Description |
|----------|-------------|
| [mockDevServerPlugin](./mock-dev-server-plugin) | Create Mock Dev Server plugin |
| [defineMock](./define-mock) | Type helper function for defining Mock configurations |
| [createDefineMock](./create-define-mock) | Create a custom defineMock function |
| [defineMockData](./define-mock-data) | Define shareable Mock data |
| [createSSEStream](./create-sse-stream) | Create Server-Sent Events stream |

## Type Definitions

| Type | Description |
|------|-------------|
| [MockServerPluginOptions](./mock-server-plugin-options) | Plugin configuration options |
| [MockHttpItem](./mock-http-item) | HTTP Mock configuration item |
| [MockRequest](./mock-request) | Extended request object |
| [MockResponse](./mock-response) | Extended response object |

## Quick Navigation

### Plugin Configuration

```ts
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      dir: 'mock',
      // ... more configurations
    })
  ]
})
```

### Mock Configuration

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  method: 'GET',
  body: { id: 1, name: 'John' }
})
```

### Shared Data

```ts
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

const users = defineMockData('users', [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
])

export default defineMock({
  url: '/api/users',
  body: () => users.value
})
```
