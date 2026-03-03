/**
 * Record configuration options
 *
 * 录制配置选项
 */
export interface RecordOptions {
  /**
   * Whether to enable the record feature
   * - true: Enable, automatically record proxy responses
   * - false: Disable (default)
   *
   * 是否启用录制功能
   * - true: 启用，自动录制 proxy 响应
   * - false: 禁用（默认）
   *
   * @default false
   */
  enabled?: boolean

  /**
   * Filter requests to record
   * - Function: Custom filter function, return true to record
   * - Object: Include/exclude patterns with glob or path-to-regexp mode
   *
   * 过滤要录制的请求
   * - 函数：自定义过滤函数，返回 true 表示录制
   * - 对象：包含/排除模式，支持 glob 或 path-to-regexp 模式
   *
   * @example
   * ```ts
   * // Record all requests
   * filter: (req) => true
   * // Record requests using glob pattern
   * filter: { mode: 'glob', include: '/api/**' }
   * // Record requests using path-to-regexp pattern
   * filter: { mode: 'path-to-regexp', include: '/api/:id' }
   * ```
   */
  filter?: ((req: RecordedReq) => boolean) | {
    /**
     * Include the request links that need to be recorded
     *
     * String: Glob pattern or path-to-regexp pattern
     * (Use the mode option to set the mode, default is glob)
     *
     * 包含需要录制的请求链接
     *
     * glob 模式或 path-to-regexp 模式
     * (使用 mode 选项设置模式，默认为 glob)
     */
    include?: string | string[]
    /**
     * Exclude request links that do not need to be recorded
     *
     * String: Glob pattern or path-to-regexp pattern
     * (Use the mode option to set the mode, default is glob)
     *
     * 排除不需要录制的请求链接
     *
     * glob 模式或 path-to-regexp 模式
     * (使用 mode 选项设置模式，默认为 glob)
     */
    exclude?: string | string[]
    /**
     * Matching mode for include/exclude patterns
     * - 'glob': Glob pattern matching (default)
     * - 'path-to-regexp': Path-to-regexp pattern matching
     *
     * 包含/排除模式的匹配模式
     * - 'glob': glob 模式匹配（默认）
     * - 'path-to-regexp': path-to-regexp 模式匹配
     */
    mode: 'glob' | 'path-to-regexp'
  }

  /**
   * Directory to store recorded data
   * Relative to project root
   *
   * 录制数据存储目录
   * 相对于项目根目录
   *
   * @default 'mock/.recordings'
   */
  dir?: string

  /**
   * Whether to overwrite existing recorded data
   * - true: Overwrite old data for the same request (default)
   * - false: Keep old data, do not record new data
   *
   * 是否覆盖已有录制数据
   * - true: 相同请求覆盖旧数据（默认）
   * - false: 保留旧数据，不录制新数据
   *
   * @default true
   */
  overwrite?: boolean

  /**
   * Expiration time for recorded data in seconds
   * - 0: Never expire (default)
   * - Positive number: Expire after specified seconds
   *
   * 录制数据过期时间（秒）
   * - 0: 永不过期（默认）
   * - 正数：指定秒数后过期
   *
   * @default 0
   */
  expires?: number

  /**
   * Status codes to record
   * - Empty array: Record all status codes (default)
   * - Specify one or more status codes to filter
   *
   * 要录制的状态码
   * - 为空数组时记录所有状态码（默认）
   * - 指定一个或多个状态码进行过滤
   *
   * @default []
   */
  status?: number | number[]

  /**
   * Should a .gitignore be added to the recording directory
   * - true: Add (default)
   * - false: Do not add
   *
   * 是否在录制目录中添加 .gitignore
   * - true: 添加（默认）
   * - false: 不添加
   *
   * @default true
   */
  gitignore?: boolean
}

export interface RecordedMeta {
  /**
   * Recording timestamp
   *
   * 录制数据创建时间戳
   */
  timestamp: number

  /**
   * Recorded data create time
   *
   * 录制数据创建时间
   */
  createAt: string
  /**
   * Recorded data file path
   *
   * 录制数据文件路径
   */
  filepath: string

  /**
   * Reference the source of the original request
   *
   * 对原始请求的来源引用
   */
  referer?: string
}

export interface RecordedReq {
  /**
   * Request method
   *
   * 请求方法
   */
  method: string
  /**
   * Request pathname
   *
   * 请求路径
   */
  pathname: string
  /**
   * Request query parameters
   *
   * 请求参数
   */
  query: Record<string, any>
  /**
   * Request body
   *
   * 请求体
   */
  body: unknown
  /**
   * Request body type
   *
   * 请求体类型
   */
  bodyType: string
}

export interface RecordedRes {
  /**
   * Response status code
   *
   * 响应状态码
   */
  status: number
  /**
   * Response status text
   *
   * 响应状态文本
   */
  statusText: string
  /**
   * Response headers
   *
   * 响应头
   */
  headers: Record<string, string>
  /**
   * Response body
   *
   * 响应体
   */
  body: string
}

/**
 * Recorded request data structure
 *
 * 录制的请求数据结构
 */
export interface RecordedRequest {
  /**
   * Recorded request metadata
   *
   * 录制请求元数据
   */
  meta: RecordedMeta
  /**
   * Recorded request data
   *
   * 录制请求数据
   */
  req: RecordedReq
  /**
   * Recorded response data
   *
   * 录制响应数据
   */
  res: RecordedRes
}

/**
 * Resolved record options with all fields required
 *
 * 解析后的录制配置选项，所有字段为必填
 */
export interface ResolvedRecordOptions extends Omit<Required<RecordOptions>, 'status'> {
  cwd: string
  status: number[]
}
