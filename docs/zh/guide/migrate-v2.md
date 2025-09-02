# 从 v1.x 迁移

## 纯 ESM 支持

插件不再提供 `CommonJS` 代码导出，请使用 ESM 模式导入插件。

```ts
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server' // ✔️
```

```js
const { mockDevServerPlugin } = require('vite-plugin-mock-dev-server') // ✖️ // [!code error]
```

## Rolldown & Esbuild 支持

插件现在会根据 Vite 不同版本，自动选择不同的编译器处理 mock 文件。

对于 `vite@npm:rolldown-vite@latest` 版本，使用 `rolldown` 作为编译器。

## path-to-regexp 从 v6 升级到 v8

插件现在使用 [`path-to-regexp@v8`](https://github.com/pillarjs/path-to-regexp#readme) 作为路径匹配引擎。
请参考 [官方文档](https://github.com/pillarjs/path-to-regexp#unexpected--or-) 进行适配升级。

## 插件配置

新增 `dir` 配置项，用于配置 mock 文件的目录，相对于 `cwd`。`include` 和 `exclude` 的匹配上下文为 `cwd + dir`

::: details 为什么做出此调整？
插件使用 `chokidar` 监听 mock 文件变更，默认从 `cwd` 目录开始匹配，其查找范围对于中大型项目可能会很大，
这可能带来不必要的性能开销。因此新增 `dir` 配置项进一步缩小查找范围。
:::
