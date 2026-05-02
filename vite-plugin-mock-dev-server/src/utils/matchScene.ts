import { toArray } from '@pengzhanbo/utils'

export function matchScene(activeScene: string[], mockScene?: string | string[]): boolean {
  if (!mockScene)
    return true
  const scenes = toArray(mockScene)
  // 当插件未配置场景时，带场景的 mock 直接返回 false
  if (activeScene.length === 0 && scenes.length > 0)
    return false
  if (scenes.length === 0)
    return true
  return scenes.some(s => activeScene.includes(s))
}
