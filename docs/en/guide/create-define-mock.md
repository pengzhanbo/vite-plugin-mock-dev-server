# createDefineMock(transformer)

Pass in a transformation function to create a custom `defineMock` helper function. Implement preprocessing of mock configurations.

```ts
function createDefineMock(
  transformer: (mock: MockOptionsItem) => MockOptionsItem | void
): typeof defineMock
```

## Usage

```ts
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

const definePostMock = createDefineMock((mock) => {
  mock.url = path.join('/api/post', mock.url)
})

export default definePostMock({
  url: 'list', // The path will be concatenated as /api/post/list
  body: {
    list: []
  }
})
```
