# 请求方法

## 允许接口通过 GET/POST 

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  method: ['GET', 'POST']
})
```

## 只允许接口通过 POST

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  method: 'POST'
})
```
