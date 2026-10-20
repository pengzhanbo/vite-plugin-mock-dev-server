import { Globe, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button.js'

/**
 * Build a URL on the loopback sibling origin
 *
 * `localhost` and `127.0.0.1` are different origins, which lets the browser issue
 * a real cross-origin request against the same dev server.
 *
 * 构建回环兄弟来源的 URL。
 *
 * `localhost` 与 `127.0.0.1` 属于不同来源，浏览器因此可以向同一个开发服务器
 * 发起真实的跨域请求。
 *
 * @param path - Request path / 请求路径
 * @returns Absolute URL / 绝对地址
 */
function crossOriginUrl(path: string): string {
  const url = new URL(path, location.href)
  url.hostname = location.hostname === '127.0.0.1' ? 'localhost' : '127.0.0.1'
  return url.toString()
}

/**
 * CORS interaction panel
 *
 * CORS 交互面板
 *
 * @returns CORS panel content / CORS 面板内容
 */
export function CorsPanel(): React.ReactNode {
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)

  const request = async (method: 'GET' | 'POST'): Promise<void> => {
    setBusy(true)
    setResult('requesting…')
    try {
      const response = await fetch(crossOriginUrl('/api/enabled'), {
        method,
        headers: method === 'POST' ? { 'content-type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify({ from: 'cors-panel' }) : undefined,
      })
      const text = await response.text()
      setResult(
        [
          `${method} ${response.status} ${response.statusText}`,
          `access-control-allow-origin: ${response.headers.get('access-control-allow-origin') ?? '(none)'}`,
          `access-control-allow-credentials: ${response.headers.get('access-control-allow-credentials') ?? '(none)'}`,
          '',
          text,
        ].join('\n'),
      )
    } catch (error) {
      setResult(`Request failed: ${(error as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        localhost 与 127.0.0.1 互为跨域来源，可用于观察真实 CORS 行为。若开发服务器仅监听单一
        回环地址，跨域请求可能因无法建立连接而失败；完整断言由 e2e 用例覆盖。
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => void request('GET')}>
          <Globe data-icon="inline-start" />
          Cross-origin GET
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void request('POST')}>
          <Send data-icon="inline-start" />
          Cross-origin POST (preflight)
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
