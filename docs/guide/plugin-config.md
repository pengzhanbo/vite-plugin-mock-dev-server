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
  bodyParserOptions?: coBody.Options & {
    formLimit?: string | number
    jsonLimit?: string | number
    textLimit?: string | number
  }
  build?: boolean | ServerBuildOption
  priority?: MockMatchPriority
}
```

## prefix

**类型**： `string | string[]`

**默认值**： `[]`

为 mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
如果 prefix 以 `^` 开头，将被识别为 `RegExp`。

## wsPrefix

**类型**： `string | string[]`

**默认值**： `[]`

配置 webSocket 服务 匹配规则。任何请求路径以 `wsPrefix` 值开头的 `ws/wss` 协议请求，将被代理到对应的目标。
如果`wsPrefix`值以 `^` 开头,将被识别为 RegExp。

与 http mock 默认使用 `viteConfig.server.proxy` 不同的是，`websocket mock` 不会使用 `viteConfig.server.proxy` 中的 ws 相关的配置，且配置在 `wsPrefix` 中的规则，不能同时配置在 `viteConfig.server.proxy`中，因为会导致在 vite 在启动服务时产生冲突，因为不能对同一个请求实现多个的 `WebSocketServer`实例。

该冲突既不是 `vite` 的问题，也不是插件的问题，这属于合理的错误类型。在进行 `WebSocket Mock`和 `WebSocket Proxy` 切换时，请注意配置不要出现重复导致冲突。

## cwd

**类型**： `string`

**默认值**： `process.cwd()`

配置 `include` 和 `exclude` 的匹配上下文

## include

**类型**： `string | string[]`

**默认值**：
`['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}']`  相对于 [`cwd`](#cwd)

配置读取 mock文件，可以是一个 目录，glob，或者一个数组

## exclude

**类型**： `string | string[]`

**默认值**：
`['**/node_modules/**','**/test/**','**/cypress/**','src/**','**/.vscode/**','**/.git/**','**/dist/**']` 相对于 [`cwd`](#cwd)

配置读取 mock文件时，需要排除的文件， 可以是一个 目录、glob、或者一个数组

## reload

**类型**： `boolean`

**默认值**： `false`

mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。

当你希望每次修改mock文件都刷新页面时，可以打开此选项。

## log

**类型**： `boolean | 'debug' | 'info' | 'warn' | 'error' | 'silent'`

**默认值**： `info`

开启接口日志打印，或 配置日志级别。

## formidableOptions

**类型**： `formidable.Options`

**默认值**： `undefined`

配置 `formidable`。 用于处理对 `content-type` 为 `multipart` 的类型。

详细配置查看 [formidable](https://github.com/node-formidable/formidable#options)

文件上传资源默认临时存放于 `os.tmpdir()` 目录。

## cors

**类型**： `boolean | CorsOptions`

**默认值**： `true`

开启 CORS 或 配置 CORS 选项。

通常你不需要配置它，默认从 vite [`server.cors`](https://cn.vitejs.dev/config/server-options.html#server-cors) 继承配置。

## cookiesOptions

**类型**： `Cookies.Option`

**默认值**： `undefined`

配置 `cookies`

详细配置信息查看 [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)

## bodyParserOptions

**类型**： `coBody.Options & { formLimit?: string | number, jsonLimit?: string | number, textLimit?: string | number }`

**默认值**： `undefined`

配置 `co-body`

详细配置信息查看 [co-body](https://github.com/cojs/co-body#options)

## build

**类型**： `boolean | ServerBuildOption`

**默认值**： `false`

当需要构建一个可独立部署的mock server 时，可启用此配置。

当设置为 `true` 是，默认配置为 `{ serverPort: 8080, dist: 'mockServer' }`。

```ts
export interface ServerBuildOption {
  /**
   * 服务启动端口
   * @default 8080
   */
  serverPort?: number
  /**
   * 服务应用输出目录
   * @default 'mockServer'
   */
  dist?: string

  /**
   * 服务应用日志级别
   * @default 'error'
   */
  log?: LogLevel
}
```

## priority

**类型**： `MockMatchPriority`

**默认值：** `undefined`

自定义 路径匹配规则优先级。

```ts
interface MockMatchPriority {
  /**
   * 匹配规则优先级, 全局生效。
   * 声明在该选项中的规则将优先于默认规则生效。
   * 规则在数组越靠前的位置，优先级越高。
   *
   * 不要在此选项中声明通用性的规则，比如 `/api/(.*)`，这将导致后续的规则无法生效。
   * 除非你明确知道规则的优先级，否则大多数情况下都不需要配置该选项。
   * @default []
   */
  global?: string[]
  /**
   * 对于一些特殊情况，需要调整部分规则的优先级，可以使用此选项。
   * 比如一个请求同时命中了规则 A 和 B，且 A 比 B 优先级高， 但期望规则 B 生效时。
   */
  special?: MockMatchSpecialPriority
}

interface MockMatchSpecialPriority {
  /**
   * 当 A 与 B或 C 同时满足匹配，且 B或 C在排序首位时，将A插入到首位。
   * when 选项用于进一步约束该优先级调整仅针对哪些请求有效。
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
