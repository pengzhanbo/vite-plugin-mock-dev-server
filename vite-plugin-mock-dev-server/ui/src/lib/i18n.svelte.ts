import type { Locale, LocaleLanguage } from '../types'
import { store } from './store.svelte'

export const messages: Record<LocaleLanguage, Locale> = {
  'zh-CN': {
    dynamicPattern: '动态模式',
    staticPattern: '静态模式',
    launchEditor: '在编辑器中打开',
    test: '测试',
    send: '发送',
    disabled: '已禁用',
    enabled: '已启用',
  },
  'en-US': {
    dynamicPattern: 'Dynamic Pattern',
    staticPattern: 'Static Pattern',
    launchEditor: 'Launch in Editor',
    test: 'Test',
    send: 'Send',
    disabled: 'Disabled',
    enabled: 'Enabled',
  },
}

export function t(key: keyof Locale): string {
  return String(messages[store.locale]?.[key] || key)
}
