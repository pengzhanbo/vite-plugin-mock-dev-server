# createSSEStream(req, res)

创建一个 `Server-sent events` 写入流，用于支持模拟 `EventSource`。

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
