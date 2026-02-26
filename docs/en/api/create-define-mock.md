# createDefineMock

Create a custom `defineMock` function for preprocessing Mock configurations.

## Function Signature

```ts
function createDefineMock(
  transformer: (
    mock: MockHttpItem | MockWebsocketItem
  ) => MockHttpItem | MockWebsocketItem | void
): typeof defineMock
```

## Parameters

### transformer

- **Type**: `(mock: MockHttpItem | MockWebsocketItem) => MockHttpItem | MockWebsocketItem | void`
- **Description**: Preprocessing function, receives a Mock configuration object, can modify and return, or return a new configuration object
- **Required**: Yes

## Return Value

- **Type**: `typeof defineMock`
- **Description**: Custom defineMock function, same usage as the original

## Use Cases

1. **Add path prefix uniformly**: Avoid writing the same prefix repeatedly in each configuration
2. **Add response headers uniformly**: Add uniform response headers for all Mocks
3. **Set delay uniformly**: Add uniform response delay for all Mocks
4. **Configuration transformation**: Transform custom configurations to plugin-supported format

## Examples

### Uniform Path Prefix

```ts [defineApiMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineApiMock = createDefineMock((mock) => {
  mock.url = `/api${mock.url}`
})
```

```ts [user.mock.ts]
import { defineApiMock } from './defineApiMock'

// Actual matching URL is /api/users
export default defineApiMock({
  url: '/users',
  body: [{ id: 1, name: 'John' }]
})
```

### Uniform Response Headers

```ts [defineAuthMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineAuthMock = createDefineMock((mock) => {
  mock.headers = {
    ...mock.headers,
    'X-Auth-Required': 'true'
  }
})
```

```ts [profile.mock.ts]
import { defineAuthMock } from './defineAuthMock'

export default defineAuthMock({
  url: '/api/profile',
  body: { name: 'John', role: 'admin' }
})
```

### Uniform Delay Setting

```ts [defineDelayedMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineDelayedMock = createDefineMock((mock) => {
  mock.delay = 1000 // Uniform delay 1 second
})
```

### Combining Multiple Transformers

```ts [defineStandardMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineStandardMock = createDefineMock((mock) => {
  // Add API prefix
  if (!mock.url.startsWith('/api')) {
    mock.url = `/api${mock.url}`
  }

  // Set default delay
  if (!mock.delay) {
    mock.delay = 500
  }

  // Add default response headers
  mock.headers = {
    'Content-Type': 'application/json',
    ...mock.headers
  }
})
```

### Conditional Transformation

```ts [defineEnvMock.ts]
import { createDefineMock } from 'vite-plugin-mock-dev-server'

const isDev = process.env.NODE_ENV === 'development'

export const defineEnvMock = createDefineMock((mock) => {
  // Add debug info in development environment
  if (isDev) {
    mock.headers = {
      ...mock.headers,
      'X-Debug': 'true'
    }
  }
})
```

## Important Notes

1. **Array Handling**: When passing an array configuration, the transformer will be called for each element separately
2. **Return Value**: The transformer can return a new configuration object, or modify and return the original object
3. **Type Safety**: Custom defineMock functions maintain complete type inference
4. **Chaining**: Multiple transformers can be chained through function composition

```ts
// Chaining example
const defineMockA = createDefineMock((mock) => { /* ... */ })
const defineMockB = createDefineMock((mock) => { /* ... */ })

// Combined usage
const config = defineMockB(defineMockA({ url: '/test' }))
```
