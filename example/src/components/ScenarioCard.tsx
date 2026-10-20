import type { ScenarioResult } from '@/scenario-runner.js'
import type { Scenario, ScenarioVariant } from '@/scenarios.js'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { RequestDetails } from '@/components/RequestDetails.js'
import { ResultView } from '@/components/ResultView.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Spinner } from '@/components/ui/spinner.js'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.js'
import { getScenarioRequests } from '@/scenario-runner.js'

type MethodBadgeVariant = 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'

/**
 * Pick a badge color for an HTTP method
 *
 * 为 HTTP 方法选择徽标颜色
 *
 * @param method - HTTP method / HTTP 方法
 * @returns Badge variant / 徽标变体
 */
function methodVariant(method: string): MethodBadgeVariant {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'success'
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'destructive'
    case 'GET':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * A scenario card with one button per request variant
 *
 * 每个请求变体一个按钮的场景卡片
 *
 * @param props - Component props / 组件属性
 * @returns Scenario card / 场景卡片
 */
export function ScenarioCard({
  scenario,
  scene,
  results,
  busy,
  onRun,
}: {
  scenario: Scenario
  scene: string
  results: Record<string, ScenarioResult | string>
  busy: boolean
  onRun: (scenario: Scenario, option: ScenarioVariant) => void
}): React.ReactNode {
  const requests = getScenarioRequests(scenario)
  const [activeId, setActiveId] = useState(requests[0].id)
  const activeOption = requests.find((request) => request.id === activeId) ?? requests[0]
  const result = results[`${scenario.id}:${activeOption.id}`]
  const single = requests.length === 1
  const running = result === 'running'

  const run = (option: ScenarioVariant): void => {
    setActiveId(option.id)
    onRun(scenario, option)
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {requests.map((request) => (
            <Badge
              key={request.id}
              variant={request.id === activeOption.id ? methodVariant(request.label) : 'outline'}
            >
              {request.label}
            </Badge>
          ))}
          <span className="truncate font-mono text-xs text-muted-foreground">
            {activeOption.request.url.split('?')[0]}
          </span>
        </div>
        <CardTitle>{scenario.title}</CardTitle>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <RequestDetails scenario={scenario} option={activeOption} scene={scene} />

        <div className="flex flex-wrap items-center gap-2">
          {single ? (
            <Button
              size="sm"
              disabled={busy}
              title={`${activeOption.request.method ?? 'GET'} ${activeOption.request.url}`}
              onClick={() => run(activeOption)}
            >
              {running ? <Spinner data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {running ? 'Running…' : 'Run'}
            </Button>
          ) : (
            <ToggleGroup
              variant="outline"
              size="sm"
              disabled={busy}
              className="flex-wrap"
              value={[activeOption.id]}
              onValueChange={(value) => {
                run(requests.find((request) => request.id === value[0]) ?? activeOption)
              }}
            >
              {requests.map((option) => (
                <ToggleGroupItem
                  key={option.id}
                  value={option.id}
                  title={`${option.request.method ?? 'GET'} ${option.request.url}`}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>

        <div className="flex-1 rounded-lg border border-dashed border-border/70 bg-background/30 p-3">
          {result === 'running' ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              requesting…
            </div>
          ) : typeof result === 'string' ? (
            <Alert variant="destructive">
              <AlertDescription className="break-words">{result}</AlertDescription>
            </Alert>
          ) : result ? (
            <ResultView result={result} label={single ? undefined : activeOption.label} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {single ? '发送请求查看结果。' : '选择方法按钮，对比同一规则下的响应。'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
