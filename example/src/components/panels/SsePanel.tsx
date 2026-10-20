import { Play, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button.js'
import { LogView } from './LogView.js'
import { useLog } from './useLog.js'

/**
 * SSE controller panel
 *
 * SSE 控制面板
 *
 * @returns SSE panel content / SSE 面板内容
 */
export function SsePanel(): React.ReactNode {
  const [connected, setConnected] = useState(false)
  const sourceRef = useRef<EventSource | null>(null)
  const { lines, append, clear } = useLog()

  const close = useCallback((): void => {
    sourceRef.current?.close()
    sourceRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => () => close(), [close])

  const start = (): void => {
    close()
    const source = new EventSource('/api/sse')
    sourceRef.current = source
    setConnected(true)
    append('EventSource connected')

    source.addEventListener('ready', (event) => {
      append(`event: ready ${event.data}`)
    })
    source.addEventListener('count', (event) => {
      append(`event: count ${event.data}`)
    })
    source.addEventListener('close', (event) => {
      append(`event: close ${event.data}`)
      if (sourceRef.current === source) {
        close()
      }
    })
    source.onmessage = (event) => {
      append(`message: ${event.data}`)
    }
    source.onerror = () => {
      if (sourceRef.current !== source) {
        return
      }
      append('EventSource error / closed')
      close()
    }
  }

  const stop = (): void => {
    append('EventSource closed by client')
    close()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={connected} onClick={start}>
          <Play data-icon="inline-start" />
          Start stream
        </Button>
        <Button size="sm" variant="outline" disabled={!connected} onClick={stop}>
          <Square data-icon="inline-start" />
          Stop
        </Button>
      </div>
      <LogView lines={lines} onClear={clear} />
    </div>
  )
}
