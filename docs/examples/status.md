# 自定义响应状态

## 状态码：200

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 200,
  statusText: 'OK',
})
```


## 状态码：204

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 204,
  statusText: 'No Content',
})
```

## 状态码：400

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 400,
  statusText: 'Bad Request',
})
```

## 状态码： 403

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 403,
  statusText: 'Forbidden',
})
```

## 状态码： 404

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 404,
  statusText: 'Not Found',
})
```

## 状态码： 502

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 502,
  statusText: 'Bad Gateway',
})
```
