# 使用

本节将帮助你在项目中使用此插件，如果你还未在项目中安装此插件，请先查看 [安装](/guide/install)。

## Step1: 引入插件

在你的项目的 `vite.config.{ts,js}`文件中，引入并配置插件:

::: code-group
``` ts [typescript]
import { defineConfig } from 'vite'

import mockDevServerPlugin from 'vite-plugin-mock-dev-server' // [!code focus]

export default defineConfig({
  plugins: [
    mockDevServerPlugin(), // [!code focus]
  ],
})
```
``` js [javascript]
const mockDevServerPlugin = require('vite-plugin-mock-dev-server') // [!code focus]
/**
 * @type {import('vite').defineConfig}
 */
module.exports = {
  plugins: [
    mockDevServerPlugin(), // [!code focus]
  ],
}
```
:::

## Step2: 配置 `server.proxy`

本插件会直接读取 `server.proxy` 配置的 请求路径前缀，作为请求拦截路径匹配。

因为在一般场景中，在开发环境中，我们配置的 `server.proxy` 代理转发配置，会直接转发后端服务的开发环境的地址，
在后端服务未完成接口开发但已经提供了接口文档时，我们也只需要对这部分接口进行 mock，使得前端的接口接入流程能并行开发。
因此，本插件直接读取 `server.proxy` 配置，从而减少插件需要配置的参数复杂度。

::: code-group
``` ts [typescript]
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ],
  server: { // [!code focus]
    proxy: { // [!code focus]
      '^/api': 'http://example.com/', // [!code focus]
    }, // [!code focus]
  }, // [!code focus]
})
```
``` js [javascript]
const mockDevServerPlugin = require('vite-plugin-mock-dev-server') // [!code focus]

/**
 * @type {import('vite').defineConfig}
 */
module.exports = {
  plugins: [
    mockDevServerPlugin(),
  ],
  server: { // [!code focus]
    proxy: { // [!code focus]
      '^/api': 'http://example.com/', // [!code focus]
    }, // [!code focus]
  }, // [!code focus]
}
```
:::

## Step3: 添加 `/mock` 目录

在你的项目根目录下， 添加 `/mock` 目录，`mock` 目录将用于统一保存并管理所有的 **mock配置文件**。

```sh {2}
.
├── mock
├── src
└── package.json
```

## Step4: 编写 mock配置文件

在 `/mock` 目录中，新增 `**/*.mock.{js,ts,cjs,cts,mjs,mts,json,json5}` 格式文件。

本插件通过 `fast-glob` 模块进行文件匹配，自动加载文件，并监听文件以及依赖文件，实现热更新。

同时，支持 使用 `javascript/typescript/json/json5` 等文件格式，
还支持 `ESModule/Commonjs` 模块规范编写代码。

插件会根据项目 `package.json` 的  `type` 字段值判断 项目默认使用的模块类型，并通过文件后缀格式判断模块类型。

``` json
{
  "esm": [".mjs", ".mts"],
  "cjs": [".cjs", ".cts"]
}
```
**`.js/.ts` 文件根据 `package.json` 的  `type` 字段值判断， 默认为 `cjs`。**

新增 `api.mock.ts` 文件：

```sh {3}
.
├── mock
│   └── api.mock.ts
├── src
└── package.json
```

插件提供了 [`defineMock()`](/guide/define-mock) 函数帮助编写 mock 配置。
::: code-group
```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```
:::

## Step5: 启动 Vite 开发服务

启动你的 `Vite` 开发服务，即可在项目中使用 插件了！

通过 `server.proxy` 代理的请求，被你的mock配置 命中的请求路径，都会返回 mock数据。
