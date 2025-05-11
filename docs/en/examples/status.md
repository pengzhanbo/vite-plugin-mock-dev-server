# Custom response status

## Status Code: 200

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 200,
  statusText: 'OK',
})
```

## Status Code: 204

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 204,
  statusText: 'No Content',
})
```

## Status Code: 400

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 400,
  statusText: 'Bad Request',
})
```

## Status Code: 403

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 403,
  statusText: 'Forbidden',
})
```

## Status Code: 404

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 404,
  statusText: 'Not Found',
})
```

## Status Code: 502

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  status: 502,
  statusText: 'Bad Gateway',
})
```
