import type * as http from 'node:http'
import type { Connect, ResolvedConfig, WebSocketServer } from 'vite'
import { baseMiddleware } from './baseMiddleware'
import { viteDefine } from './define'
import { MockLoader } from './MockLoader'
import type { MockServerPluginOptions } from './types'
import { ensureArray, ensureProxies } from './utils'
import { mockWebSocket } from './ws'

export async function mockServerMiddleware(
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>,
  httpServer: http.Server | null,
  ws?: WebSocketServer,
): Promise<Connect.NextHandleFunction> {
  const loader = new MockLoader({
    include: ensureArray(options.include),
    exclude: ensureArray(options.exclude),
    define: viteDefine(config),
    alias: config.resolve.alias,
  })

  loader.load()

  loader.on('mock:update-end', () => {
    if (options.reload) {
      ws?.send({ type: 'full-reload' })
    }
  })

  httpServer?.on('close', () => loader.close())

  /**
   * 获取 服务代理配置中，配置的 请求前缀，
   * 作为判断接口是否需要mock的首要条件。
   *
   * 在一般开发场景中，我们也只需要对通过 vite server 进行代理的请求 进行 mock
   */
  const { httpProxies } = ensureProxies(config.server.proxy || {})
  /**
   * 保留直接通过 plugin option 直接配置 路径匹配规则，
   * 但在大多数场景下，共用 `server.proxy` 已足够
   */
  const prefix = ensureArray(options.prefix)

  /**
   * 虽然 config.server.proxy 中有关于 ws 的代理配置，
   * 但是由于 vite 内部在启动时，直接对 ws相关的请求，通过 upgrade 事件，发送给 http-proxy
   * 的 ws 代理方法。如果插件直接使用 config.server.proxy 中的 ws 配置，
   * 就会导致两次 upgrade 事件 对 wss 实例的冲突。
   * 由于 vite 内部并没有提供其他的方式跳过 内部 upgrade 的方式，（个人认为也没有必要提供此类方式）
   * 所以插件选择了通过插件的配置项 `wsPrefix` 来做 判断的首要条件。
   * 当前插件默认会将已配置在 wsPrefix 的值，从 config.server.proxy 的删除，避免发生冲突问题。
   */
  mockWebSocket(
    loader,
    httpServer,
    ensureArray(options.wsPrefix),
    options.cookiesOptions,
  )

  return baseMiddleware(loader, {
    formidableOptions: options.formidableOptions,
    proxies: [...prefix, ...httpProxies],
    cookiesOptions: options.cookiesOptions,
  })
}
