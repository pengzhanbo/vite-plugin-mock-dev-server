import type { KeyValue } from '../types'

export function keyValueToObj(keyValue?: KeyValue[]): Record<string, string> {
  if (!keyValue || keyValue.length === 0)
    return {}
  return Object.fromEntries(keyValue
    .map(({ key, value, type }) => type === 'text' ? [key, value] : null)
    .filter(Boolean) as [string, string][],
  )
}

export function keyValueToForm(keyValue?: KeyValue[]): FormData {
  if (!keyValue || keyValue.length === 0)
    return new FormData()
  const formData = new FormData()
  keyValue.forEach(({ key, value }) => {
    if (typeof value === 'string') {
      formData.append(key, value)
    }
    else if (value instanceof FileList) {
      for (const file of value)
        formData.append(key, file)
    }
  })
  return formData
}

export function keyValueToUrlSearchParams(url: string, keyValue?: KeyValue[]): string {
  if (!keyValue || keyValue.length === 0)
    return url
  const u = new URL(url, window.location.origin)
  keyValue.forEach(({ key, value, type }) =>
    type === 'text' && key && u.searchParams.append(key, value as string),
  )
  const params = u.searchParams.toString()
  return `${u.pathname}${params ? `?${params}` : ''}`
}

export function objToKeyValue(obj?: Record<string, string>): KeyValue[] {
  if (!obj)
    return []
  return Object.entries(obj).map(([key, value]) => ({ key, value, type: 'text' }))
}
