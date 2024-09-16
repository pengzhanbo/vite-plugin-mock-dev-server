# WebSocket

## Basic Usage

<<< @/../example/mock/ws.mock.ts

## Simulated Real-time Push

::: code-group

```ts [ws-real-time-push.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/socket/push',
  ws: true,
  setup(wss, { onCleanup }) {
    wss.on('connection', (ws, req) => {
      const timer1 = setInterval(() => {
        ws.send('push message')
      }, 1000)
      onCleanup(() => clearInterval(timer1))

      const timer2 = setInterval(() => {
        ws.send('push message2')
      }, 3000)
      onCleanup(() => clearInterval(timer2))
    })
  }
})
```

:::

## Simulated Chat Room

::: code-group

```ts [ws-chat.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import type { MockRequest } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/socket/chat',
  ws: true,
  setup(wss) {
    const userList = []
    const userWsMap = {}
    wss.on('connection', (ws, req: MockRequest) => {
      const token = req.getCookie('token')
      const user = getUserByToken(token)

      userWsMap[user.id] = ws
      if (userList.findIndex(({ id }) => id === user.Id) !== -1) {
        userList.push(user)
        // Broadcast the updated member to all participants in the chat room
        userList.forEach(({ id }) => userWsMap[id].send(JSON.stringify({
          type: 'userList',
          data: { userList }
        })))
      }
      ws.on('message', (raw) => {
        const { type, data: { userId, message } } = JSON.parse(String(raw))
        // The server receives chat messages sent by users and broadcasts them to other members in the chat room
        if (type === 'chat') {
          userList.forEach((user) => {
            user.id !== userId && userWsMap[user.id].send(
              JSON.stringify({ type: 'chat', data: { userId, message } })
            )
          })
        }
      })

      ws.on('close', () => {
        // Member exited
        const idx = userList.findIndex(({ id }) => user.id === id)
        idx !== -1 && userList.splice(idx, 1)
        userWsMap[user.id] = null
        // Broadcast the updated member to all participants in the chat room
        userList.forEach(({ id }) => userWsMap[id].send(JSON.stringify({
          type: 'userList',
          data: { userList }
        })))
      })
    })
  }
})
```

:::

::: code-group

```ts [app.ts]
const store = {
  userList: [],
  chatList: [],
  connected: false,
  currentUserId: '112233'
}
const ws = new WebSocket('ws://localhost:5173/socket/chat')
ws.addEventListener('open', () => {
  store.connected = true
  // heartbeat
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'heartbeat' }))
  }, 1000)
}, { once: true })
ws.addEventListener('message', (raw) => {
  const { type, data } = JSON.parse(String(raw))
  if (type === 'userList')
    store.userList = data.userList || []

  if (type === 'chat')
    store.chatList.push(data)
})

function sendMessage(message: string) {
  if (store.connected) {
    ws.send(JSON.stringify({
      type: 'chat',
      data: { userId: store.currentUserId, message }
    }))
  }
}
function closeChat() {
  if (store.connected)
    ws.close()
}
```

:::
