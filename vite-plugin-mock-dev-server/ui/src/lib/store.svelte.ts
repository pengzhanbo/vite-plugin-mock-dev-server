import type { AppStore } from '../types'
import { onMount } from 'svelte'
import { safeJsonParse } from '../utils/safeParse'

export const store: AppStore = $state({
  locale: 'en-US',
  appearance: 'light',
  mockList: [],
  active: '',
  testing: null,
})

const STORE_KEY = 'vite-mock-dev-server:store'

export function setupStore() {
  const raw = window.localStorage.getItem(STORE_KEY) || '{}'
  const parsed = safeJsonParse<AppStore>(raw)
  store.appearance = parsed.appearance || 'auto'
  store.locale = parsed.locale || 'en-US'
  store.active = parsed.active || ''

  onMount(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORE_KEY) {
        const parsed = safeJsonParse<AppStore>(event.newValue || '{}')
        store.appearance = parsed.appearance || 'auto'
        store.locale = parsed.locale || 'en-US'
        store.active = parsed.active || ''
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  })

  $effect(() => {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({
      appearance: store.appearance,
      locale: store.locale,
      active: store.active,
    }))
  })

  $effect(() => {
    document.documentElement.lang = store.locale
  })

  $effect(() => {
    document.documentElement.classList.remove('dark', 'light')
    if (store.appearance === 'auto') {
      const matched = matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.add(matched ? 'dark' : 'light')
    }
    else {
      document.documentElement.classList.add(store.appearance)
    }
  })

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (store.appearance === 'auto') {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(event.matches ? 'dark' : 'light')
    }
  })
}
