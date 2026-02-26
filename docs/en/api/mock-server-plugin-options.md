# MockServerPluginOptions

Plugin configuration options interface, used to configure the behavior of Mock Dev Server.

## Interface Definition

```ts
interface MockServerPluginOptions {
  prefix?: string | string[]
  wsPrefix?: string | string[]
  cwd?: string
  dir?: string
  include?: string | string[]
  exclude?: string | string[]
  reload?: boolean
  log?: boolean | LogLevel
  cors?: boolean | CorsOptions
  formidableOptions?: formidable.Options
  cookiesOptions?: CookiesOption
  bodyParserOptions?: BodyParserOptions
  build?: boolean | ServerBuildOption
  priority?: MockMatchPriority
}
```

## Property Details

### prefix

- **Type**: `string | string[]`
- **Default**: `[]`
- **Description**: HTTP Mock path prefix matching rules

Any request path starting with `prefix` will be intercepted and attempt to match Mock data. If `prefix` starts with `^`, it will be recognized as a regular expression.

```ts
// String prefix
mockDevServerPlugin({
  prefix: ['/api', '/mock']
})

// Regex form
mockDevServerPlugin({
  prefix: ['^/api/.*']
})
```

### wsPrefix

- **Type**: `string | string[]`
- **Default**: `[]`
- **Description**: WebSocket Mock path prefix matching rules

Configure matching rules for WebSocket services. Any `ws/wss` protocol request path starting with `wsPrefix` will be proxied and intercepted.

::: warning Note
Rules in `wsPrefix` should not be configured in `viteConfig.server.proxy` at the same time, as this will cause WebSocket conflicts.
:::

```ts
mockDevServerPlugin({
  wsPrefix: ['/ws', '/socket.io']
})
```

### cwd

- **Type**: `string`
- **Default**: `process.cwd()`
- **Description**: The context path for `include` and `exclude` matching configuration

```ts
mockDevServerPlugin({
  cwd: path.resolve(__dirname, 'src')
})
```

### dir

- **Type**: `string`
- **Default**: `'mock'`
- **Description**: The directory where Mock files are stored, relative to `cwd`

```ts
mockDevServerPlugin({
  dir: 'mock-data' // Will read <cwd>/mock-data directory
})
```

### include

- **Type**: `string | string[]`
- **Default**: `['**/*.mock.{js,ts,cjs,mjs,json,json5}']`
- **Description**: Included Mock file matching patterns

Uses [picomatch](https://github.com/micromatch/picomatch) syntax.

```ts
mockDevServerPlugin({
  include: [
    '**/*.mock.ts',
    '**/*.api.js'
  ]
})
```

### exclude

- **Type**: `string | string[]`
- **Default**: `['**/node_modules/**']`
- **Description**: Excluded Mock file matching patterns

```ts
mockDevServerPlugin({
  exclude: [
    '**/node_modules/**',
    '**/*.test.mock.ts'
  ]
})
```

### reload

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to refresh the page during hot reload

By default, Mock file modifications only update data content without refreshing the page. Enabling this option will trigger a page refresh every time a Mock file is modified.

```ts
mockDevServerPlugin({
  reload: true
})
```

### log

- **Type**: `boolean | 'debug' | 'info' | 'warn' | 'error' | 'silent'`
- **Default**: `'info'`
- **Description**: Log level configuration

```ts
mockDevServerPlugin({
  log: 'debug' // Detailed logs
  // log: 'silent'  // Disable logs
})
```

### cors

- **Type**: `boolean | CorsOptions`
- **Default**: `true`
- **Description**: CORS configuration

By default, inherits Vite's `server.cors` configuration. For detailed configuration, see [cors](https://github.com/expressjs/cors#configuration-options).

```ts
mockDevServerPlugin({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
})
```

### formidableOptions

- **Type**: `formidable.Options`
- **Description**: File upload configuration

Used to handle `multipart/form-data` type requests. For detailed configuration, see [formidable](https://github.com/node-formidable/formidable#options).

```ts
mockDevServerPlugin({
  formidableOptions: {
    uploadDir: path.join(process.cwd(), 'uploads'),
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
})
```

### cookiesOptions

- **Type**: `CookiesOption`
- **Description**: Cookie configuration

For detailed configuration, see [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options).

```ts
mockDevServerPlugin({
  cookiesOptions: {
    keys: ['secret-key']
  }
})
```

### bodyParserOptions

- **Type**: `BodyParserOptions`
- **Description**: Request body parsing configuration

For detailed configuration, see [co-body](https://github.com/cojs/co-body#options).

```ts
mockDevServerPlugin({
  bodyParserOptions: {
    jsonLimit: '10mb',
    formLimit: '10mb'
  }
})
```

### build

- **Type**: `boolean | ServerBuildOption`
- **Default**: `false`
- **Description**: Configuration for building a standalone Mock service

```ts
interface ServerBuildOption {
  serverPort?: number // Default 8080
  dist?: string // Default 'dist/mockServer'
  log?: LogLevel // Default 'error'
}
```

```ts
mockDevServerPlugin({
  build: {
    serverPort: 3000,
    dist: 'mock-server'
  }
})
```

### priority

- **Type**: `MockMatchPriority`
- **Description**: Path matching rule priority configuration

Used to customize the priority of path matching rules, only effective for rules containing dynamic parameters.

```ts
interface MockMatchPriority {
  global?: string[]
  special?: MockMatchSpecialPriority
}

mockDevServerPlugin({
  priority: {
    global: ['/api/:a/b/c', '/api/a/:b/c'],
    special: {
      '/api/:a/:b/c': {
        rules: ['/api/a/:b/:c'],
        when: ['/api/a/b/c']
      }
    }
  }
})
```

## Complete Configuration Example

```ts [vite.config.ts]
import path from 'node:path'
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // Path matching
      prefix: ['/api', '/mock'],
      wsPrefix: ['/ws'],

      // File configuration
      cwd: process.cwd(),
      dir: 'mock',
      include: ['**/*.mock.{js,ts}'],
      exclude: ['**/node_modules/**'],

      // Behavior configuration
      reload: false,
      log: 'info',
      cors: true,

      // Parsing configuration
      formidableOptions: {
        uploadDir: path.join(process.cwd(), 'uploads')
      },
      bodyParserOptions: {
        jsonLimit: '10mb'
      },

      // Build configuration
      build: {
        serverPort: 8080,
        dist: 'mockServer'
      }
    })
  ]
})
```
