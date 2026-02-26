# MockRequest

Extended HTTP request object, adding common request information parsing on top of the original Node.js `IncomingMessage`.

## Type Definition

```ts
type MockRequest = Connect.IncomingMessage & ExtraRequest

interface ExtraRequest {
  query: Record<string, any>
  refererQuery: Record<string, any>
  body: Record<string, any>
  params: Record<string, any>
  headers: Headers
  getCookie: (name: string, options?: GetCookieOption) => string | void
}
```

## Property Details

### query

- **Type**: `Record<string, any>`
- **Description**: URL query parameter object

Parses the query string after `?` in the URL into a JSON object.

```ts
// Request: /api/users?page=1&limit=10
export default defineMock({
  url: '/api/users',
  body: ({ query }) => ({
    page: query.page, // "1"
    limit: query.limit // "10"
  })
})
```

### params

- **Type**: `Record<string, any>`
- **Description**: Route parameter object

Parses parameters from dynamic routes.

```ts
// Request: /api/users/123
export default defineMock({
  url: '/api/users/:id',
  body: ({ params }) => ({
    userId: params.id // "123"
  })
})

// Multiple parameters
// Request: /api/users/123/posts/456
export default defineMock({
  url: '/api/users/:userId/posts/:postId',
  body: ({ params }) => ({
    userId: params.userId, // "123"
    postId: params.postId // "456"
  })
})
```

### body

- **Type**: `Record<string, any>`
- **Description**: Request body data

Parsed request body, supports JSON, FormData, Text, and other formats.

```ts
// POST body: { "name": "John", "email": "john@example.com" }
export default defineMock({
  url: '/api/users',
  method: 'POST',
  body: ({ body }) => ({
    id: Date.now(),
    name: body.name, // "John"
    email: body.email // "john@example.com"
  })
})
```

### headers

- **Type**: `Headers` (http.IncomingHttpHeaders)
- **Description**: Request headers object

```ts
export default defineMock({
  url: '/api/info',
  body: ({ headers }) => ({
    userAgent: headers['user-agent'],
    contentType: headers['content-type'],
    authorization: headers.authorization
  })
})
```

### refererQuery

- **Type**: `Record<string, any>`
- **Description**: Query parameters from the referrer page URL

Parses the query string from the `Referer` header, can be used to return different data based on page state.

```ts
// Page URL: http://localhost:3000/dashboard?mode=dark
// API request: /api/theme
export default defineMock({
  url: '/api/theme',
  body: ({ refererQuery }) => ({
    mode: refererQuery.mode || 'light' // "dark"
  })
})
```

## Methods

### getCookie(name, options?)

- **Parameters**:
  - `name`: Cookie name
  - `options`: Optional configuration
    - `signed`: Whether to verify signature
- **Return Value**: `string | void` - Cookie value or undefined
- **Description**: Get the Cookie value from the request

```ts
export default defineMock({
  url: '/api/profile',
  body: ({ getCookie }) => {
    const token = getCookie('auth-token')
    const sessionId = getCookie('session-id')

    if (!token) {
      return { error: 'Unauthorized' }
    }

    return { user: getUserByToken(token) }
  }
})
```

## Complete Example

```ts [request-demo.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // Comprehensive use of various request information
  {
    url: '/api/analyze-request',
    body: (request) => {
      const { query, params, body, headers, refererQuery, getCookie } = request

      return {
        // URL information
        url: {
          query,
          params,
          refererQuery
        },

        // Request body
        body,

        // Request headers
        headers: {
          contentType: headers['content-type'],
          userAgent: headers['user-agent'],
          accept: headers.accept
        },

        // Cookies
        cookies: {
          session: getCookie('session'),
          token: getCookie('token')
        },

        // Meta information
        meta: {
          timestamp: Date.now(),
          ip: headers['x-forwarded-for'] || 'unknown'
        }
      }
    }
  },

  // Return different data based on query parameters
  {
    url: '/api/search',
    body: ({ query }) => {
      const { q, category, sort = 'relevance' } = query

      // Simulate search results
      const results = [
        { id: 1, title: 'Result 1', category: 'tech' },
        { id: 2, title: 'Result 2', category: 'design' }
      ].filter(item =>
        !category || item.category === category
      )

      return {
        query: q,
        category,
        sort,
        results,
        total: results.length
      }
    }
  },

  // Authentication check
  {
    url: '/api/admin/data',
    body: ({ headers, getCookie }) => {
      const token = getCookie('admin-token')
        || headers.authorization?.replace('Bearer ', '')

      if (!token || !isValidToken(token)) {
        return {
          status: 401,
          body: { error: 'Unauthorized' }
        }
      }

      return { data: 'sensitive admin data' }
    }
  }
])
```

## Important Notes

1. **Parameter Types**: Values in `query` and `params` are string types, you need to manually convert to numbers or other types
2. **Case Sensitivity**: Keys in `headers` are lowercase
3. **Cookie Parsing**: Need to configure `cookiesOptions` to correctly parse signed Cookies
4. **Large Files**: For large file uploads, `body` may contain file streams instead of complete content
