import type { LogLevel, LogType } from '../types'
import { isBoolean } from '@pengzhanbo/utils'
import colors from 'picocolors'

export interface Logger {
  debug: (msg: string, level?: boolean | LogLevel) => void
  info: (msg: string, level?: boolean | LogLevel) => void
  warn: (msg: string, level?: boolean | LogLevel) => void
  error: (msg: string, level?: boolean | LogLevel) => void
}

export const logLevels: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
}

export function createLogger(
  prefix: string,
  defaultLevel: LogLevel = 'info',
): Logger {
  prefix = `[${prefix}]`

  function output(type: LogType, msg: string, level: boolean | LogLevel) {
    level = isBoolean(level) ? (level ? defaultLevel : 'error') : level
    const thresh = logLevels[level]
    if (thresh >= logLevels[type]) {
      const method = type === 'info' || type === 'debug' ? 'log' : type
      const tag
        = type === 'debug'
          ? colors.magenta(colors.bold(prefix))
          : type === 'info'
            ? colors.cyan(colors.bold(prefix))
            : type === 'warn'
              ? colors.yellow(colors.bold(prefix))
              : colors.red(colors.bold(prefix))
      const format = `${colors.dim(
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
