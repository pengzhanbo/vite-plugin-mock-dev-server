import { toArray } from '@pengzhanbo/utils'

/**
 * Match the mock scene with the active scene
 *
 * 匹配 mock 场景与当前激活的场景
 *
 * `activeScene` is defaulted to an empty array, since some consumers (such as
 * the generated standalone mock server) may not pass it at all.
 * An empty `activeScene` means no scene is activated, then a mock with scenes
 * never matches, while a mock without scenes always matches.
 *
 * `activeScene` 默认为空数组，因为部分调用方（如构建产物中的独立 mock server）
 * 可能并不会传递该配置。
 * 空的 `activeScene` 表示未激活任何场景，此时带有场景的 mock 不会被匹配，
 * 不带场景的 mock 则始终匹配。
 *
 * @param activeScene - Active scene / 当前激活的场景
 * @param mockScene - Scenes of the mock / mock 配置的场景
 * @returns Whether the mock matches the active scene / mock 是否与当前场景匹配
 */
export function matchScene(activeScene: string[] = [], mockScene?: string | string[]): boolean {
  if (!mockScene) {
    return true
  }
  const scenes = toArray(mockScene)
  // 当插件未配置场景时，带场景的 mock 直接返回 false
  if (activeScene.length === 0 && scenes.length > 0) {
    return false
  }
  if (scenes.length === 0) {
    return true
  }
  return scenes.some((s) => activeScene.includes(s))
}
