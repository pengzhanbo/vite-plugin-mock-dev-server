/**
 * The reason for not reusing the websocket proxy in `viteConfig.server.proxy` is that
 * it is difficult to check in a satisfactory way whether there are websocket-related
 * mock configurations in the mock files, comparing them with those used in `server.proxy`,
 * and removing them from `viteConfig.server.proxy`.
 *
 * Due to uncertainty about the scale of mock files, parsing all mock files to find
 * corresponding path matching rules and then modifying `viteConfig` would add time overhead
 * to the vite dev server startup, which goes against the expectations of vite and the plugin.
 *
 * Moreover, if newly added mock files contain other rules that require modifying `viteConfig`,
 * causing the vite server to restart, this is not a suitable solution and is difficult
 * to align with user expectations.
 *
 * A more appropriate solution is to provide the `wsPrefix` configuration option for users
 * to customize, and ensure that items in `wsPrefix` do not exist in `server.proxy` to avoid
 * conflicts between vite's internal http-proxy ws and the plugin's ws.
 *
 * 不复用 `viteConfig.server.proxy` 中 websocket proxy的原因是，
 * 很难通过一种令人满意的方式，检查 mock 文件中是否有 websocket 相关的 mock 配置，
 * 对比 `server.proxy` 中被使用的，并从 `viteConfig.server.proxy` 中删除。
 * 由于不确定 mock 文件的规模，解析所有mock文件后找出相对应的路径匹配规则再修改 `viteConfig`，
 * 这个链路的时间开销，已经影响了 vite 开发服务的启动时间，这有违 vite 和插件的预期。
 * 且如果 新增的 mock 文件中 又有其他的规则需要再次 修改 `viteConfig` 导致 vite 服务重启，
 * 这其实并不是一个合适的处理方案，很难符合用户的预期。
 * 比较合适的方案还是提供 `wsPrefix` 配置项给用户自定义，并由用户确保 `wsPrefix` 中的项不存在
 * 于 `server.proxy` 中，避免 vite 内的 http-proxy ws 与 插件的 ws 的冲突。
 */
import type { Server } from 'node:http'
import type { Http2SecureServer } from 'node:http2'
import type { Compiler } from '../compiler/index.js'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import type { UpgradeHandlerOptions } from './upgrade.js'
import { toArray } from '@pengzhanbo/utils'
import { createMatchingWeightSorter } from '../mockHttp/index.js'
import { registerHmrHandlers } from './hmr.js'
import { WebSocketServerPool } from './pool.js'
import { handleUpgradeRequest } from './upgrade.js'

/**
 * Mock WebSocket server
 *
 * Mock WebSocket 服务器
 *
 * 负责把编译器的 mock 数据、mock 文件的生命周期事件与 HTTP 服务的 `upgrade`
 * 事件连接起来：
 *
 * - 服务的创建、重启、回收与空闲回收由 `WebSocketServerPool` 负责（见 `pool.ts`）
 * - mock 文件的生命周期事件由 `registerHmrHandlers` 负责（见 `hmr.ts`）
 * - 握手的处理、规则的匹配与请求扩展由 `handleUpgradeRequest` 负责（见 `upgrade.ts`）
 *
 * Mock WebSocket server.
 *
 * It wires the mock data of the compiler, the lifecycle events of the mock files and the
 * `upgrade` event of the HTTP server together:
 *
 * - creating, restarting, recycling and idle-recycling the servers is handled by
 *   `WebSocketServerPool` (see `pool.ts`)
 * - the lifecycle events of the mock files are handled by `registerHmrHandlers`
 *   (see `hmr.ts`)
 * - the handshake, the rule matching and the request extras are handled by
 *   `handleUpgradeRequest` (see `upgrade.ts`)
 *
 * @param compiler - Compiler instance / 编译器实例
 * @param server - HTTP server instance / HTTP 服务器实例
 * @param options - Resolved plugin options / 解析后的插件配置
 */
export function mockWebSocket(
  compiler: Compiler,
  server: Server | Http2SecureServer | null,
  {
    wsProxies: proxies,
    cookiesOptions,
    logger,
    activeScene,
    priority,
  }: ResolvedMockServerPluginOptions,
): void {
  // Hot update file mapping
  // 热更新文件映射
  const hmrMap = new Map<string, Set<string>>()

  const pool = new WebSocketServerPool(logger)

  /**
   * 候选规则的权重排序器
   *
   * 与 HTTP 侧保持一致的匹配优先级（静态规则优先于动态规则等），
   * 避免命中多条规则时，匹配结果取决于 `mockData` 的键插入顺序（即 mock 文件的加载顺序）。
   * 排序结果以 pathname 为键缓存，mock 数据热更新后需要清空缓存；
   * 空结果不会被缓存，因此初次加载完成前建立的连接留下的空结果，
   * 不会影响加载完成后建立的连接（不依赖 `mock:update-end` 清空）。
   */
  const sorter = createMatchingWeightSorter()

  registerHmrHandlers({ compiler, pool, sorter, hmrMap })

  const upgradeOptions: UpgradeHandlerOptions = {
    compiler,
    pool,
    logger,
    proxies,
    activeScene: toArray(activeScene),
    priority,
    cookiesOptions,
    sorter,
    // 记录规则与 mock 文件的对应关系：热更新时据此找出该文件创建的 websocket 服务，
    // 即使这些服务当前没有客户端连接
    onMatched(filepath: string, mockUrl: string): void {
      let urlList = hmrMap.get(filepath)
      if (!urlList) {
        hmrMap.set(filepath, (urlList = new Set()))
      }
      urlList.add(mockUrl)
    },
  }

  server?.on('upgrade', (req, socket, head) => {
    handleUpgradeRequest(upgradeOptions, req, socket, head)
  })

  server?.on('close', () => {
    pool.closeAll()
    hmrMap.clear()
  })
}
