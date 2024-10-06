# EventSource

EventSource 是一种基于事件的服务器发送事件协议，允许网页或应用程序创建一个实时通过连接发送的事件流。

::: code-group
<<< @/../example/mock/sse.mock.ts

:::

::: code-group

```ts [app.ts]
const es = new EventSource('/api/sse')
es.addEventListener('count', (e) => {
  console.log(e.data)
})
es.addEventListener('close', () => {
  es.close()

  console.log('close')
})
```

:::
