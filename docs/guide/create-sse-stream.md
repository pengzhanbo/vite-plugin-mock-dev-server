# createSSEStream(req, res)

创建一个 `Server-sent events` 写入流，用于支持模拟 `EventSource`。

## 使用

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

## Types

```ts
import type { Transform } from 'node:stream'

interface SSEStream extends Transform {
  write: (message: SSEMessage, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void) => boolean
  write: (message: SSEMessage, cb?: (error: Error | null | undefined) => void) => boolean
}

interface SSEMessage {
  data?: string | object
  comment?: string
  event?: string
  id?: string
  retry?: number
}
```
