import type { Options as COBodyOptions } from 'co-body'
import type { CorsOptions } from 'cors'
import type formidable from 'formidable'
import type { CookiesOption } from './cookies'

export type BodyParserOptions = COBodyOptions & {
  jsonLimit?: string | number
  formLimit?: string | number
  textLimit?: string | number
}

export type LogType = 'info' | 'warn' | 'error' | 'debug'

export type LogLevel = LogType | 'silent'

export interface ServerBuildOption {
  /**
   * Service startup port
   *
   * 服务启动端口
   * @default 8080
   */
  serverPort?: number
  /**
   * Service application output directory
   *
   * 服务应用输出目录
   * @default 'dist/mockServer'
   */
  dist?: string

  /**
   * Service application log level
   *
   * 服务应用日志级别
   * @default 'error'
   */
  log?: LogLevel
}

export interface MockMatchPriority {
  /**
   * The priority of matching rules is global.
   * The rules declared in this option will take priority over the default rules.
   * The higher the position of the rule in the array, the higher the priority.
   *
   * Do not declare general rules in this option, such as /api/(.*),
   * as it will prevent subsequent rules from taking effect.
   * Unless you are clear about the priority of the rules,
   * most of the time you do not need to configure this option.
   *
   * 匹配规则优先级, 全局生效。
   * 声明在该选项中的规则将优先于默认规则生效。
   * 规则在数组越靠前的位置，优先级越高。
   *
   * 不要在此选项中声明通用性的规则，比如 `/api/(.*)`，这将导致后续的规则无法生效。
   * 除非你明确知道规则的优先级，否则大多数情况下都不需要配置该选项。
   * @default []
   */
  global?: string[]
  /**
   * For some special cases where the priority of certain rules needs to be adjusted,
   * this option can be used. For example, when a request matches both Rule A and Rule B,
   * and Rule A has a higher priority than Rule B, but it is desired for Rule B to take effect.
   *
   * 对于一些特殊情况，需要调整部分规则的优先级，可以使用此选项。
   * 比如一个请求同时命中了规则 A 和 B，且 A 比 B 优先级高， 但期望规则 B 生效时。
   *
   * @example
   * ```ts
   * {
   *   special: {
   *     // /api/a/:b/c 优先级将提升到 /api/a/b/:c 前面
   *     // The /api/a/:b/c priority is promoted to /api/a/b/:c
   *     '/api/a/:b/c': ['/api/a/b/:c'],
   *     // 仅在请求满足 /api/a/b/c 时生效
   *     // Only when the request satisfies /api/a/b/c
   *     '/api/:a/b/c': {
   *        rules: ['/api/a/:b/c'],
   *        when: ['/api/a/b/c']
   *      }
   *   }
   * }
   * ```
   */
  special?: MockMatchSpecialPriority
}

export interface MockMatchSpecialPriority {
  /**
   * When both A and B or C match, and B or C is at the top of the sort order,
   * insert A into the top position.The `when` option is used to further constrain
   * the priority adjustment to be effective only for certain requests.
   *
   * 当 A 与 B或 C 同时满足匹配，`B` 或 `C` 在排序首位时，将A插入到首位。
   * when 选项用于进一步约束该优先级调整仅针对哪些请求有效。
   *
   * @example
   * ```ts
   * {
   *   A: ['B', 'C'],
   *   A: { rules: ['B', 'C'], when: ['/api/a/b/c'] }
   * }
   * ```
   */
  [key: string]: string[] | { rules: string[], when: string[] }
}

/**
 * Configure plugin
 *
 * 插件配置项
 */
export interface MockServerPluginOptions {
  /**
   * To configure the path matching rules for http mock services,
   * any request path starting with prefix will be intercepted and proxied.
   * If the prefix starts with `^`, it will be recognized as a `RegExp`.
   *
   * 为 http mock 服务配置 路径匹配规则，任何请求路径以 prefix 开头的都将被拦截代理。
   * 如果 prefix 以 `^` 开头，将被识别为 `RegExp`。
   * @default []
   * @example ['^/api']
   */
  prefix?: string | string[]

  /**
   * Configure path matching rules for WebSocket mock service.
   * Any ws/wss requests with a request path starting with wsPrefix
   * will be intercepted by the proxy.
   * If wsPrefix starts with `^`, it will be recognized as a `RegExp`.
   *
   * 为 websocket mock 服务配置 路径匹配规则， 任何请求路径以 wsPrefix 开头的 ws/wss请求，
   * 都将被代理拦截。
   * 如果 wsPrefix 以 `^` 开头，将被识别为 `RegExp`。
   * @default []
   * @example ['/socket.io']
   */
  wsPrefix?: string | string[]

  /**
   * Configure the matching context for `include` and `exclude`.
   *
   * 配置 `include` 和 `exclude` 的匹配上下文
   *
   * @default process.cwd()
   */
  cwd?: string

  /**
   * The directory to store mock files
   *
   * 存储 mock 文件的目录
   *
   * @default 'mock'
   */
  dir?: string

  /**
   * glob string matching mock includes files
   *
   * glob 字符串匹配 mock 包含的文件
   * @see [picomatch](https://github.com/micromatch/picomatch#globbing-features)
   * @default []
   */
  include?: string | string[]
  /**
   * glob string matching mock excluded files
   *
   * glob 字符串匹配 mock 排除的文件
   * @see [picomatch](https://github.com/micromatch/picomatch#globbing-features)
   */
  exclude?: string | string[]

  /**
   * Enable log and configure log level
   *
   * 开启日志，或配置 日志级别
   * @default 'info'
   */
  log?: boolean | LogLevel

  /**
   * When the mock resource is hot updated, only the data content is updated,
   * but the page is not refreshed by default.
   * If you want to refresh the page every time you modify a mock file,
   * you can open this option.
   *
   * mock资源热更新时，仅更新了数据内容，但是默认不重新刷新页面。
   * 当你希望每次修改mock文件都刷新页面时，可以打开此选项。
   * @default false
   */
  reload?: boolean

  /**
   * Configure to `cors`
   *
   * 配置 `cors`
   * @default true
   * @see [cors](https://github.com/expressjs/cors#configuration-options)
   */
  cors?: boolean | CorsOptions

  /**
   * formidable options
   * @see [formidable](https://github.com/node-formidable/formidable#options)
   */
  formidableOptions?: formidable.Options

  /**
   * cookies options
   * @see [cookies](https://github.com/pillarjs/cookies#new-cookiesrequest-response--options)
   */
  cookiesOptions?: CookiesOption

  /**
   * Configure to `co-body`
   *
   * 配置 `co-body`
   *
   * @see [co-body](https://github.com/cojs/co-body#options)
   */
  bodyParserOptions?: BodyParserOptions

  /**
   * When you need to build a small mock service, you can configure this option.
   *
   * 当需要构建一个小型mock服务时，可配置此项
   * @default false
   */
  build?: boolean | ServerBuildOption

  /**
   * Priority sorting for path matching rules is valid only for rules containing dynamic parameters.
   * In most cases, the default sorting rules can meet the needs.
   * However, in some cases where custom sorting rules are required, this option can be used.
   *
   * 路径匹配规则优先级排序，仅对包含动态参数的规则有效。
   * 大部分情况下默认的排序规则都可以满足需求。
   * 但有些情况下，需要自定义排序规则时，可以使用此选项。
   *
   * @example
   * ```ts
   * export default {
   *   priority: {
   *     global: ['/api/:a/b/c', '/api/a/:b/c', '/api/a/b/:c'],
   *     special: {
   *       '/api/:a/:b/c': {
   *         rules: ['/api/a/:b/:c', '/api/a/b/:c'],
   *         when: ['/api/a/b/c']
   *        }
   *     }
   *   }
   * }
   * ```
   */
  priority?: MockMatchPriority
}
