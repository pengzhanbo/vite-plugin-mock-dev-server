import type { LogLevel, LogType } from '../types'
import { isBoolean } from '@pengzhanbo/utils'
import ansis from 'ansis'

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
  debug: (msg: string, level?: boolean | LogLevel) => void
  /**
   * Info log
   *
   * 信息日志
   */
  info: (msg: string, level?: boolean | LogLevel) => void
  /**
   * Warning log
   *
   * 警告日志
   */
  warn: (msg: string, level?: boolean | LogLevel) => void
  /**
   * Error log
   *
   * 错误日志
   */
  error: (msg: string, level?: boolean | LogLevel) => void
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
export function createLogger(
  prefix: string,
  defaultLevel: LogLevel = 'info',
): Logger {
  prefix = `[${prefix}]`

  /**
   * Output log
   *
   * 输出日志
   */
  function output(type: LogType, msg: string, level: boolean | LogLevel) {
    level = isBoolean(level) ? (level ? defaultLevel : 'error') : level
    const thresh = logLevels[level]
    if (thresh >= logLevels[type]) {
      const method = type === 'info' || type === 'debug' ? 'log' : type
      const tag
        = type === 'debug'
          ? ansis.magenta.bold(prefix)
          : type === 'info'
            ? ansis.cyan.bold(prefix)
            : type === 'warn'
              ? ansis.yellow.bold(prefix)
              : ansis.red.bold(prefix)
      const format = `${ansis.dim(
        new Date().toLocaleTimeString(),
      )} ${tag} ${msg}`

      // eslint-disable-next-line no-console
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
