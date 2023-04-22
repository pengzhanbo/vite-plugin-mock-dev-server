# pluginConfig

`type: MockServerPluginOptions`

``` ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: [],
      include: '',
      exclude: '',
      reload: false,
      formidableOptions: {},
      cookiesOptions: {}
    }),
  ]
})
```

``` ts
interface MockServerPluginOptions {
  /**
   * 为 mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
   * 如果 prefix 以 `^` 开头，将被识别为 `RegExp`。
   *
   * @default []
   */
  prefix?: string | string[]
  /**
   * glob 字符串匹配 mock 包含的文件
   * @see https://github.com/micromatch/picomatch#globbing-features
   * @default []
   */
  include?: string | string[]
  /**
   * glob 字符串匹配 mock 过滤的文件
   * @see https://github.com/micromatch/picomatch#globbing-features
   */
  exclude?: string | string[]

  /**
   * mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。
   * 当你希望每次修改mock文件都刷新页面时，可以打开此选项。
   *
   * @default false
   */
  reload?: boolean

  /**
   * formidable options
   * @see https://github.com/node-formidable/formidable#options
   */
  formidableOptions?: formidable.Options

  /**
   * cookies options
   * @see https://github.com/pillarjs/cookies#new-cookiesrequest-response--options
   */
  cookiesOptions?: Cookies.Option

  /**
   * 当需要构建一个小型mock服务时，可配置此项
   *
   * @default false
   */
  build?: boolean | ServerBuildOption
}
```

## prefix

为 mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
如果 prefix 以 `^` 开头，将被识别为 `RegExp`。

默认值： `[]`

## include

配置读取 mock文件，可以是一个 目录，glob，或者一个数组

默认值：
```ts
['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'] // 相对于根目录
```

## exclude

配置读取 mock文件时，需要排除的文件， 可以是一个 目录、glob、或者一个数组

默认值：
```ts
[
  '**/node_modules/**',
  '**/test/**',
  '**/cypress/**',
  'src/**',
  '**/.vscode/**',
  '**/.git/**',
  '**/dist/**'
]
```

## reload

mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。

当你希望每次修改mock文件都刷新页面时，可以打开此选项。

默认值： `false`

## formidableOptions

配置 `formidable`。 用于处理对 `content-type` 为 `multipart` 的类型。
详细配置查看 [formidable](https://github.com/node-formidable/formidable#options)

文件上传资源默认临时存放于 `os.tmpdir()` 目录。

## cookiesOptions`
  
配置 `cookies`

详细配置信息查看 [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)


## build

当需要构建一个可独立部署的mock server 时，可启用此配置。

默认为 `false`，当设置为 `true` 是，默认配置为 `{ serverPort: 8080, dist: 'mockServer' }`。

```ts
export interface ServerBuildOption {
  /**
   * 服务启动端口
   *
   * @default 8080
   */
  serverPort?: number
  /**
   * 服务应用输出目录
   *
   * @default 'mockServer'
   */
  dist?: string
}
```
