import process from 'node:process'
import { isBoolean, toArray, uniq } from '@pengzhanbo/utils'
import type { ResolvedConfig } from 'vite'
import color from 'picocolors'
import type { CorsOptions } from 'cors'
import type { MockServerPluginOptions, ServerBuildOption } from './types'
import { type Logger, createLogger } from './logger'
import { viteDefine } from './define'
import { ensureProxies } from './utils'

export type ResolvedMockServerPluginOptions = Required<
  Omit<MockServerPluginOptions, 'build' | 'cors' | 'wsPrefix' | 'prefix'>
> & {
  context: string
  logger: Logger
  alias: ResolvedConfig['resolve']['alias']
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
  include = ['mock/**/*.mock.{js,ts,cjs,mjs,json,json5}'],
  exclude = ['**/node_modules/**', '**/.vscode/**', '**/.git/**'],
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
    logger.warn(`No proxy was configured, mock server will not work. See ${color.cyan('https://vite-plugin-mock-dev-server.netlify.app/guide/usage')}`)

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

  return {
    cwd: cwd || process.cwd(),
    include,
    exclude,
    context: config.root,
    reload,
    cors: enabled ? corsOptions : false,
    cookiesOptions,
    log,
    formidableOptions: {
      multiples: true,
      ...formidableOptions,
    },
    bodyParserOptions,
    priority,
    build: build
      ? Object.assign(
        {
          serverPort: 8080,
          dist: 'mockServer',
          log: 'error',
        },
        typeof build === 'object' ? build : {},
      )
      : false,
    proxies,
    wsProxies,
    logger,
    alias: config.resolve.alias,
    define: viteDefine(config),
  }
}
