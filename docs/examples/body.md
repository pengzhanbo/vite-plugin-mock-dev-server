# 自定义响应体

返回自定义的响应体内容

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {
    code: 0,
    message: 'ok',
    result: 'custom data'
  }
})
```
