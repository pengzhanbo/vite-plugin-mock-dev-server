# 使用 mockjs库

通过 `mockjs` 库生成 mock data。

::: tip
你需要自行安装 `mockjs` 库
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
