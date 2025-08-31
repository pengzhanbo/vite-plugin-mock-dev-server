import type { CorsOptions } from 'cors'
import type { Alias, AliasOptions, ResolvedConfig } from 'vite'
import type { MockServerPluginOptions, ServerBuildOption } from './types'
import type { Logger } from './utils'
import process from 'node:process'
import { isArray, isBoolean, toArray, uniq } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { viteDefine } from './core'
import { createLogger } from './utils'

export type ResolvedMockServerPluginOptions = Required<
  Omit<MockServerPluginOptions, 'build' | 'cors' | 'wsPrefix' | 'prefix'>
> & {
  context: string
  logger: Logger
  alias: Alias[]
  define: Record<string, any>
  proxies: string[]
  wsProxies: string[]
  build: false | ServerBuildOption
  cors: false | CorsOptions
}

export function resolvePluginOptions({
  prefix = [],
  wsPrefix = [],
  cwd,
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
}: MockServerPluginOptions, config: ResolvedConfig): ResolvedMockServerPluginOptions {
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

  return {
    cwd: cwd || process.cwd(),
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
          ...typeof build === 'object' ? build : {},
        }
      : false,
    proxies,
    wsProxies,
    logger,
    alias,
    define: viteDefine(config),
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
