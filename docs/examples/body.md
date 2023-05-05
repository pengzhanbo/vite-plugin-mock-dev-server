# 自定义响应体

返回自定义的响应体内容

## 数据类型

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: 'message',
})
```

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: ['apple', 'banana'],
})
```

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

```ts
import { Buffer } from 'node:buffer'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: Buffer.from('buffer data'),
})
```

## 函数形式

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body({ query, params, body, headers }) {
    // query 是 请求链接上的 queryString, 并经过了解析为对象
    // params 请求链接中 动态匹配参数
    // body  POST 请求体
    // headers 请求头
    return {
      code: 0,
      message: 'ok',
      result: {
        info: 'custom data',
        query
      }
    }
  }
})
```

```ts
import { createReadStream } from 'node:fs'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body() {
    return createReadStream('./my-app.dmg')
  }
})
```
