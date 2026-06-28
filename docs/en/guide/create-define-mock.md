# createDefineMock(transformer)

Create a custom `defineMock` function for preprocessing Mock configurations.

## Usage

```ts [*.mock.ts]
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

## Parameters

### transformer

- **Type**: `(mock: MockHttpItem | MockWebsocketItem) => MockHttpItem | MockWebsocketItem | void`
- **Required**: Yes

Preprocessing function that receives a Mock configuration object. You can modify and return it, or return a new configuration object.

## Use Cases

1. **Unified path prefix**: Avoid repeating the same prefix in each configuration
2. **Unified response headers**: Add unified response headers to all Mocks
3. **Unified delay**: Add unified response delay to all Mocks

## More Details

See [API Reference - createDefineMock](../api/create-define-mock) for complete type definitions and more examples.
