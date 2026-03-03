# Troubleshooting

This section helps you solve common problems when using `vite-plugin-mock-dev-server`.

## Quick Diagnostic Checklist

When encountering issues, please check in the following order:

1. ✅ Is the plugin installed correctly?
2. ✅ Is it configured correctly in `vite.config.ts`?
3. ✅ Are Mock files in the correct directory?
4. ✅ Has the dev server been restarted?
5. ✅ Does the request path match?

## Common Issues

### Mock API Not Responding

#### Symptoms

Requesting Mock API returns 404 or no response.

#### Possible Causes and Solutions

**1. Plugin Not Loaded Correctly**

Check `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    // Make sure the plugin is added
    mockDevServerPlugin()
  ]
})
```

**2. Mock File Location Error**

By default, the plugin looks for files in the `mock` directory:

```txt
project-root/
├── mock/                 # Mock files directory
│   ├── api.mock.ts
│   └── users.mock.ts
├── src/
└── vite.config.ts
```

If using a custom directory:

```ts
mockDevServerPlugin({
  dir: 'my-mock-folder' // Ensure the directory exists
})
```

**3. File Extension Mismatch**

By default, only the following extensions are recognized:

- `.mock.js`
- `.mock.ts`
- `.mock.cjs`
- `.mock.mjs`
- `.mock.json`
- `.mock.json5`

**4. Dev Server Not Restarted**

After modifying `vite.config.ts`, you need to restart the dev server.

### Hot Reload Not Working

#### Symptoms

After modifying Mock files, data is not updated.

#### Solutions

**1. Check if File is Being Watched**

Enable debug logs to see file watching status:

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

**2. Check File Path**

Ensure the modified file is within the configured `include` range:

```ts
mockDevServerPlugin({
  include: ['**/*.mock.ts'], // Ensure your file matches this pattern
  exclude: ['**/node_modules/**', '**/*.test.mock.ts'] // Ensure it's not excluded
})
```

**3. Enable Page Reload**

If hot reload still doesn't work, enable forced refresh:

```ts
mockDevServerPlugin({
  reload: true // Refresh page after modifying Mock files
})
```

### Path Matching Failed

#### Symptoms

Request path does not match Mock configuration.

#### Debugging Methods

**1. Enable Debug Logs**

```ts
mockDevServerPlugin({
  log: 'debug'
})
```

Check console output:

```txt
[mock-dev-server] Request: GET /api/users
[mock-dev-server] Trying to match: /api/users
[mock-dev-server] Matched: /api/users
```

**2. Check Path Format**

Common mistakes:

```ts
// ❌ Error: Missing leading slash
export default defineMock({
  url: 'api/users' // Should be '/api/users'
})

// ❌ Error: Trailing slash inconsistency
// Mock configuration
url: '/api/users'
// Actual request
fetch('/api/users/') // Doesn't match!

// ✅ Correct
url: '/api/users'
fetch('/api/users') // Matches
```

**3. Check Prefix Configuration**

If using `prefix` configuration, ensure the request path starts with the prefix:

```ts
mockDevServerPlugin({
  prefix: ['/api'] // Only intercept requests starting with /api
})

// ✅ Will be intercepted
fetch('/api/users')

// ❌ Won't be intercepted
fetch('/mock/users')
```

### WebSocket Connection Failed

#### Symptoms

WebSocket connection cannot be established or disconnects immediately.

#### Solutions

**1. Check WebSocket Prefix Configuration**

```ts
mockDevServerPlugin({
  wsPrefix: ['/ws', '/socket.io'] // WebSocket path prefixes
})
```

**2. Ensure No Duplicate Configuration in Vite Proxy**

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // ❌ Error: WebSocket paths should not be configured here
      '/ws': 'http://localhost:8080'
    }
  },
  plugins: [
    mockDevServerPlugin({
      wsPrefix: ['/ws'] // Should only be configured here
    })
  ]
})
```

**3. Check WebSocket URL Format**

```js
// ✅ Correct
const socket = new WebSocket('ws://localhost:5173/ws/chat')

// ❌ Error: Using http protocol
const wrongSocket = new WebSocket('http://localhost:5173/ws/chat')
```

### Cookie Settings Not Working

#### Symptoms

Set cookies are not visible in the browser.

#### Solutions

**1. Check Cookie Configuration**

```ts
export default defineMock({
  url: '/api/login',
  cookies: {
    // ✅ Correct: Set Cookie
    session: ['abc123', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours, in milliseconds
    }]
  }
})
```

**2. Check Browser Security Restrictions**

- `Secure` flag requires HTTPS
- `SameSite=Strict` may block cross-site requests
- `HttpOnly` cookies are not visible in JavaScript

**3. Check if Cross-Origin**

If frontend and Mock service are cross-origin, configure CORS:

```ts
mockDevServerPlugin({
  cors: true // Or detailed configuration
})
```

### File Upload Failed

#### Symptoms

Uploading files returns 413 or cannot parse files.

#### Solutions

**1. Configure File Size Limit**

```ts
mockDevServerPlugin({
  formidableOptions: {
    maxFileSize: 10 * 1024 * 1024, // 10MB, default is 5MB
    maxFieldsSize: 10 * 1024 * 1024
  }
})
```

**2. Check File Save Path**

```ts
import path from 'node:path'

mockDevServerPlugin({
  formidableOptions: {
    uploadDir: path.join(process.cwd(), 'uploads'), // Ensure directory exists
    keepExtensions: true // Keep file extensions
  }
})
```

**3. Check Request Content-Type**

Ensure the request header contains the correct Content-Type:

```txt
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
```

### Request Body Parsing Failed

#### Symptoms

Cannot get request body data or data format is incorrect.

#### Solutions

**1. Check Content-Type**

```ts
// Ensure the request sends the correct Content-Type
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' // Must be set
  },
  body: JSON.stringify({ name: 'John' })
})
```

**2. Configure Request Body Size Limit**

```ts
mockDevServerPlugin({
  bodyParserOptions: {
    jsonLimit: '10mb', // JSON request body size limit
    formLimit: '10mb', // Form request body size limit
    textLimit: '10mb' // Text request body size limit
  }
})
```

**3. Check Request Body Format**

```ts
export default defineMock({
  url: '/api/users',
  method: 'POST',
  body: (request) => {
    console.log('Request body:', request.body) // For debugging
    return { received: request.body }
  }
})
```

### Conflict with Backend API

#### Symptoms

Mock API and real backend API conflict when both exist.

#### Solutions

**1. Use Different Path Prefixes**

```ts
mockDevServerPlugin({
  prefix: ['/api/mock'] // Mock API uses /api/mock prefix
})

// Mock configuration
export default defineMock({
  url: '/api/mock/users'
})

// Real API uses /api
fetch('/api/users') // Forward to backend
fetch('/api/mock/users') // Use Mock
```

**2. Configure Vite Proxy**

```ts
export default defineConfig({
  plugins: [mockDevServerPlugin({ prefix: ['/api'] })],
  server: {
    proxy: {
      // Requests not matched by Mock are forwarded to backend
      '^/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

**3. Use Environment Variables to Control**

```ts
// .env.development
VITE_USE_MOCK = true

// vite.config.ts
const useMock = process.env.VITE_USE_MOCK === 'true'

export default defineConfig({
  plugins: [
    useMock && mockDevServerPlugin()
  ].filter(Boolean)
})
```

## Debugging Tips

### Enable Detailed Logs

```ts
mockDevServerPlugin({
  log: 'debug' // 'debug' | 'info' | 'warn' | 'error' | 'silent'
})
```

### View All Loaded Mock Files

View in browser console or terminal:

```txt
[mock-dev-server] Loaded mock files:
- /project/mock/api.mock.ts
- /project/mock/users.mock.ts
```

### Check Request Details

```ts
export default defineMock({
  url: '/api/debug',
  body: request => ({
    // View complete request information
    method: request.method,
    url: request.url,
    query: request.query,
    body: request.body,
    headers: request.headers,
    cookies: request.getCookie('session')
  })
})
```

### Use Browser Developer Tools

1. **Network Panel**: View request and response details
2. **Console Panel**: View plugin log output
3. **Application Panel**: View Cookies and LocalStorage

## Getting Help

If none of the above methods solve your problem:

1. **Check Documentation**: Carefully read the relevant feature usage documentation
2. **Search Issues**: Search for similar issues in [GitHub Issues](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues)
3. **Submit Issue**: If confirmed as a bug, please submit an issue and provide:
   - Plugin version
   - Vite version
   - Node.js version
   - Minimal reproducible example
   - Error logs

## Known Limitations

1. **iframe Not Supported**: Cannot intercept requests within iframes
2. **Service Worker Conflicts**: If your project uses Service Worker, special configuration may be needed
3. **Incompatible with Some Middleware**: May conflict with some Vite plugins
