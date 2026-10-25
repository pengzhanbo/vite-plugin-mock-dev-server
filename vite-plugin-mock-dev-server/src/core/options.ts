import type { CorsOptions } from 'cors'
import type { Alias, ResolvedConfig } from 'vite'
import type {
  MockServerPluginOptions,
  RecordOptions,
  ResolvedRecordOptions,
  ServerBuildOption,
} from '../types/index.js'
import type { Logger } from './logger.js'
import path from 'node:path'
import process from 'node:process'
import { isArray, toArray, uniq } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { isTestEnvironment } from '../utils/index.js'
import { viteDefine } from './define.js'
import { createMockLogger } from './logger.js'

export type ResolvedMockServerPluginOptions = Required<
  Omit<MockServerPluginOptions, 'build' | 'cors' | 'wsPrefix' | 'prefix' | 'record' | 'activeScene'>
> & {
  context: string
  logger: Logger
  alias: Alias[]
  define: Record<string, any>
  proxies: string[]
  wsProxies: string[]
  activeScene: string[]
  build: false | ServerBuildOption
  cors: false | CorsOptions
  record: ResolvedRecordOptions
}

export function resolvePluginOptions(
  {
    prefix = [],
    wsPrefix = [],
    cwd: rawCwd,
    dir = 'mock',
    include = ['**/*.mock.{js,ts,cjs,mjs,json,json5}'],
    exclude = [],
    reload = false,
    log = 'info',
    cors = true,
    formidableOptions = {},
    build = false,
    cookiesOptions = {},
    bodyParserOptions = {},
    priority = {},
    activeScene = [],
    record = false,
    replay,
    awaitInitialLoad = isTestEnvironment(),
  }: MockServerPluginOptions,
  config: ResolvedConfig,
): ResolvedMockServerPluginOptions {
  const cwd = rawCwd ?? process.cwd()
  const logger = createMockLogger(log)

  const { httpProxies } = ensureProxies(config.server.proxy ?? {})
  const proxies = uniq([...toArray(prefix), ...httpProxies])
  const wsProxies = toArray(wsPrefix)

  if (!proxies.length && !wsProxies.length) {
    logger.warn(
      `No proxy was configured, mock server will not work. See ${ansis.cyan('https://vite-plugin-mock-dev-server.netlify.app/guide/usage')}`,
    )
  }

  // CORS 默认启用：插件 `cors` 与 Vite `server.cors` 中任一显式禁用时关闭
  // CORS is enabled by default: it is turned off as soon as either the plugin
  // `cors` option or the Vite `server.cors` option disables it
  const resolvedCors = resolveCorsOptions(cors, config.server.cors)

  const alias: Alias[] = []
  const aliasConfig = config.resolve.alias ?? []
  if (isArray<Alias>(aliasConfig)) {
    alias.push(...aliasConfig)
  } else {
    Object.entries(aliasConfig).forEach(([find, replacement]) => {
      alias.push({ find, replacement: replacement as string })
    })
  }

  const resolvedRecord = resolveRecordOptions(cwd, dir, record)
  // replay 默认跟随 record，但允许在 record 关闭时单独开启，用于仅回放已有录制数据的场景
  const resolvedReplay = replay ?? resolvedRecord.enabled

  if (replay === true && !resolvedRecord.enabled) {
    logger.warn(
      'The replay option is enabled while the record option is disabled, only existing recordings will be replayed.',
    )
  }

  return {
    enabled: true,
    cwd,
    dir,
    include,
    exclude,
    context: config.root,
    reload,
    awaitInitialLoad,
    cors: resolvedCors,
    cookiesOptions,
    log,
    formidableOptions: { multiples: true, ...formidableOptions },
    bodyParserOptions,
    priority,
    build: build
      ? {
          serverPort: 8080,
          dist: 'mockServer',
          log: 'error',
          includeRecord: resolvedReplay,
          ...(typeof build === 'object' ? build : {}),
        }
      : false,
    proxies,
    wsProxies,
    activeScene: toArray(activeScene),
    logger,
    alias,
    define: viteDefine(config),
    record: resolvedRecord,
    replay: resolvedReplay,
  }
}

export function ensureProxies(serverProxy: ResolvedConfig['server']['proxy'] = {}): {
  httpProxies: string[]
  wsProxies: string[]
} {
  const httpProxies: string[] = []
  const wsProxies: string[] = []
  Object.keys(serverProxy).forEach((key) => {
    const value = serverProxy[key]

    const isWsProxy =
      typeof value === 'string'
        ? isWebsocketProxyTarget(value)
        : Boolean(value.ws) || isWebsocketProxyTarget(value.target)
    if (isWsProxy) {
      wsProxies.push(key)
    } else {
      httpProxies.push(key)
    }
  })
  return { httpProxies, wsProxies }
}

/**
 * Check whether the proxy target points to a websocket server
 *
 * 判断代理目标是否指向 websocket 服务
 *
 * @param target - Proxy target / 代理目标
 * @returns Whether it points to a websocket server / 是否指向 websocket 服务
 */
export function isWebsocketProxyTarget(target: unknown): boolean {
  if (typeof target === 'string') {
    return /^wss?:\/\//i.test(target)
  }
  if (target instanceof URL) {
    return /^wss?:$/.test(target.protocol)
  }
  if (typeof target === 'object' && target != null && 'protocol' in target) {
    const { protocol } = target as { protocol?: unknown }
    return typeof protocol === 'string' && /^wss?:$/.test(protocol)
  }
  return false
}

/**
 * Vite 默认允许的来源（仅 localhost / 127.0.0.1 / [::1]）
 *
 * Vite 的 `server.cors` 默认值即使用该正则。插件在没有拿到来源限制时（`server.cors`
 * 为 `true` 或未配置 `origin`）以它为兜底，避免 mock 响应默认允许所有来源。
 */
const DEFAULT_ALLOWED_ORIGINS =
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/

/**
 * 解析 cors 配置
 *
 * 仅当插件的 `cors` 选项与 Vite 的 `server.cors` 选项都未禁用 CORS 时才启用。
 * 以 Vite `server.cors` 的配置为基础，插件的 `cors` 配置优先于它。
 * 基础配置没有来源限制时回退到 Vite 的默认值（仅 localhost），而不是允许所有来源。
 *
 * @param cors - Plugin cors option / 插件的 cors 配置
 * @param serverCors - Vite server.cors option / Vite 的 server.cors 配置
 * @returns Resolved cors options, `false` when disabled / 解析后的 cors 配置，禁用时为 `false`
 */
export function resolveCorsOptions(
  cors: boolean | CorsOptions,
  serverCors?: boolean | CorsOptions,
): false | CorsOptions {
  // 任一配置显式禁用 cors 时，整体关闭
  // CORS is disabled as a whole when either option disables it
  if (cors === false || serverCors === false) {
    return false
  }
  const base: CorsOptions =
    typeof serverCors === 'object' && serverCors.origin != null
      ? serverCors
      : {
          ...(typeof serverCors === 'object' ? serverCors : {}),
          origin: DEFAULT_ALLOWED_ORIGINS,
        }
  return {
    ...base,
    ...(typeof cors === 'object' ? cors : {}),
  }
}

/**
 * Resolve record options
 *
 * 解析录制配置
 *
 * @param cwd - Current working directory / 当前工作目录
 * @param dir - Mock context directory / 模拟上下文目录
 * @param record - Record options / 录制配置
 * @returns Resolved record options / 解析后的录制配置
 */
export function resolveRecordOptions(
  cwd: string,
  dir: string,
  record?: boolean | RecordOptions,
): ResolvedRecordOptions {
  // Parse record configuration
  const recordOptions = typeof record === 'boolean' ? { enabled: record } : record
  const expires = recordOptions?.expires ?? 0
  return {
    enabled: recordOptions?.enabled ?? false,
    cwd,
    dir: path.join(dir, recordOptions?.dir ?? '.recordings'),
    overwrite: recordOptions?.overwrite ?? true,
    status: toArray(recordOptions?.status).map(Number),
    expires: expires === 0 ? Number.MAX_SAFE_INTEGER : expires * 1000,
    gitignore: recordOptions?.gitignore ?? true,
    filter: recordOptions?.filter ?? (() => true),
  }
}
