# Using the mockjs library

Generate mock data using the `mockjs` library.

::: tip
You need to manually install the `mockjs` library .
```sh
pnpm add -D mockjs
```
:::


```ts
import Mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: Mock.mock({
    'list|1-10': [{
      'id|+1': 1
    }]
  })
})
```
