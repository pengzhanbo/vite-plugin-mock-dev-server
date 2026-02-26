# defineMock(mockConfig)

`defineMock` is a type helper function used for defining mock configurations, providing complete TypeScript type hints and code completion.

## Usage

```ts [*.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

Supports passing an array to define multiple configurations:

```ts [*.mock.ts]
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

## Parameters

### mockConfig

- **Type**: `MockHttpItem | MockHttpItem[] | MockWebsocketItem | MockWebsocketItem[]`
- **Required**: Yes

Mock configuration object or configuration array.

## More Details

- View [Mock Configuration](./mock-config) for configuration item details
- View [API Reference - defineMock](../api/define-mock) for complete type definitions and more examples
