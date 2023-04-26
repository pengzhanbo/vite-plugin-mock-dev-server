# 类型格式

## Commonjs

使用 Commonjs 格式编写 mock 配置文件

::: code-group
<<< @/../example/mock/file-extension/api.mock.cjs{js}[api.mock.cjs]
:::

## ESModule

使用 ESModule 编写 mock 文件

::: code-group
<<< @/../example/mock/file-extension/api.mock.js
<<< @/../example/mock/file-extension/api.mock.ts
:::

::: code-group
``` js [api.mock.mjs]
/**
 * @type {import('vite-plugin-mock-dev-server').MockOptions}
 */
export default [
  {
    url: 'api/post/1',
    body: {}
  },
  {
    url: 'api/post/2',
    body: {}
  }
]
```
```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: 'api/post/1',
    body: {}
  },
  {
    url: 'api/post/2',
    body: {}
  }
])
```
:::

## JSON

使用 JSON/JSON5 编写 mock 文件

::: code-group
<<< @/../example/mock/file-extension/api.mock.json
:::
::: code-group
<<< @/../example/mock/file-extension/api.mock.json5
:::
