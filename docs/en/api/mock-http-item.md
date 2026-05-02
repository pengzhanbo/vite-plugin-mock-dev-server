# MockHttpItem

HTTP Mock configuration item interface, used to define the Mock response for a single HTTP endpoint.

## Interface Definition

```ts
interface MockHttpItem extends MockBaseItem {
  method?: Method | Method[]
  headers?: Headers | ResponseHeaderFn
  status?: number
  statusText?: string
  delay?: number | [number, number]
  cookies?: ResponseCookies | ResponseCookiesFn
  type?: 'text' | 'json' | 'buffer' | string
  body?: ResponseBody | ResponseBodyFn
  response?: ResponseFn
  validator?: Validator | ValidatorFn
  error?: MockErrorConfig
  ws?: false
  scene?: string | string[]
}
```

## Basic Properties

### url

- **Type**: `string`
- **Required**: Yes
- **Description**: Request path, supports dynamic parameters

Uses [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for path matching.

```ts
export default defineMock({
  url: '/api/users', // Static path
  url: '/api/users/:id', // Dynamic parameter
  url: '/api/*path', // Wildcard matching
})
```

### enabled

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to enable the current Mock configuration

```ts
export default defineMock({
  url: '/api/test',
  enabled: false // Temporarily disable
})
```

### method

- **Type**: `Method | Method[]`
- **Default**: `['GET', 'POST']`
- **Description**: Allowed HTTP methods

```ts
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'

// GET only
export default defineMock({
  url: '/api/users',
  method: 'GET'
})

// GET or POST
export default defineMock({
  url: '/api/users',
  method: ['GET', 'POST']
})
```

## Response Configuration

### status

- **Type**: `number`
- **Default**: `200`
- **Description**: HTTP response status code

```ts
export default defineMock({
  url: '/api/not-found',
  status: 404
})
```

### statusText

- **Type**: `string`
- **Default**: `'OK'`
- **Description**: HTTP response status text

```ts
export default defineMock({
  url: '/api/error',
  status: 500,
  statusText: 'Internal Server Error'
})
```

### headers

- **Type**: `Headers | (request: MockRequest) => Headers`
- **Description**: Custom response headers

```ts
export default defineMock({
  url: '/api/custom',
  headers: {
    'X-Custom-Header': 'value',
    'X-Request-ID': '12345'
  }
})

// Dynamic headers
export default defineMock({
  url: '/api/dynamic-header',
  headers: request => ({
    'X-User-Agent': request.headers['user-agent']
  })
})
```

### type

- **Type**: `'text' | 'json' | 'buffer' | string`
- **Default**: `'json'`
- **Description**: Response body type, automatically sets the corresponding `Content-Type`

```ts
export default defineMock({
  url: '/api/text',
  type: 'text',
  body: 'Plain text response'
})

export default defineMock({
  url: '/api/file',
  type: 'application.pdf', // Automatically parsed as application/pdf
  body: pdfBuffer
})
```

### body

- **Type**: `ResponseBody | (request: MockRequest) => ResponseBody | Promise<ResponseBody>`
- **Description**: Response body data

```ts
type ResponseBody = string | object | any[] | number | Buffer | Readable | null

// Static data
export default defineMock({
  url: '/api/user',
  body: { id: 1, name: 'John' }
})

// Dynamic data
export default defineMock({
  url: '/api/user/:id',
  body: ({ params }) => ({
    id: params.id,
    name: `User ${params.id}`
  })
})

// Async data
export default defineMock({
  url: '/api/async',
  body: async ({ query }) => {
    const data = await fetchExternalData(query.id)
    return data
  }
})
```

### response

- **Type**: `(req: MockRequest, res: MockResponse, next: NextFunction) => void | Promise<void>`
- **Description**: Custom response processing function

Use `response` when `body` cannot meet your needs to fully control the response process.

```ts
export default defineMock({
  url: '/api/custom',
  response: (req, res, next) => {
    // Get parsed request information
    const { query, params, body, headers } = req

    // Set response headers
    res.setHeader('Content-Type', 'application/json')
    res.setCookie('token', 'abc123', { httpOnly: true })

    // Send response
    res.statusCode = 200
    res.end(JSON.stringify({
      message: 'Custom response',
      query,
      params
    }))
  }
})
```

## Advanced Configuration

### delay

- **Type**: `number | [number, number]`
- **Default**: `0`
- **Description**: Response delay time (milliseconds)

```ts
export default defineMock({
  url: '/api/slow',
  delay: 2000 // Delay 2 seconds
})

// Random delay 1-3 seconds
export default defineMock({
  url: '/api/random-delay',
  delay: [1000, 3000]
})
```

### cookies

- **Type**: `ResponseCookies | (request: MockRequest) => ResponseCookies`
- **Description**: Set response Cookies

```ts
type CookieValue = string | [string, SetCookieOption]
type ResponseCookies = Record<string, CookieValue>

export default defineMock({
  url: '/api/login',
  cookies: {
    session: 'abc123',
    user: ['john', { path: '/', httpOnly: true }]
  }
})
```

### validator

- **Type**: `Partial<RequestOptions> | (request: MockRequest) => boolean`
- **Description**: Request validator

Used to determine which configuration to use when multiple Mock configurations have the same URL.

```ts
// Object form validation
export default defineMock([
  {
    url: '/api/search',
    validator: { query: { type: 'user' } },
    body: { users: [] }
  },
  {
    url: '/api/search',
    validator: { query: { type: 'post' } },
    body: { posts: [] }
  }
])

// Function form validation
export default defineMock([
  {
    url: '/api/data',
    validator: request => request.headers['x-role'] === 'admin',
    body: { sensitive: 'data' }
  },
  {
    url: '/api/data',
    body: { public: 'data' }
  }
])
```

### scene

- **Type**: `string | string[]`
- **Description**: Scene identifier for filtering this mock

When not configured, the mock is universal and always matches regardless of active scenario.
When configured, the mock only matches when at least one of its scenes matches one of the active scenes configured via `activeScene` option or `X-Mock-Scene` header.

```ts
export default defineMock([
  {
    url: '/api/scene',
    body: { scene: 'default' }
  },
  {
    url: '/api/scene',
    scene: 'test',
    body: { scene: 'test data' }
  },
  {
    url: '/api/scene',
    scene: ['dev', 'staging'],
    body: { scene: 'dev or staging data' }
  }
])
```

### error

- **Type**: `MockErrorConfig`
- **Description**: Error simulation configuration

```ts
interface MockErrorConfig {
  probability?: number // Error probability 0-1, default 0.5
  status?: number // Error status code, default 500
  statusText?: string // Error status text
  body?: ResponseBody // Error response body
}

export default defineMock({
  url: '/api/unstable',
  error: {
    probability: 0.3, // 30% chance of returning error
    status: 503,
    statusText: 'Service Unavailable'
  }
})
```

## Complete Example

```ts [complete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // Basic GET endpoint
  {
    url: '/api/users',
    method: 'GET',
    body: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
  },

  // POST endpoint with delay
  {
    url: '/api/users',
    method: 'POST',
    delay: 500,
    body: ({ body }) => ({
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    })
  },

  // Dynamic route
  {
    url: '/api/users/:id',
    method: 'GET',
    validator: { params: { id: /^\d+$/ } },
    body: ({ params }) => ({
      id: Number(params.id),
      name: `User ${params.id}`
    })
  },

  // Login endpoint with Cookie
  {
    url: '/api/login',
    method: 'POST',
    cookies: {
      'auth-token': ['jwt-token-here', { httpOnly: true, maxAge: 86400000 }]
    },
    body: ({ body }) => ({
      success: true,
      user: { id: 1, email: body.email }
    })
  },

  // Custom response
  {
    url: '/api/download',
    response: (req, res) => {
      res.setHeader('Content-Disposition', 'attachment; filename="data.json"')
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ data: 'content' }))
    }
  }
])
```
