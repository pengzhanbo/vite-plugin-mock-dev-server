import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button.js'

/**
 * Scrollable log output
 *
 * 可滚动日志输出
 *
 * @param props - Component props / 组件属性
 * @returns Log view / 日志视图
 */
export function LogView({
  lines,
  onClear,
}: {
  lines: string[]
  onClear: () => void
}): React.ReactNode {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          log
        </span>
        <Button variant="ghost" size="xs" onClick={onClear}>
          <Trash2 data-icon="inline-start" />
          Clear
        </Button>
      </div>
      <pre className="h-48 overflow-auto rounded-lg border border-border/70 bg-muted/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {lines.length > 0 ? lines.join('\n') : 'Waiting for events…'}
      </pre>
    </div>
  )
}
