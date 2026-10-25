/**
 * Hot update handling of the mock websocket server
 *
 * Mock WebSocket 服务的热更新处理
 *
 * mock 文件更新或被删除后，websocket 服务需要与最新的 mock 数据保持一致：
 * 重启仍然有效的服务，回收规则已失效的服务，并释放被删除文件创建的服务。
 *
 * When a mock file is updated or deleted, the websocket servers must stay consistent with
 * the latest mock data: the still valid servers are restarted, the ones whose rule no
 * longer applies are recycled, and the servers created by a deleted file are released.
 */

import type { Compiler } from '../compiler/index.js'
import type { MatchingWeightSorter } from '../core/matchingWeight.js'
import type { MockWebsocketItem } from '../types/index.js'
import type { WebSocketServerPool } from './pool.js'
import { objectKeys, toArray } from '@pengzhanbo/utils'
import { isPathMatch } from '../utils/index.js'

/**
 * Options of `registerHmrHandlers`
 *
 * `registerHmrHandlers` 的选项
 */
export interface HmrHandlersOptions {
  /**
   * Compiler instance / 编译器实例
   */
  compiler: Compiler
  /**
   * Websocket server pool / websocket 服务池
   */
  pool: WebSocketServerPool
  /**
   * Sorter with a cached result / 带排序结果缓存的排序器
   */
  sorter: MatchingWeightSorter
  /**
   * Mock urls provided by each mock file / 各 mock 文件提供的 mock url
   */
  hmrMap: Map<string, Set<string>>
}

/**
 * 注册 mock 文件生命周期事件的处理器
 *
 * Register the handlers of the mock file lifecycle events.
 *
 * @param options - Handler options / 处理器选项
 */
export function registerHmrHandlers({ compiler, pool, sorter, hmrMap }: HmrHandlersOptions): void {
  // mock 数据热更新后，候选规则集合会变化，此前缓存的排序结果随之失效
  compiler.on?.('mock:update-end', sorter.clear)

  // 检测 ws 相关的 mock 文件更新：更新该文件提供的规则，
  // 重启仍然有效的 websocket 服务，并回收因 `url` 被修改而失去规则的服务。
  function handleUpdateEnd(filepath: string): void {
    const services = pool.collect(filepath)
    // 该文件既不提供任何服务、也没有热更新记录：不含 ws mock，无需扫描 mock 数据
    if (services.length === 0 && !hmrMap.has(filepath)) {
      return
    }

    // 该文件当前提供的 ws 规则；`url` / `ws` 被修改后，旧规则不再存在
    const provided: { mockUrl: string; mock: MockWebsocketItem }[] = []
    for (const mockUrl of objectKeys(compiler.mockData)) {
      for (const mock of compiler.mockData[mockUrl]) {
        if (!mock || !mock.ws || mock.__filepath__ !== filepath) {
          continue
        }
        provided.push({ mockUrl, mock })
      }
    }

    // 热更新记录与该文件当前提供的规则保持一致
    if (provided.length === 0) {
      hmrMap.delete(filepath)
    } else {
      hmrMap.set(filepath, new Set(provided.map((item) => item.mockUrl)))
    }

    for (const { mockUrl, pathname, wss } of services) {
      // 规则仍然存在、且仍能匹配该连接的路径时，用新配置重启服务；
      // 否则（`url` 被修改、或 ws 规则被移除）回收服务及其客户端，
      // 避免旧服务继续用已被删除的 `setup` 逻辑响应连接
      const next = provided.find(
        (item) => item.mockUrl === mockUrl && isPathMatch(item.mock.url, pathname),
      )
      if (next) {
        pool.restart(wss, next.mock, filepath)
      } else {
        pool.recycle(mockUrl, pathname, wss)
      }
    }
  }
  compiler.on?.('mock:update-end', (filepaths: string[]) => {
    for (const filepath of toArray(filepaths)) {
      handleUpdateEnd(filepath)
    }
  })

  // mock 文件已被删除：移除其热更新记录，并回收它创建的 websocket 服务及其客户端
  compiler.on?.('mock:unlink', (filepath: string) => {
    hmrMap.delete(filepath)
    pool.recycleFile(filepath)
  })
}
