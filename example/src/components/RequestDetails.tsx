import type { Scenario, ScenarioVariant } from '@/scenarios.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.js'

/**
 * Request details of the active scenario variant
 *
 * 当前场景变体的请求详情
 *
 * @param props - Component props / 组件属性
 * @returns Request details / 请求详情
 */
export function RequestDetails({
  scenario,
  option,
  scene,
}: {
  scenario: Scenario
  option: ScenarioVariant
  scene: string
}): React.ReactNode {
  const request = option.request
  const url = new URL(request.url, 'http://localhost')
  const query = [...url.searchParams.entries()]
  const headers = Object.entries(request.headers ?? {})
  const hasBody = request.json !== undefined || request.text !== undefined

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
      {query.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground">Query</span>
          {query.map(([key, value]) => (
            <Badge key={`${key}:${value}`} variant="secondary" className="font-mono">
              {key}={value}
            </Badge>
          ))}
        </div>
      )}

      {headers.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Headers</span>
          <div className="flex flex-col gap-0.5 font-mono text-[11px] leading-relaxed">
            {headers.map(([key, value]) => (
              <div key={key} className="break-all">
                <span className="text-muted-foreground">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasBody && (
        <Collapsible>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="xs"
                className="w-full justify-start px-0 font-normal text-muted-foreground"
              />
            }
          >
            Request body
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-1.5 max-h-40 overflow-auto rounded-md border border-border/50 bg-background/40 p-2 font-mono text-[11px] leading-relaxed">
              {request.json !== undefined ? JSON.stringify(request.json, null, 2) : request.text}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}

      {request.largeJson && (
        <Alert variant="warning">
          <AlertDescription>
            Request body: 约 70KB JSON，超过 bodyParserOptions.jsonLimit: 64kb。
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>Scene: {scene || 'auto (test)'}</span>
        <span>Mock file: 运行后通过 X-File-Path 定位</span>
      </div>

      {scenario.hint && (
        <Alert variant="warning">
          <AlertDescription className="text-[11px] leading-relaxed">
            {scenario.hint}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
