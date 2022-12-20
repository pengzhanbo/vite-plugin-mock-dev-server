# 开启/关闭Mock

针对某一个 mock 请求配置，关闭使其被忽略。

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  enable: false
})
```

`enable` 设置为 `false` 后， 发起的 `/api/text` 请求不再经过 `mock-server`，而是经过原来的
`server.proxy` 配置的代理转发。
