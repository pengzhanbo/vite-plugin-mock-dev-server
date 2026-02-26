# MockServerPluginOptions

插件配置选项接口，用于配置 Mock Dev Server 的行为。

## 接口定义

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

## 属性详解

### prefix

- **类型**: `string | string[]`
- **默认值**: `[]`
- **描述**: HTTP Mock 的路径前缀匹配规则

任何请求路径以 `prefix` 开头的请求都将被拦截并尝试匹配 Mock 数据。如果 `prefix` 以 `^` 开头，将被识别为正则表达式。

```ts
// 字符串前缀
mockDevServerPlugin({
  prefix: ['/api', '/mock']
})

// 正则形式
mockDevServerPlugin({
  prefix: ['^/api/.*']
})
```

### wsPrefix

- **类型**: `string | string[]`
- **默认值**: `[]`
- **描述**: WebSocket Mock 的路径前缀匹配规则

配置 WebSocket 服务的匹配规则。任何请求路径以 `wsPrefix` 开头的 `ws/wss` 协议请求将被代理拦截。

::: warning 注意
`wsPrefix` 中的规则不应同时配置在 `viteConfig.server.proxy` 中，这会导致 WebSocket 冲突。
:::

```ts
mockDevServerPlugin({
  wsPrefix: ['/ws', '/socket.io']
})
```

### cwd

- **类型**: `string`
- **默认值**: `process.cwd()`
- **描述**: 配置 `include` 和 `exclude` 的匹配上下文路径

```ts
mockDevServerPlugin({
  cwd: path.resolve(__dirname, 'src')
})
```

### dir

- **类型**: `string`
- **默认值**: `'mock'`
- **描述**: 存储 Mock 文件的目录，相对于 `cwd`

```ts
mockDevServerPlugin({
  dir: 'mock-data' // 将读取 <cwd>/mock-data 目录
})
```

### include

- **类型**: `string | string[]`
- **默认值**: `['**/*.mock.{js,ts,cjs,mjs,json,json5}']`
- **描述**: 包含的 Mock 文件匹配模式

使用 [picomatch](https://github.com/micromatch/picomatch) 语法。

```ts
mockDevServerPlugin({
  include: [
    '**/*.mock.ts',
    '**/*.api.js'
  ]
})
```

### exclude

- **类型**: `string | string[]`
- **默认值**: `['**/node_modules/**']`
- **描述**: 排除的 Mock 文件匹配模式

```ts
mockDevServerPlugin({
  exclude: [
    '**/node_modules/**',
    '**/*.test.mock.ts'
  ]
})
```

### reload

- **类型**: `boolean`
- **默认值**: `false`
- **描述**: 热更新时是否刷新页面

默认情况下，Mock 文件修改只会更新数据内容而不刷新页面。启用此选项后，每次修改 Mock 文件都会触发页面刷新。

```ts
mockDevServerPlugin({
  reload: true
})
```

### log

- **类型**: `boolean | 'debug' | 'info' | 'warn' | 'error' | 'silent'`
- **默认值**: `'info'`
- **描述**: 日志级别配置

```ts
mockDevServerPlugin({
  log: 'debug' // 详细日志
  // log: 'silent'  // 关闭日志
})
```

### cors

- **类型**: `boolean | CorsOptions`
- **默认值**: `true`
- **描述**: CORS 配置

默认继承 Vite 的 `server.cors` 配置。详细配置见 [cors](https://github.com/expressjs/cors#configuration-options)。

```ts
mockDevServerPlugin({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
})
```

### formidableOptions

- **类型**: `formidable.Options`
- **描述**: 文件上传配置

用于处理 `multipart/form-data` 类型的请求。详细配置见 [formidable](https://github.com/node-formidable/formidable#options)。

```ts
mockDevServerPlugin({
  formidableOptions: {
    uploadDir: path.join(process.cwd(), 'uploads'),
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
})
```

### cookiesOptions

- **类型**: `CookiesOption`
- **描述**: Cookie 配置

详细配置见 [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)。

```ts
mockDevServerPlugin({
  cookiesOptions: {
    keys: ['secret-key']
  }
})
```

### bodyParserOptions

- **类型**: `BodyParserOptions`
- **描述**: 请求体解析配置

详细配置见 [co-body](https://github.com/cojs/co-body#options)。

```ts
mockDevServerPlugin({
  bodyParserOptions: {
    jsonLimit: '10mb',
    formLimit: '10mb'
  }
})
```

### build

- **类型**: `boolean | ServerBuildOption`
- **默认值**: `false`
- **描述**: 构建独立 Mock 服务的配置

```ts
interface ServerBuildOption {
  serverPort?: number // 默认 8080
  dist?: string // 默认 'dist/mockServer'
  log?: LogLevel // 默认 'error'
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

- **类型**: `MockMatchPriority`
- **描述**: 路径匹配规则优先级配置

用于自定义路径匹配规则的优先级，仅对包含动态参数的规则有效。

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

## 完整配置示例

```ts [vite.config.ts]
import path from 'node:path'
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // 路径匹配
      prefix: ['/api', '/mock'],
      wsPrefix: ['/ws'],

      // 文件配置
      cwd: process.cwd(),
      dir: 'mock',
      include: ['**/*.mock.{js,ts}'],
      exclude: ['**/node_modules/**'],

      // 行为配置
      reload: false,
      log: 'info',
      cors: true,

      // 解析配置
      formidableOptions: {
        uploadDir: path.join(process.cwd(), 'uploads')
      },
      bodyParserOptions: {
        jsonLimit: '10mb'
      },

      // 构建配置
      build: {
        serverPort: 8080,
        dist: 'mockServer'
      }
    })
  ]
})
```
