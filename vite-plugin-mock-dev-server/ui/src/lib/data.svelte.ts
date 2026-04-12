import type { MockItem } from '../types'
import { fetchMockApi } from '../utils/fetch'
import { store } from './store.svelte'

export async function updateData() {
  const res = await fetchMockApi<MockItem[]>('list')
  const map: Record<string, MockItem[]> = {}
  for (const item of res) {
    const url = decodeURI(new URL(item.url, 'http://a.com/').pathname)
    if (!map[url]) {
      map[url] = []
    }
    map[url].push(item)
  }
  store.mockList = Object.entries(map)
  const urls = Object.keys(map)
  if (!store.active || !urls.includes(store.active)) {
    store.active = urls[0] || ''
  }
}

export function setupData() {
  updateData()
}
