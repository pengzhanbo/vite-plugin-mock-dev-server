# pluginConfig

`type: MockServerPluginOptions`

``` ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: [],
      wsPrefix: [],
      include: ['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'],
      exclude: '',
      log: 'info',
      reload: false,
      cors: true,
      formidableOptions: undefined,
      cookiesOptions: undefined,
      bodyParserOptions: undefined,
      priority: undefined
    }),
  ]
})
```

**Type:**

``` ts
interface MockServerPluginOptions {
  prefix?: string | string[]
  wsPrefix?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  reload?: boolean
  log?: boolean | 'debug' | 'info' | 'warn' | 'error' | 'silent'
  cors?: boolean | CorsOptions
  formidableOptions?: formidable.Options
  cookiesOptions?: Cookies.Option
  build?: boolean | ServerBuildOption
  priority?: MockMatchPriority
}
```

## prefix

**Type**： `string | string[]`

**Default**： `[]`

Configure the path matching rules for the mock service, where any request path starting with `prefix` will be intercepted and proxied.

If `prefix` starts with `^`, it will be recognized as a `RegExp`.

## wsPrefix

**Type**： `string | string[]`

**Default**： `[]`

Configure the matching rules for the WebSocket service. Any request path starting with the value of `wsPrefix` for `ws/wss` protocol requests will be proxied to the corresponding target.
If the value of `wsPrefix` starts with `^`, it will be recognized as a RegExp.

Unlike the default behavior of using `viteConfig.server.proxy` for HTTP mocks, WebSocket mocks do not use the ws-related configuration in `viteConfig.server.proxy`. Additionally, the rules configured in `wsPrefix` cannot be simultaneously configured in `viteConfig.server.proxy` because it would cause conflicts during the startup of the Vite server. This is because multiple `WebSocketServer` instances cannot handle the same request.

This conflict is not a problem with Vite or the plugin itself; it is a reasonable type of error. When switching between WebSocket Mock and WebSocket Proxy, please ensure that the configuration does not contain duplicates that could cause conflicts.

## cwd

**Type**： `string`

**Default**： `process.cwd()`

Configure the matching context for `include` and `exclude`.

## include

**Type**： `string | string[]`

**Default**：
`['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']`  relative to [`cwd`](#cwd)

Configure the reading of mock files, which can be a directory, a glob pattern, or an array.

## exclude

**Type**： `string | string[]`

**Default**：
`['**/node_modules/**','**/test/**','**/cypress/**','src/**','**/.vscode/**','**/.git/**','**/dist/**']` relative to [`cwd`](#cwd)

Specifies the files to be excluded when reading mock files. It can be a directory, glob pattern, or an array.

## reload

**Type**： `boolean`

**Default**： `false`

When mock resources are hot updated, only the data content is updated, but the page is not refreshed by default.

If you want to refresh the page every time the mock file is modified, you can enable this option.

## log

**Type**： `boolean | 'debug' | 'info' | 'warn' | 'error' | 'silent'`

**Default**： `info`

Enable interface logging or configure log level.

## formidableOptions

**Type**： `formidable.Options`

**Default**： `undefined`

Configure `formidable` to handle `multipart` content-type.

For detailed configuration, refer to [formidable](https://github.com/node-formidable/formidable#options).

Uploaded files are temporarily stored in the `os.tmpdir()` directory by default.

## cors

**Type**： `boolean | CorsOptions`

**Default**： `true`

Enable CORS or configure CORS options.

Usually, you don't need to configure it, as it inherits the configuration from Vite's [`server.cors`](https://vitejs.dev/config/server-options.html#server-cors) by default.

## cookiesOptions

**Type**： `Cookies.Option`

**Default**： `undefined`

Configure `cookies`

For detailed configuration, refer to [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options).

## bodyParserOptions

**Type**： `coBody.Options & { formLimit?: string | number, jsonLimit?: string | number, textLimit?: string | number }`

**Default**： `undefined`

Configure `co-body`

For detailed configuration, refer to [co-body](https://github.com/cojs/co-body#options).

## build

**Type**： `boolean | ServerBuildOption`

**Default**： `false`

When you need to build a mock server that can be deployed independently, you can enable this configuration.

When set to `true`, the default configuration is `{ serverPort: 8080, dist: 'mockServer' }`.

```ts
export interface ServerBuildOption {
  /**
   * Service startup port
   * @default 8080
   */
  serverPort?: number
  /**
   * Service application output directory
   * @default 'mockServer'
   */
  dist?: string

  /**
   * Service application log level
   * @default 'error'
   */
  log?: LogLevel
}
```

## priority

**Type**： `MockMatchPriority`

**Default：** `undefined`

Customize the priority of path matching rules.

```ts
interface MockMatchPriority {
  /**
   * The priority of matching rules is global.
   * The rules declared in this option will take priority over the default rules.
   * The higher the position of the rule in the array, the higher the priority.
   *
   * Do not declare general rules in this option, such as /api/(.*),
   * as it will prevent subsequent rules from taking effect.
   * Unless you are clear about the priority of the rules,
   * most of the time you do not need to configure this option.
   * @default []
   */
  global?: string[]
  /**
   * For some special cases where the priority of certain rules needs to be adjusted,
   * this option can be used. For example, when a request matches both Rule A and Rule B,
   * and Rule A has a higher priority than Rule B, but it is desired for Rule B to take effect.
   */
  special?: MockMatchSpecialPriority
}

interface MockMatchSpecialPriority {
  /**
   * When both A and B or C match, and B or C is at the top of the sort order,
   * insert A into the top position.The `when` option is used to further constrain
   * the priority adjustment to be effective only for certain requests.
   * @example
   * ```ts
   * {
   *   A: ['B', 'C'],
   *   A: { rules: ['B', 'C'], when: ['/api/a/b/c'] }
   * }
   * ```
   */
  [key: string]: string[] | { rules: string[], when: string[] }
}
```
