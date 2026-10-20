import type { SpecialScenario } from '@/scenarios.js'
import { MockFileActions } from '@/components/MockFileActions.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js'
import { specialScenarios } from '@/scenarios.js'
import { CorsPanel } from './panels/CorsPanel.js'
import { DownloadPanel } from './panels/DownloadPanel.js'
import { RecordPanel } from './panels/RecordPanel.js'
import { SsePanel } from './panels/SsePanel.js'
import { UploadPanel } from './panels/UploadPanel.js'
import { WebSocketPanel } from './panels/WebSocketPanel.js'

/**
 * Render the content of a special scenario
 *
 * 渲染特殊场景内容
 *
 * @param kind - Special scenario kind / 特殊场景类型
 * @returns Panel content / 面板内容
 */
function panelContent(kind: SpecialScenario['kind']): React.ReactNode {
  switch (kind) {
    case 'sse':
      return <SsePanel />
    case 'ws':
      return <WebSocketPanel />
    case 'upload':
      return <UploadPanel />
    case 'download':
      return <DownloadPanel />
    case 'cors':
      return <CorsPanel />
    case 'record':
      return <RecordPanel />
    default:
      return null
  }
}

/**
 * Dedicated panels for transports and browser-only features
 *
 * 传输层与浏览器专有功能面板
 *
 * @returns Special panels / 特殊场景面板
 */
export function SpecialPanels(): React.ReactNode {
  return (
    <>
      {specialScenarios.map((special) => (
        <Card key={special.id} className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>{special.title}</CardTitle>
            <CardDescription>{special.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            {panelContent(special.kind)}
            {special.mockFile && <MockFileActions file={special.mockFile} />}
          </CardContent>
        </Card>
      ))}
    </>
  )
}
