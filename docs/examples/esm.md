# ESModule

使用 ESModule 编写 mock 文件

::: code-group
``` js
/**
 * @type {import('vite-plugin-mock-dev-server').MockOptionsItem}
 */
export default {
  url: 'api/test',
  body: {}
}
```
```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```
:::

::: code-group
``` js
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
```ts
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
