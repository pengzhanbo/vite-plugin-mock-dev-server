# Format & Extension

## Commonjs

Write mock configuration file in CommonJS format

::: code-group
<<< @/../example/mock/file-extension/api.mock.cjs{js}[api.mock.cjs]
:::

## ESModule

Write mock files using ESModule

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

Write mock files using JSON/JSON5 format

::: code-group
<<< @/../example/mock/file-extension/api.mock.json
:::
::: code-group
<<< @/../example/mock/file-extension/api.mock.json5
:::
