import type { MockRequest } from 'vite-plugin-mock-dev-server'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/socket.io',
  ws: true,
  setup(wss) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    wss.on('connection', (ws, req: MockRequest) => {
      // req.query
      // req.params
      // req.getCookie
      ws.on('message', (raw) => {
        const message = JSON.parse(String(raw))

        // eslint-disable-next-line no-console
        console.log(message)
      })
      ws.send(JSON.stringify({ type: 'connected123' }))
    })
  },
})
