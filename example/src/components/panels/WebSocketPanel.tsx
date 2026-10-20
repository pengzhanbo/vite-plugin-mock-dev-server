import { Send, Wifi, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button.js'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.js'
import { Input } from '@/components/ui/input.js'
import { LogView } from './LogView.js'
import { useLog } from './useLog.js'

/**
 * Format a websocket payload
 *
 * 格式化 websocket 消息
 *
 * @param value - Raw value / 原始值
 * @returns Display text / 展示文本
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

/**
 * WebSocket controller panel
 *
 * WebSocket 控制面板
 *
 * @returns WebSocket panel content / WebSocket 面板内容
 */
export function WebSocketPanel(): React.ReactNode {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const [url, setUrl] = useState(`${protocol}://${location.host}/socket.io?room=demo`)
  const [payload, setPayload] = useState('hello websocket')
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const { lines, append, clear } = useLog()

  const close = useCallback((): void => {
    socketRef.current?.close()
    socketRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => () => close(), [close])

  const connect = (): void => {
    close()
    const socket = new WebSocket(url)
    socketRef.current = socket
    append(`connecting ${url}`)

    socket.addEventListener('open', () => {
      setConnected(true)
      append('open')
    })
    socket.addEventListener('message', (event) => {
      append(`message ${formatValue(event.data)}`)
    })
    socket.addEventListener('close', (event) => {
      append(`close ${event.code} ${event.reason}`)
      if (socketRef.current === socket) {
        socketRef.current = null
        setConnected(false)
      }
    })
    socket.addEventListener('error', () => {
      append('error')
    })
  }

  const send = (type: 'message' | 'broadcast'): void => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return
    }
    const message = { type, payload }
    socket.send(JSON.stringify(message))
    append(`send ${JSON.stringify(message)}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="ws-url">WebSocket URL</FieldLabel>
          <Input id="ws-url" value={url} onChange={(event) => setUrl(event.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="ws-payload">Payload</FieldLabel>
          <Input
            id="ws-payload"
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={connected} onClick={connect}>
          <Wifi data-icon="inline-start" />
          Connect
        </Button>
        <Button size="sm" variant="outline" disabled={!connected} onClick={close}>
          <WifiOff data-icon="inline-start" />
          Disconnect
        </Button>
        <Button size="sm" variant="secondary" disabled={!connected} onClick={() => send('message')}>
          <Send data-icon="inline-start" />
          Send
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!connected}
          onClick={() => send('broadcast')}
        >
          <Send data-icon="inline-start" />
          Broadcast
        </Button>
      </div>

      <LogView lines={lines} onClear={clear} />
    </div>
  )
}
