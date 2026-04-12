function normalize(path: string) {
  return path.replace(/\/+/g, '/')
}

export interface MockFetchOptions extends RequestInit {
  query?: Record<string, any>
  baseURL?: string
}

export async function fetchMock(
  input: string,
  { query, baseURL = '', ...init }: MockFetchOptions = {},
) {
  const url = new URL(normalize(`${baseURL}/${input}`), window.location.origin)
  if (query) {
    Object.entries(query).forEach(([key, value]) => url.searchParams.append(key, value))
  }
  return fetch(url, init)
}

export async function fetchMockApi<T>(input: string, init?: MockFetchOptions): Promise<T> {
  const res = await fetchMock(input, {
    baseURL: normalize(`${import.meta.env.BASE_URL}/.vite-mock/api`),
    ...init,
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  try {
    return await res.json()
  }
  catch {
    throw new Error('Failed to parse response as JSON')
  }
}
