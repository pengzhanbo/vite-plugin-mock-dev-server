# pluginConfig

`type: MockServerPluginOptions`

``` ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      include: '',
      exclude: '',
      formidableOptions: {}
    }),
  ]
})
```

``` ts
interface MockServerPluginOptions {
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
   * formidable options
   * @see https://github.com/node-formidable/formidable#options
   */
  formidableOptions?: formidable.Options
}
```

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

## formidableOptions

配置 `formidable`。 用于处理对 `content-type` 为 `multipart` 的类型。
详细配置查看 [formidable](https://github.com/node-formidable/formidable#options)

文件上传资源默认临时存放于 `os.tmpdir()` 目录。
