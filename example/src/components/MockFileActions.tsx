import { Code2, Copy } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { Button } from '@/components/ui/button.js'
import { openInEditor } from '@/lib/editor.js'

/**
 * Decode the path from the `X-File-Path` response header
 *
 * 解码 `X-File-Path` 响应头中的路径
 *
 * @param value - Header value / 响应头值
 * @returns Decoded path / 解码后的路径
 */
function decodePath(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Mock file path with open / copy actions
 *
 * mock 文件路径与打开 / 复制操作
 *
 * @param props - Component props / 组件属性
 * @returns File actions / 文件操作
 */
export function MockFileActions({ file }: { file: string }): React.ReactNode {
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const pathname = decodePath(file)

  const open = async (): Promise<void> => {
    setError('')
    try {
      await openInEditor(pathname)
    } catch (cause) {
      setError(`无法自动打开编辑器：${(cause as Error).message}。可以复制路径后手动打开。`)
    }
  }

  const copy = async (): Promise<void> => {
    setError('')
    try {
      await navigator.clipboard.writeText(pathname)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch (cause) {
      setError(`复制失败：${(cause as Error).message}`)
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="text-xs font-medium text-muted-foreground">Mock file</p>
      <code className="block break-all font-mono text-[11px] leading-relaxed text-foreground/85">
        {pathname}
      </code>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => void open()}>
          <Code2 data-icon="inline-start" />
          Open in editor
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void copy()}>
          <Copy data-icon="inline-start" />
          {copied ? 'Copied' : 'Copy path'}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
