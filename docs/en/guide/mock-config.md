# Mock Configuration

Mock configuration is used to define the mock response behavior of a single interface.

## Basic Structure

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  method: 'GET',
  body: { message: 'Hello World' }
})
```

## Configuration Overview

| Configuration | Type | Required | Default | Description |
|--------|------|------|--------|------|
| [url](../api/mock-http-item#url) | `string` | Yes | - | Request path, supports dynamic parameters |
| [method](../api/mock-http-item#method) | `Method \| Method[]` | No | `['GET','POST']` | Allowed HTTP methods |
| [enabled](../api/mock-http-item#enabled) | `boolean` | No | `true` | Whether to enable |
| [status](../api/mock-http-item#status) | `number` | No | `200` | Response status code |
| [statusText](../api/mock-http-item#statustext) | `string` | No | `'OK'` | Response status text |
| [headers](../api/mock-http-item#headers) | `Headers \| Function` | No | - | Response headers |
| [body](../api/mock-http-item#body) | `ResponseBody \| Function` | No | `{}` | Response body |
| [response](../api/mock-http-item#response) | `Function` | No | - | Custom response handling |
| [delay](../api/mock-http-item#delay) | `number \| [number, number]` | No | `0` | Response delay |
| [cookies](../api/mock-http-item#cookies) | `ResponseCookies \| Function` | No | - | Response Cookies |
| [validator](../api/mock-http-item#validator) | `Validator \| Function` | No | - | Request validator |
| [error](../api/mock-http-item#error) | `MockErrorConfig` | No | - | Error simulation configuration |

## Multiple Configurations

Multiple mock configurations can be exported in a single file:

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/users',
    method: 'GET',
    body: []
  },
  {
    url: '/api/users',
    method: 'POST',
    body: { id: 1 }
  }
])
```

## Detailed Documentation

View [API Reference - MockHttpItem](../api/mock-http-item) for complete configuration item descriptions and examples.
