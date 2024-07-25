import type { Server } from 'node:http'
import type { Http2SecureServer } from 'node:http2'
import { isBoolean, toArray, uniq } from '@pengzhanbo/utils'
import cors, { type CorsOptions } from 'cors'
import { pathToRegexp } from 'path-to-regexp'
import type { Connect, ResolvedConfig, WebSocketServer } from 'vite'
import c from 'picocolors'
import { baseMiddleware } from './baseMiddleware'
import { viteDefine } from './define'
import { createLogger } from './logger'
import { MockLoader } from './MockLoader'
import type { MockServerPluginOptions } from './types'
import { doesProxyContextMatchUrl, ensureProxies, urlParse } from './utils'
import { mockWebSocket } from './ws'

export function mockServerMiddleware(
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>,
  // vite@5 httpServer 类型发生变更
  // https://github.com/vitejs/vite/pull/14834
  httpServer: Server | Http2SecureServer | null,
  ws?: WebSocketServer,
): Connect.NextHandleFunction[] {
  const logger = createLogger(
    'vite:mock',
    isBoolean(options.log) ? (options.log ? 'info' : 'error') : options.log,
  )
  /**
   * 加载 mock 文件, 包括监听 mock 文件的依赖文件变化，
   * 并注入 vite  `define` / `alias`
   */
  const loader = new MockLoader({
    cwd: options.cwd,
    include: toArray(options.include),
    exclude: toArray(options.exclude),
    define: viteDefine(config),
    alias: config.resolve.alias,
  })

  loader.load()

  /**
   * 监听 mock 文件是否发生变更，如何配置了 reload 为 true，
   * 当发生变更时，通知当前页面进行重新加载
   */
  loader.on('mock:update-end', () => {
    if (options.reload)
      ws?.send({ type: 'full-reload' })
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
  const prefix = toArray(options.prefix)
  const proxies = uniq([...prefix, ...httpProxies])

  // fix: #68
  if (!proxies.length && !toArray(options.wsPrefix).length)
    logger.warn(`No proxy was configured, mock server will not work. See ${c.cyan('https://vite-plugin-mock-dev-server.netlify.app/guide/usage')}`)

  /**
   * 虽然 config.server.proxy 中有关于 ws 的代理配置，
   * 但是由于 vite 内部在启动时，直接对 ws相关的请求，通过 upgrade 事件，发送给 http-proxy
   * 的 ws 代理方法。如果插件直接使用 config.server.proxy 中的 ws 配置，
   * 就会导致两次 upgrade 事件 对 wss 实例的冲突。
   * 由于 vite 内部并没有提供其他的方式跳过 内部 upgrade 的方式，（个人认为也没有必要提供此类方式）
   * 所以插件选择了通过插件的配置项 `wsPrefix` 来做 判断的首要条件。
   * 当前插件默认会将已配置在 wsPrefix 的值，从 config.server.proxy 的删除，避免发生冲突问题。
   */
  mockWebSocket({
    loader,
    httpServer,
    proxies: toArray(options.wsPrefix),
    cookiesOptions: options.cookiesOptions,
    logger,
  })

  const middlewares: (Connect.NextHandleFunction | undefined)[] = []

  middlewares.push(
    /**
     * 在 vite 的开发服务中，由于插件 的 enforce 为 `pre`，
     * mock 中间件的执行顺序 早于 vite 内部的 cors 中间件执行,
     * 这导致了 vite 默认开启的 cors 对 mock 请求不生效。
     * 在一些比如 微前端项目、或者联合项目中，会由于端口不一致而导致跨域问题。
     * 所以在这里，使用 cors 中间件 来解决这个问题。
     *
     * 同时为了使 插件内的 cors 和 vite 的 cors 不产生冲突，并拥有一致的默认行为，
     * 也会使用 viteConfig.server.cors 配置，并支持 用户可以对 mock 中的 cors 中间件进行配置。
     * 而用户的配置也仅对 mock 的接口生效。
     */
    corsMiddleware(loader, proxies, config, options),
    baseMiddleware(loader, {
      formidableOptions: options.formidableOptions,
      proxies,
      cookiesOptions: options.cookiesOptions,
      bodyParserOptions: options.bodyParserOptions,
      priority: options.priority,
      logger,
    }),
  )
  return middlewares.filter(Boolean) as Connect.NextHandleFunction[]
}

function corsMiddleware(
  mockLoader: MockLoader,
  proxies: string[],
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>,
): Connect.NextHandleFunction | undefined {
  let corsOptions: CorsOptions = {}

  // enable cors by default
  const enabled = options.cors === false ? false : config.server.cors !== false

  if (enabled && config.server.cors !== false) {
    corsOptions = {
      ...corsOptions,
      ...((typeof config.server.cors === 'boolean'
        ? {}
        : config.server.cors) as CorsOptions),
    }
  }

  if (enabled && options.cors !== false) {
    corsOptions = {
      ...corsOptions,
      ...(typeof options.cors === 'boolean' ? {} : options.cors),
    }
  }

  return !enabled
    ? undefined
    : function (req, res, next) {
      const { pathname } = urlParse(req.url!)
      if (
        !pathname
        || proxies.length === 0
        || !proxies.some(context =>
          doesProxyContextMatchUrl(context, req.url!),
        )
      ) {
        return next()
      }

      const mockData = mockLoader.mockData

      const mockUrl = Object.keys(mockData).find(key =>
        pathToRegexp(key).test(pathname),
      )

      if (!mockUrl)
        return next()

      cors(corsOptions)(req, res, next)
    }
}
