import { useCallback, useState } from 'react'

/**
 * Log lines with append and clear helpers
 *
 * 带追加与清空能力的日志行
 */
export interface LogController {
  lines: string[]
  append: (message: string) => void
  clear: () => void
}

/**
 * Create a bounded log state
 *
 * 创建有上限的日志状态
 *
 * @param limit - Maximum retained lines / 最大保留行数
 * @returns Log controller / 日志控制器
 */
export function useLog(limit = 200): LogController {
  const [lines, setLines] = useState<string[]>([])

  const append = useCallback(
    (message: string): void => {
      const time = new Date().toLocaleTimeString()
      setLines((previous) => [...previous.slice(-(limit - 1)), `[${time}] ${message}`])
    },
    [limit],
  )

  const clear = useCallback((): void => {
    setLines([])
  }, [])

  return { lines, append, clear }
}
