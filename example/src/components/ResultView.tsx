import type { ScenarioResult } from '@/scenario-runner.js'
import { MockFileActions } from '@/components/MockFileActions.js'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.js'

/**
 * Format the response body for display
 *
 * 格式化响应体
 *
 * @param result - Scenario result / 场景结果
 * @returns Display text / 展示文本
 */
function formatBody(result: ScenarioResult): string {
  if (typeof result.body === 'object' && result.body != null) {
    return JSON.stringify(result.body, null, 2)
  }
  return result.text
}

/**
 * Render a scenario response
 *
 * 渲染场景响应
 *
 * @param props - Component props / 组件属性
 * @returns Result view / 结果视图
 */
export function ResultView({
  result,
  label,
}: {
  result: ScenarioResult
  label?: string
}): React.ReactNode {
  const passed = result.errors.length === 0
  const headers = Object.entries(result.headers)
  const statusVariant =
    result.status >= 400 ? 'destructive' : result.status >= 300 ? 'warning' : 'success'
  const mockFile = result.headers['x-file-path']

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {label && <Badge variant="outline">{label}</Badge>}
        <Badge variant={statusVariant}>
          {result.status} {result.statusText}
        </Badge>
        <Badge variant="secondary">{Math.round(result.duration)} ms</Badge>
        <Badge variant="outline" className="max-w-56 truncate">
          {result.contentType || 'no content-type'}
        </Badge>
        <Badge variant={passed ? 'success' : 'destructive'}>
          {passed ? 'PASS' : `FAIL · ${result.errors.length}`}
        </Badge>
      </div>

      {!passed && (
        <Alert variant="destructive">
          <AlertTitle>断言失败</AlertTitle>
          <AlertDescription>
            <ul className="flex flex-col gap-1">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {mockFile && <MockFileActions file={mockFile} />}

      <pre className="max-h-80 overflow-auto rounded-lg border border-border/70 bg-muted/35 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {formatBody(result) || '(empty body)'}
      </pre>

      <Collapsible className="rounded-lg border border-border/60 px-3 py-2">
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              size="xs"
              className="w-full justify-start px-0 font-normal text-muted-foreground"
            />
          }
        >
          Response headers ({headers.length})
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-2 max-h-60 overflow-auto font-mono text-xs leading-relaxed text-muted-foreground">
            {headers.map(([key, value]) => `${key}: ${value}`).join('\n')}
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
