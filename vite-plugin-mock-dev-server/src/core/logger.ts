import type { LogLevel, LogType } from '../types/index.js'
import { isBoolean } from '@pengzhanbo/utils'
import ansis from 'ansis'

/**
 * Log message, either a string or a factory for building it lazily
 *
 * 日志消息，字符串或惰性构建消息的工厂函数
 *
 * The factory form is only evaluated when the log level allows the message to be
 * output. It is meant for messages whose formatting costs something (string
 * concatenation, `JSON.stringify`, `new URL`, colorizing...) so that they are not
 * built at all when the log is filtered out.
 *
 * 工厂函数形式只有在日志级别允许输出时才会被求值，用于格式化存在开销的消息
 * （字符串拼接、`JSON.stringify`、`new URL`、着色等），
 * 使日志被级别过滤时完全不产生构建开销。
 */
export type LogMessage = string | (() => string)

/**
 * Logger interface
 *
 * 日志接口
 */
export interface Logger {
  /**
   * Debug log
   *
   * 调试日志
   */
  debug: (msg: LogMessage, level?: boolean | LogLevel) => void
  /**
   * Info log
   *
   * 信息日志
   */
  info: (msg: LogMessage, level?: boolean | LogLevel) => void
  /**
   * Warning log
   *
   * 警告日志
   */
  warn: (msg: LogMessage, level?: boolean | LogLevel) => void
  /**
   * Error log
   *
   * 错误日志
   */
  error: (msg: LogMessage, level?: boolean | LogLevel) => void
}

/**
 * Log levels mapping
 *
 * 日志级别映射
 */
export const logLevels: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
}

/**
 * Create logger instance
 *
 * 创建日志实例
 *
 * @param prefix - Log prefix / 日志前缀
 * @param defaultLevel - Default log level / 默认日志级别
 * @returns Logger instance / 日志实例
 */
export function createLogger(prefix: string, defaultLevel: LogLevel = 'info'): Logger {
  prefix = `[${prefix}]`

  /**
   * Output log
   *
   * 输出日志
   *
   * @param type - Log type / 日志类型
   * @param msg - Log message / 日志消息
   * @param level - Log level / 日志级别
   */
  function output(type: LogType, msg: LogMessage, level: boolean | LogLevel): void {
    level = isBoolean(level) ? (level ? defaultLevel : 'error') : level
    const thresh = logLevels[level]
    if (thresh >= logLevels[type]) {
      const method = type === 'info' || type === 'debug' ? 'log' : type
      const tag =
        type === 'debug'
          ? ansis.magenta.bold(prefix)
          : type === 'info'
            ? ansis.cyan.bold(prefix)
            : type === 'warn'
              ? ansis.yellow.bold(prefix)
              : ansis.red.bold(prefix)
      // 惰性消息只在确认需要输出后才求值，日志被过滤时不产生格式化开销
      // Lazy messages are only evaluated once the log is known to be output
      const message = typeof msg === 'function' ? msg() : msg
      const format = `${ansis.dim(new Date().toLocaleTimeString())} ${tag} ${message}`
      console[method](format)
    }
  }
  const logger: Logger = {
    debug(msg, level = defaultLevel) {
      output('debug', msg, level)
    },
    info(msg, level = defaultLevel) {
      output('info', msg, level)
    },
    warn(msg, level = defaultLevel) {
      output('warn', msg, level)
    },
    error(msg, level = defaultLevel) {
      output('error', msg, level)
    },
  }

  return logger
}

/**
 * 根据插件的 `log` 配置项创建日志实例
 *
 * 插件的多个环节（选项解析、请求录制）在不同生命周期中需要同一个语义的 logger，
 * 集中在此处解析，避免各自重复解释 `log` 的布尔值含义。
 *
 * @param log - `log` option of the plugin / 插件的 `log` 配置项
 * @returns Logger instance / 日志实例
 */
export function createMockLogger(log?: boolean | LogLevel): Logger {
  return createLogger('vite:mock', isBoolean(log) ? (log ? 'info' : 'error') : log)
}
