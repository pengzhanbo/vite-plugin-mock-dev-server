import { RefreshCw, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button.js'

/**
 * Record / replay panel
 *
 * 录制 / 回放面板
 *
 * @returns Record panel content / 录制面板内容
 */
export function RecordPanel(): React.ReactNode {
  const [token, setToken] = useState('')
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)

  const request = async (): Promise<void> => {
    setBusy(true)
    setResult('requesting…')
    setToken(String(Date.now()))
    try {
      const response = await fetch(`/api-record/demo?token=${encodeURIComponent(token)}`)
      const text = await response.text()
      const replayed = Boolean(response.headers.get('x-file-path'))
      setResult(
        [
          `${response.status} ${response.statusText} · ${replayed ? 'replayed' : 'recorded from upstream'}`,
          `x-upstream: ${response.headers.get('x-upstream') ?? '(none)'}`,
          `x-file-path: ${response.headers.get('x-file-path') ?? '(none)'}`,
          '',
          text,
        ].join('\n'),
      )
    } catch (error) {
      setResult((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        首次请求会透传到示例上游并写入 mock/.recordings；同一个 token 的后续请求由录制数据回放，
        响应头中会出现 X-File-Path。
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => void request()}>
          <Send data-icon="inline-start" />
          Request (record → replay)
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            const next = String(Date.now())
            setToken(next)
            setResult(`new token: ${next}`)
          }}
        >
          <RefreshCw data-icon="inline-start" />
          New token
        </Button>
      </div>
      {result && (
        <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-muted/35 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
          {result}
        </pre>
      )}
    </div>
  )
}
