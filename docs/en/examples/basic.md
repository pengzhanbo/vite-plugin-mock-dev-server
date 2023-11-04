# Basic Examples

## Request Intercept

Intercept the `api/test` interface request and respond with data:

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  body: {
    name: 'Mark',
    age: 18,
  }
})
```

## Allow Request Methods

Configure the allowed request methods for the current interface

<<< @/../example/mock/allow-method.mock.ts

## Response Status

Configure the response status code and response status text for the current interface.

Generally, it is only necessary to explicitly specify the status code, and the plugin will internally set the corresponding status text based on the status code.

<<< @/../example/mock/fail.mock.ts

## Enable/Disable Mock

Configure to enable or disable a specific mock request.

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  enabled: false
})
```

After setting `enabled` to `false`, the `/api/text` requests will no longer go through the `mock-server`, but will be forwarded by the original `server.proxy` configuration.

## Dynamic Path Matching

<<< @/../example/mock/dynamic-match-url.mock.ts

## Response Delay

<<< @/../example/mock/delay.mock.ts
