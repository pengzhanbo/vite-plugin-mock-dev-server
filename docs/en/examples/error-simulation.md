# Error Simulation

The plugin supports error simulation, which allows you to configure error probability and error types for mock requests.

## Basic Usage

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation',
  method: 'GET',
  body: { success: true, message: 'Request successful' },
  error: {
    probability: 0.5, // 50% probability of error
    status: 500,
  }
})
```

## Configuration Options

### `error`

- **Type**: `MockErrorConfig`
- **Description**: Configure error simulation

#### `MockErrorConfig`

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `probability` | `number` | `0.5` | Error probability (0-1) |
| `status` | `number` | `500` | Error status code |
| `statusText` | `string` | - | Error status text |
| `body` | `ResponseBody \| ResponseBodyFn` | - | Custom error response body, suitable for when the status is 200, but the response body needs to simulate an error scenario |

## Examples

### Different Error Types

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/error-simulation/404',
    method: 'GET',
    body: { success: true, message: 'Request successful' },
    error: {
      probability: 0.7,
      status: 404,
    }
  },
  {
    url: '/api/error-simulation/text',
    method: 'GET',
    body: 'Request successful',
    type: 'text',
    error: {
      probability: 0.5,
      status: 500,
    }
  }
])
```

### Custom Error Response Body

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation/custom-body',
  method: 'GET',
  body: { code: 200, msg: 'Success', result: { data: 'some data' } },
  error: {
    probability: 0.5,
    status: 200, // Network request successful
    body: { code: 500, msg: 'Internal error', result: null } // But returns error data structure
  }
})
```

### Empty Result Simulation

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation/empty-result',
  method: 'GET',
  body: { code: 200, msg: 'Success', result: { data: 'some data' } },
  error: {
    probability: 0.5,
    status: 200,
    body: { code: 200, msg: 'Success', result: {} } // Success status but empty result
  }
})
```

### Dynamic Error Response

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/error-simulation/dynamic-body',
  method: 'GET',
  body: { code: 200, msg: 'Success', result: { data: 'some data' } },
  error: {
    probability: 0.5,
    status: 200,
    body: (request) => {
      // Dynamically generate error response based on request parameters
      return {
        code: 500,
        msg: `Error for request: ${request.query.id || 'unknown'}`,
        result: null
      }
    }
  }
})
```

## Why Use Error Simulation?

Error simulation is useful in the following scenarios:

- **Testing Error Handling**: Verify that your application correctly handles error responses from the server.
- **Simulating Network Issues**: Test how your application behaves when the server is unavailable or responds with errors.
- **Enhancing Test Coverage**: Increase the coverage of your tests by simulating a variety of error scenarios.
- **Retry Mechanisms**: Test how your application handles retries when errors occur.
- **Probability Control**: Use the `probability` option to control the likelihood of errors occurring, allowing for more realistic testing scenarios.
