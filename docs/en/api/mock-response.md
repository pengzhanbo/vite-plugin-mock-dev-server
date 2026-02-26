# MockResponse

Extended HTTP response object, adding convenient methods on top of the original Node.js `ServerResponse`.

## Type Definition

```ts
type MockResponse = http.ServerResponse<http.IncomingMessage> & {
  setCookie: (
    name: string,
    value?: string | null,
    options?: SetCookieOption
  ) => void
}
```

## Method Details

### setCookie(name, value?, options?)

Set response Cookie.

- **Parameters**:
  - `name`: Cookie name (required)
  - `value`: Cookie value, set to `null` to delete Cookie
  - `options`: Cookie options
    - `maxAge`: Validity period (milliseconds)
    - `expires`: Expiration date (Date object)
    - `path`: Path
    - `domain`: Domain
    - `secure`: HTTPS only
    - `httpOnly`: Disable JavaScript access
    - `sameSite`: SameSite policy ('strict' | 'lax' | 'none')
    - `signed`: Whether to sign
    - `overwrite`: Whether to overwrite Cookies with the same name

- **Return Value**: `void`

## Basic Usage

### Using the response method

```ts
export default defineMock({
  url: '/api/custom',
  response: (req, res, next) => {
    // Set status code
    res.statusCode = 200

    // Set response headers
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-Custom-Header', 'value')

    // Set Cookie
    res.setCookie('session', 'abc123', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    // Send response
    res.end(JSON.stringify({ success: true }))
  }
})
```

### Working with body

Although the `body` configuration is more concise, sometimes `response` is needed to implement complex logic:

```ts
export default defineMock([
  // Simple response - use body
  {
    url: '/api/simple',
    body: { message: 'Hello' }
  },

  // Complex response - use response
  {
    url: '/api/complex',
    response: (req, res) => {
      // Conditional judgment
      if (!req.headers.authorization) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Bearer')
        res.end(JSON.stringify({ error: 'Unauthorized' }))
        return
      }

      // Set multiple Cookies
      res.setCookie('user', 'john', { path: '/' })
      res.setCookie('session', 'xyz', { httpOnly: true })

      // Stream response
      res.setHeader('Content-Type', 'text/plain')
      res.write('Line 1\n')
      res.write('Line 2\n')
      res.end('Line 3')
    }
  }
])
```

## Cookie Operation Examples

### Setting Cookies

```ts
export default defineMock({
  url: '/api/login',
  method: 'POST',
  response: (req, res) => {
    // Basic Cookie
    res.setCookie('username', 'john')

    // Cookie with options
    res.setCookie('session', generateSessionId(), {
      httpOnly: true, // Disable JS access
      secure: true, // HTTPS only
      sameSite: 'strict', // SameSite policy
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Signed Cookie (requires keys configuration)
    res.setCookie('user-id', '12345', {
      signed: true
    })

    res.end(JSON.stringify({ success: true }))
  }
})
```

### Deleting Cookies

```ts
export default defineMock({
  url: '/api/logout',
  method: 'POST',
  response: (req, res) => {
    // Delete Cookie by setting null value
    res.setCookie('session', null)
    res.setCookie('user-id', null)

    res.end(JSON.stringify({ message: 'Logged out' }))
  }
})
```

### Updating Cookies

```ts
export default defineMock({
  url: '/api/refresh',
  method: 'POST',
  response: (req, res) => {
    // Extend session validity
    res.setCookie('session', generateNewSession(), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      overwrite: true // Overwrite Cookie with the same name
    })

    res.end(JSON.stringify({ refreshed: true }))
  }
})
```

## Advanced Response Examples

### File Download

```ts
import { createReadStream } from 'node:fs'
import path from 'node:path'

export default defineMock({
  url: '/api/download/:filename',
  response: (req, res) => {
    const { params } = req
    const filePath = path.join(process.cwd(), 'files', params.filename)

    // Set download headers
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${params.filename}"`
    )

    // Stream file
    const stream = createReadStream(filePath)
    stream.pipe(res)
  }
})
```

### Redirect

```ts
export default defineMock({
  url: '/api/redirect',
  response: (req, res) => {
    res.statusCode = 302
    res.setHeader('Location', '/api/new-endpoint')
    res.end()
  }
})
```

### Chunked Transfer

```ts
export default defineMock({
  url: '/api/stream',
  response: (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Transfer-Encoding', 'chunked')

    let count = 0
    const interval = setInterval(() => {
      count++
      res.write(`Chunk ${count}\n`)

      if (count >= 5) {
        clearInterval(interval)
        res.end()
      }
    }, 1000)

    req.on('close', () => {
      clearInterval(interval)
    })
  }
})
```

### Conditional Response

```ts
export default defineMock({
  url: '/api/conditional',
  response: (req, res, next) => {
    const acceptHeader = req.headers.accept || ''

    // Return different formats based on Accept header
    if (acceptHeader.includes('application/xml')) {
      res.setHeader('Content-Type', 'application/xml')
      res.end('<root><message>Hello</message></root>')
      return
    }

    if (acceptHeader.includes('text/plain')) {
      res.setHeader('Content-Type', 'text/plain')
      res.end('Hello')
      return
    }

    // Default JSON
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Hello' }))
  }
})
```

## Important Notes

1. **Call Order**: Must set headers before calling `res.end()`
2. **Cookie Encoding**: Cookie values are automatically URL encoded
3. **Duplicate Setting**: Calling `setCookie` multiple times with the same name adds multiple Cookies, use `overwrite: true` to overwrite
4. **Signature Verification**: Signed Cookies require `cookiesOptions.keys` to be set in the plugin configuration first
5. **Stream Handling**: When using streaming responses, pay attention to handling client disconnections
