# WebSocket

## 基础示例
<<< @/../example/mock/ws.mock.ts

## 模拟聊天室

::: code-group
```ts [ws-chat.mock.ts]
import type { MockRequest } from 'vite-plugin-mock-dev-server'
import { defineMock } from 'vite-plugin-mock-dev-server'

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
        // 将当前成员更新广播给聊天室所有人
        userList.forEach(({ id }) => userWsMap[id].send(JSON.stringify({
          type: 'userList', data: { userList }
        })))
      }
      ws.on('message', (raw) => {
        const { type, data: { userId, message } } = JSON.parse(String(raw))
        // 服务器接收用户发送到的聊天信息，将其广播给聊天室中的其他成员
        if (type === 'chat') {
          userList.forEach((user) => {
            user.id !== userId && userWsMap[user.id].send(
              JSON.stringify({ type: 'chat', data: { userId, message } })
            )
          })
        }
      })

      ws.on('close', () => {
        // 有成员退出
        const idx = userList.findIndex(({ id }) => user.id === id)
        idx !== -1 && userList.splice(idx, 1)
        userWsMap[user.id] = null
        // 将当前成员更新广播给聊天室所有人
        userList.forEach(({ id }) => userWsMap[id].send(JSON.stringify({
          type: 'userList', data: { userList }
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
const ws = new WebSocket('wx://localhost:5173/socket/chat')
ws.addEventListener('open', () => {
  store.connected = true
  // heartbeat
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'heartbeat' }))
  }, 1000)
}, { once: true })
ws.addEventListener('message', (raw) => {
  const { type, data } = JSON.parse(String(raw))
  if (type === 'userList') {
    store.userList = data.userList || []
  }
  if (type === 'chat') {
    store.chatList.push(data)
  }
})

const sendMessage = (message: string) => {
  if (store.connected) {
    ws.send(JSON.stringify({
      type: 'chat',
      data: { userId: store.currentUserId, message }
    }))
  }
}
const closeChat = () => {
  if (store.connected) ws.close()
}
```
:::
