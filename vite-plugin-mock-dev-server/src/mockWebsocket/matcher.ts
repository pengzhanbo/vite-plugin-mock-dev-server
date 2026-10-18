/**
 * Rule matching of the mock websocket server
 *
 * Mock WebSocket 服务的规则匹配
 */
import type { MatchingWeightSorter } from '../core/matchingWeight.js'
import type { MockMatchPriority, MockOptions, MockWebsocketItem } from '../types/index.js'
import { objectKeys } from '@pengzhanbo/utils'
import { isPathMatch, matchScene } from '../utils/index.js'

/**
 * Matched websocket mock
 *
 * 命中的 websocket mock 配置
 */
export interface WebsocketMockMatch {
  /**
   * Key of the mock url in `mockData` / mock 数据中该规则的键
   */
  mockUrl: string
  /**
   * Websocket mock item / websocket mock 配置项
   */
  mock: MockWebsocketItem
}

/**
 * Options of `findWebsocketMock`
 *
 * `findWebsocketMock` 的选项
 */
export interface FindWebsocketMockOptions {
  /**
   * Mock data of the compiler / 编译器的 mock 数据
   */
  mockData: Record<string, MockOptions>
  /**
   * Request pathname / 请求路径
   */
  pathname: string
  /**
   * Active scene / 当前激活的场景
   */
  activeScene: string[]
  /**
   * Priority config / 优先级配置
   */
  priority: MockMatchPriority
  /**
   * Sorter with a cached result / 带排序结果缓存的排序器
   */
  sorter: MatchingWeightSorter
}

/**
 * 查找首个可用的 websocket mock 配置
 *
 * 与 HTTP 侧一致，对命中当前请求的规则按匹配权重从高到低排序，再依次查找首个
 * 可用的 websocket mock 配置，因此命中多条规则时不再依赖 `mockData` 的键插入顺序
 * （即 mock 文件的加载顺序）。
 *
 * 规则的排序由 `sorter` 完成，遇到无法解析的 `url` 规则时它会抛出异常，
 * 由调用方决定如何上报与拒绝握手。
 *
 * Find the first available websocket mock.
 *
 * Consistent with the HTTP side, the rules matching the request are sorted by matching
 * weight from highest to lowest, and the first available websocket mock is used. So when
 * several rules match, the result no longer depends on the key insertion order of
 * `mockData` (that is, the load order of the mock files).
 *
 * The rules are sorted by `sorter`, which throws on a `url` rule it cannot parse; the
 * caller decides how to report it and reject the handshake.
 *
 * @param options - Find options / 查找选项
 * @returns Matched mock or undefined / 命中的 mock 配置或未定义
 */
export function findWebsocketMock(
  options: FindWebsocketMockOptions,
): WebsocketMockMatch | undefined {
  const { mockData, pathname, activeScene, priority, sorter } = options
  const mockUrls = sorter(objectKeys(mockData), pathname, priority)

  // 仅命中首个可用的 websocket mock 配置，与 HTTP 侧保持一致
  // Only the first available websocket mock matches, consistent with the HTTP side
  for (const mockUrl of mockUrls) {
    const mock = mockData[mockUrl].find(
      (item) =>
        item.url &&
        item.ws &&
        matchScene(activeScene, item.scene) &&
        isPathMatch(item.url, pathname),
    )
    if (mock) {
      return { mockUrl, mock: mock as MockWebsocketItem }
    }
  }

  return undefined
}
