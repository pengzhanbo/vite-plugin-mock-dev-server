# EventSource

EventSource is an event-based server-sent events protocol that allows a web page or application to create a stream of events that are sent over a connection in real time.

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
