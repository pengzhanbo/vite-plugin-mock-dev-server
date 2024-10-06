# createSSEStream(req, res)

Create a `Server-sent events` write stream to support mocking `EventSource`.

## Usage

::: code-group

``` ts [*.mock.ts]
import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/sse',
  response: (req, res) => {
    const sse = createSSEStream(req, res) // [!code hl:3]
    sse.write({ event: 'message', data: { message: 'hello world' } })
    sse.end()
  }
})
```

:::
