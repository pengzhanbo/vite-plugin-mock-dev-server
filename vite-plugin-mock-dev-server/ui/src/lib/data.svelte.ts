import type { MockItem } from '../types'
import { fetchMockApi } from '../utils/fetch'
import { store } from './store.svelte'

export async function updateData() {
  const res = await fetchMockApi<MockItem[]>('list')
  const map: Record<string, MockItem[]> = {}
  for (const item of res) {
    const url = decodeURI(new URL(item.url, window.location.href).pathname)
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

let hash = ''
export async function setupData() {
  hash = (await fetchMockApi<{ hash: string }>('hot')).hash
  await updateData()

  setInterval(async () => {
    const current = (await fetchMockApi<{ hash: string }>('hot')).hash
    if (current !== hash) {
      hash = current
      await updateData()
    }
  }, 5000)
}

export async function modifyData(
  filepath: string,
  hash: string,
  item: Partial<Pick<MockItem, 'enabled' | 'delay'>> & { errorProbability?: number },
): Promise<void> {
  const res = await fetchMockApi<{ success: boolean }>('update', {
    method: 'POST',
    body: JSON.stringify({
      filepath,
      hash,
      ...item,
    }),
  })
  if (res.success) {
    await updateData()
  }
}
