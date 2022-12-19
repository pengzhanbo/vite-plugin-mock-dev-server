# 延迟响应

接口请求延迟 4秒 后返回相应数据

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  delay: 4000,
  body: {
    message: 'delay 4s'
  }
})
```
