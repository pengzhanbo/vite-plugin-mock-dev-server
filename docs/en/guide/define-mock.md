# defineMock(mockConfig)

Mock configuration type helper function

## Usage

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

Pass in an array:

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/test',
    body: {},
  },
  {
    url: '/api/test2',
    body: {}
  }
])
```

## `mockConfig`

`type: MockOptionsItem | MockOptionsItem[]`

See [mock-config](/en/guide/mock-config)
