# 简单例子：

拦截 `api/test` 接口，并相应空数据：

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
})
```
