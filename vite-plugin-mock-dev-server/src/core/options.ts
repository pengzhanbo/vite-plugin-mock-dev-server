import type { CorsOptions } from 'cors'
import type { Alias, AliasOptions, ResolvedConfig } from 'vite'
import type {
  MockServerPluginOptions,
  RecordOptions,
  ResolvedRecordOptions,
  ServerBuildOption,
} from '../types'
import type { Logger } from './logger'
import path from 'node:path'
import process from 'node:process'
import { isArray, isBoolean, toArray, uniq } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { viteDefine } from './define'
import { createLogger } from './logger'

export type ResolvedMockServerPluginOptions = Required<
  Omit<MockServerPluginOptions, 'build' | 'cors' | 'wsPrefix' | 'prefix' | 'record'>
> & {
  context: string
  logger: Logger
  alias: Alias[]
  define: Record<string, any>
  proxies: string[]
  wsProxies: string[]
  build: false | ServerBuildOption
  cors: false | CorsOptions
  record: ResolvedRecordOptions
  base: string
}

export function resolvePluginOptions({
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
  record = false,
  replay,
  ui = false,
}: MockServerPluginOptions, config: ResolvedConfig): ResolvedMockServerPluginOptions {
  const cwd = rawCwd || process.cwd()
  const logger = createLogger('vite:mock', isBoolean(log) ? (log ? 'info' : 'error') : log)

  const { httpProxies } = ensureProxies(config.server.proxy || {})
  const proxies = uniq([...toArray(prefix), ...httpProxies])
  const wsProxies = toArray(wsPrefix)

  if (!proxies.length && !wsProxies.length)
    logger.warn(`No proxy was configured, mock server will not work. See ${ansis.cyan('https://vite-plugin-mock-dev-server.netlify.app/guide/usage')}`)

  // enable cors by default
  const enabled = cors === false ? false : config.server.cors !== false
  let corsOptions: CorsOptions = {}

  if (enabled && config.server.cors !== false) {
    corsOptions = {
      ...corsOptions,
      ...((typeof config.server.cors === 'boolean'
        ? {}
        : config.server.cors) as CorsOptions),
    }
  }

  if (enabled && cors !== false) {
    corsOptions = {
      ...corsOptions,
      ...(typeof cors === 'boolean' ? {} : cors),
    }
  }

  const alias: Alias[] = []
  const aliasConfig = (config.resolve.alias || []) as AliasOptions
  if (isArray<Alias>(aliasConfig)) {
    alias.push(...aliasConfig)
  }
  else {
    Object.entries(aliasConfig).forEach(([find, replacement]) => {
      alias.push({ find, replacement })
    })
  }

  const resolvedRecord = resolveRecordOptions(cwd, dir, record)

  return {
    enabled: true,
    base: config.base || '/',
    cwd,
    ui,
    dir,
    include,
    exclude,
    context: config.root,
    reload,
    cors: enabled ? corsOptions : false,
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
          includeRecord: replay ?? resolvedRecord.enabled ?? false,
          ...typeof build === 'object' ? build : {},
        }
      : false,
    proxies,
    wsProxies,
    logger,
    alias,
    define: viteDefine(config),
    record: resolvedRecord,
    replay: replay ?? resolvedRecord.enabled ?? false,
  }
}

export function ensureProxies(
  serverProxy: ResolvedConfig['server']['proxy'] = {},
): { httpProxies: string[], wsProxies: string[] } {
  const httpProxies: string[] = []
  const wsProxies: string[] = []
  Object.keys(serverProxy).forEach((key) => {
    const value = serverProxy[key]
    if (
      typeof value === 'string'
      || (!value.ws
        && !value.target?.toString().startsWith('ws:')
        && !value.target?.toString().startsWith('wss:'))
    ) {
      httpProxies.push(key)
    }
    else {
      wsProxies.push(key)
    }
  })
  return { httpProxies, wsProxies }
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
export function resolveRecordOptions(cwd: string, dir: string, record?: boolean | RecordOptions): ResolvedRecordOptions {
  // Parse record configuration
  const recordOptions = typeof record === 'boolean'
    ? { enabled: record }
    : record
  const expires = recordOptions?.expires ?? 0
  return {
    enabled: recordOptions?.enabled ?? false,
    cwd,
    dir: path.join(dir, recordOptions?.dir || '.recordings'),
    overwrite: recordOptions?.overwrite ?? true,
    status: toArray(recordOptions?.status).map(Number),
    expires: expires === 0 ? Number.MAX_SAFE_INTEGER : expires * 1000,
    gitignore: recordOptions?.gitignore ?? true,
    filter: recordOptions?.filter || (() => true),
  }
}
