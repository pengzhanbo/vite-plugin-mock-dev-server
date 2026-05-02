# MockServerPluginOptions

Plugin configuration options interface, used to configure the behavior of Mock Dev Server.

## Interface Definition

```ts
interface MockServerPluginOptions {
  enabled?: boolean
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
  activeScene?: string | string[]
}
```

## Property Details

### enabled

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to enable Mock server, if set to `false`, the plugin will not work.

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

### activeScene

- **Type**: `string | string[]`
- **Default**: `[]`
- **Description**: Active scene(s) for filtering mocks

Only mocks whose `scene` intersects with this value (or have no `scene` configured) will be considered for matching.
Can be overridden per-request via the `X-Mock-Scene` request header.

```ts
mockDevServerPlugin({
  activeScene: 'test' // Only activate mocks with scene: 'test'
})

mockDevServerPlugin({
  activeScene: ['dev', 'test'] // Activate mocks matching 'dev' or 'test'
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

### record

- **Type**: `boolean | RecordOptions`
- **Default**: `false`
- **Description**: Request recording and playback configuration

When enabled, the plugin automatically records request responses forwarded through the Proxy and plays back the recorded data when Mock data is unavailable.

```ts
interface RecordOptions {
  /**
   * Whether to enable the record feature
   * - true: Enable, automatically record proxy responses
   * - false: Disable (default)
   * @default false
   */
  enabled?: boolean

  /**
   * Filter requests to record
   * - Function: Custom filter function, return true to record
   * - Object: Include/exclude patterns with glob or path-to-regexp mode
   * @example
   * ```ts
   * // Record all requests
   * filter: (req) => true
   * // Record requests using glob pattern
   * filter: { mode: 'glob', include: '/api/**' }
   * // Record requests using path-to-regexp pattern
   * filter: { mode: 'path-to-regexp', include: '/api/:id' }
   * ```
   */
  filter?: ((req: RecordedReq) => boolean) | {
    /**
     * Include the request links that need to be recorded
     *
     * String: Glob pattern or path-to-regexp pattern
     * (Use the mode option to set the mode, default is glob)
     */
    include?: string | string[]
    /**
     * Exclude request links that do not need to be recorded
     *
     * String: Glob pattern or path-to-regexp pattern
     * (Use the mode option to set the mode, default is glob)
     */
    exclude?: string | string[]
    /**
     * Matching mode for include/exclude patterns
     * - 'glob': Glob pattern matching (default)
     * - 'path-to-regexp': Path-to-regexp pattern matching
     */
    mode: 'glob' | 'path-to-regexp'
  }

  /**
   * Directory to store recorded data
   * Relative to project root
   *
   * @default 'mock/.recordings'
   */
  dir?: string

  /**
   * Whether to overwrite existing recorded data
   * - true: Overwrite old data for the same request (default)
   * - false: Keep old data, do not record new data
   *
   * @default true
   */
  overwrite?: boolean

  /**
   * Expiration time for recorded data in seconds
   * - 0: Never expire (default)
   * - Positive number: Expire after specified seconds
   *
   * @default 0
   */
  expires?: number

  /**
   * Status codes to record
   * - Empty array: Record all status codes (default)
   * - Specify one or more status codes to filter
   *
   * @default []
   */
  status?: number | number[]

  /**
   * Should a .gitignore be added to the recording directory
   * - true: Add (default)
   * - false: Do not add
   *
   * @default true
   */
  gitignore?: boolean
}
```

```ts
// Abbreviation form: One-click activation
mockDevServerPlugin({
  record: true
})

// Full configuration
mockDevServerPlugin({
  record: {
    enabled: true,
    dir: 'mock/.recordings',
    overwrite: true,
    expires: 0,
    status: [],
    gitignore: true
  }
})
```

replay

- **Type**: `boolean`
- **Default**: `false` (defaults to `true` when recording is enabled)
- **Description**: Request replay configuration

When enabled, the plugin will replay request responses based on recorded data when Mock data is not available.
