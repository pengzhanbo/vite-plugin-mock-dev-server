# 简单例子

拦截 `api/test` 接口，并响应空数据：

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
})
```
****

拦截 `get` 接口，并匹配比较接口请求链接中是否带有特定的 `query` 参数

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

// 仅匹配 地址中带有 `a=1`的请求。如 `/api/test?a=1`, `/api/test?a=1&b=2`
export default defineMock({
  url: '/api/test?a=1', // 实际上 `?a=1` 将会被解析合并到 `validator.query` 中
  method: 'GET',
  
})
```

也可以使用 `validator` 参数实现：
```ts
import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock({
  url: '/api/test',
  method: 'GET',
  validator: {
    query: { a: '1' }
  }
})
```
****
