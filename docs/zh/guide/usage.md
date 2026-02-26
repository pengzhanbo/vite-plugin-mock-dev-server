# 使用

## Step1: 安装插件

<div class="tip custom-block" style="padding-top: 8px">

推荐使用 [pnpm](https://pnpm.io/) 作为包管理工具

</div>

::: code-group

``` sh [pnpm]
pnpm add -D vite-plugin-mock-dev-server
```

``` sh [npm]
npm i -D vite-plugin-mock-dev-server
```

``` sh [yarn]
yarn add -D vite-plugin-mock-dev-server
```

``` sh [deno]
deno add -D vite-plugin-mock-dev-server
```

``` sh [bun]
bun add -D vite-plugin-mock-dev-server
```

:::

## Step2: 导入插件

打开项目的 `vite.config.{ts,js}` 文件，导入并配置插件：

``` ts [vite.config.{ts,js}]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server' // [!code ++]

export default defineConfig({
  plugins: [
    mockDevServerPlugin(), // [!code ++]
  ],
})
```

## Step3: 配置代理规则

插件会自动读取 `vite.config.js` 中 `server.proxy` 配置项的路径前缀，将其作为请求拦截的匹配条件。
这种设计源于常见的开发场景：

通常我们在开发环境中配置代理，将请求转发到后端服务地址。
但当后端接口尚未完成而文档已提供时，我们可以仅针对这部分接口进行 mock，实现前后端并行开发。
插件直接复用 `server.proxy` 配置，省去了额外的参数配置，简化了流程：

``` ts [vite.config.{ts,js}]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ],
  // [!code ++:5]
  server: {
    proxy: {
      '^/api': 'http://example.com/'
    },
  },
})
```

## Step4: 添加 `mock` 目录

在你的项目根目录下， 添加 `/mock` 目录，`mock` 目录将用于统一保存并管理所有的 **mock配置文件**。

```sh
.
├── mock  # [!code ++]
├── src
└── package.json
```

## Step5: 编写 mock配置文件

在 `mock` 目录下创建 `**/*.mock.{js,ts,cjs,cts,mjs,mts,json,json5}` 格式的文件。插件会自动完成以下工作：

- 使用 tinyglobby 进行文件匹配和自动加载
- 监听文件及其依赖变化，实现热更新
- 支持 JavaScript/TypeScript/JSON/JSON5 等多种文件格式
- 兼容 ESModule 和 CommonJS 模块规范

插件会根据 `package.json` 的 `type` 字段判断项目默认模块类型，并通过文件后缀确定具体模块格式：

``` json
{
  "esm": [".mjs", ".mts"],
  "cjs": [".cjs", ".cts"],
  "json": [".json", ".json5"]
}
```

::: warning
`.js/.ts` 文件默认为 cjs（CommonJS）格式，除非 `package.json` 的 `type` 字段指定为 `"module"`。
:::

现在，让我们创建一个 mock 配置文件：

```sh {3}
.
├── mock
│   └── api.mock.ts # mock配置文件  # [!code ++]
├── src
└── package.json
```

使用插件提供的 [`defineMock()`](./define-mock) 辅助函数编写配置：

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

## Step6: 启动 Vite 开发服务

完成上述配置后，启动 Vite 开发服务即可使用插件。所有满足以下条件的请求都将返回 mock 数据：

- 请求路径匹配 `server.proxy` 中配置的代理前缀
- 请求路径与某个 mock 配置的 `url` 规则匹配
