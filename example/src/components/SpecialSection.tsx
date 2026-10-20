import { SpecialPanels } from '@/components/SpecialPanels.js'
import { Badge } from '@/components/ui/badge.js'
import { specialScenarios } from '@/scenarios.js'

/**
 * Anchor id of the special transport section
 *
 * 特殊通道区块的锚点 id
 */
export const SPECIAL_SECTION_ID: string = 'special'

/**
 * Special transport section
 *
 * 特殊通道区块
 *
 * @returns Special section / 特殊区块
 */
export function SpecialSection(): React.ReactNode {
  return (
    <section id={SPECIAL_SECTION_ID} className="flex scroll-mt-24 flex-col gap-4 lg:scroll-mt-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          特殊通道
          <Badge variant="secondary" className="font-mono tabular-nums">
            {specialScenarios.length}
          </Badge>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          SSE、WebSocket、上传下载、CORS 与录制回放需要浏览器或流式交互。
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),1fr))] gap-4">
        <SpecialPanels />
      </div>
    </section>
  )
}
