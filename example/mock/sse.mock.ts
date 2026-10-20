import { createSSEStream, defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Server-sent events through `createSSEStream`.
 *
 * Messages include a comment, `id`, `retry`, named events and a final `close`
 * event, so the browser `EventSource` demo can show every field.
 *
 * 通过 `createSSEStream` 输出 Server-sent events。
 *
 * 消息中包含 comment、`id`、`retry`、具名事件以及最终的 `close` 事件，
 * 浏览器端的 `EventSource` 演示可以展示全部字段。
 */
export default defineMock({
  url: '/api/sse',
  response(req, res) {
    const sse = createSSEStream(req, res)
    // `interval` / `count` 仅用于按需加速或延长流，UI 使用默认值即可。
    // `interval` / `count` let callers speed up or extend the stream; the UI uses
    // the defaults.
    const interval = Math.max(10, Number(req.query.interval) || 250)
    const total = Math.max(1, Math.min(20, Number(req.query.count) || 5))
    let count = 0

    sse.write({ comment: 'connected' })
    sse.write({ event: 'ready', data: { message: 'stream started' }, retry: 3000 })

    const timer = setInterval(() => {
      count += 1
      sse.write({
        id: String(count),
        event: 'count',
        data: { count, at: Date.now() },
      })

      if (count >= total) {
        sse.write({ event: 'close', data: { count } })
        sse.end()
        clearInterval(timer)
      }
    }, interval)

    // Node 16+ 的 `req.close` 在请求完成时就会触发（GET 请求几乎是立即），
    // 不能用来判断客户端是否断开；`res.close` 才代表响应结束或连接被关闭。
    // Since Node 16, `req.close` fires when the request completes (almost
    // immediately for a GET), so it cannot detect a client disconnect. `res.close`
    // fires when the response ends or the connection is closed.
    res.on('close', () => {
      clearInterval(timer)
    })
  },
})
