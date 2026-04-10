import type { Appearance } from '../types'
import { store } from './store.svelte'

const map: Record<Appearance, Appearance> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
}
export function toggleAppearance() {
  store.appearance = map[store.appearance]
}
