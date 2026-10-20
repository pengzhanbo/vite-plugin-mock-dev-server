import { useCallback, useEffect, useState } from 'react'

/**
 * Resolved color scheme of the playground
 *
 * 演练场使用的配色方案
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Local storage key of the manual choice
 *
 * 手动选择主题的存储键
 */
const STORAGE_KEY = 'mock-dev-server-theme'

/**
 * Read the persisted theme, if any
 *
 * 读取已持久化的主题
 *
 * @returns Persisted theme or `undefined` / 已保存的主题或 `undefined`
 */
function readStoredTheme(): ThemeMode | undefined {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : undefined
  } catch {
    return undefined
  }
}

/**
 * Resolve the initial theme from storage or the system preference
 *
 * 根据存储值或系统偏好解析初始主题
 *
 * @returns Initial theme / 初始主题
 */
function readInitialTheme(): ThemeMode {
  const stored = readStoredTheme()
  if (stored) {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Synchronize the `dark` class and `color-scheme` with the theme
 *
 * 将 `dark` 类名与 `color-scheme` 同步到主题
 *
 * @param theme - Theme to apply / 要应用的主题
 */
function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

/**
 * Theme state with a light / dark toggle
 *
 * 亮色 / 暗色主题状态
 *
 * @returns Theme controller / 主题控制器
 */
export function useTheme(): { theme: ThemeMode; toggleTheme: () => void } {
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key !== STORAGE_KEY) {
        return
      }
      if (event.newValue === 'light' || event.newValue === 'dark') {
        setTheme(event.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((previous) => {
      const next: ThemeMode = previous === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // 忽略隐私模式下不可用的 localStorage
        // Ignore unavailable localStorage in private mode
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
