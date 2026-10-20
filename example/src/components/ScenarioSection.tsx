import type { ScenarioResult } from '@/scenario-runner.js'
import type { Scenario, ScenarioGroup, ScenarioVariant } from '@/scenarios.js'
import { ServerCog } from 'lucide-react'
import { ScenarioCard } from '@/components/ScenarioCard.js'
import { Badge } from '@/components/ui/badge.js'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty.js'

/**
 * Render scenario groups and the empty filter state
 *
 * 渲染场景分组与空过滤状态
 *
 * @param props - Component props / 组件属性
 * @returns Scenario sections / 场景区块
 */
export function ScenarioSection({
  groups,
  filter,
  scene,
  results,
  busy,
  onRun,
}: {
  groups: ScenarioGroup[]
  filter: string
  scene: string
  results: Record<string, ScenarioResult | string>
  busy: boolean
  onRun: (scenario: Scenario, option: ScenarioVariant) => void
}): React.ReactNode {
  return (
    <>
      {groups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="flex scroll-mt-24 flex-col gap-4 lg:scroll-mt-6"
        >
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              {group.title}
              <Badge variant="secondary" className="font-mono tabular-nums">
                {group.scenarios.length}
              </Badge>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[768px]:grid-cols-2 min-[1441px]:grid-cols-3">
            {group.scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                scene={scene}
                results={results}
                busy={busy}
                onRun={onRun}
              />
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ServerCog />
            </EmptyMedia>
            <EmptyTitle>没有匹配 “{filter}” 的场景。</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
