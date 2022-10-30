export const isArray = <T = any>(val: unknown): val is T[] => Array.isArray(val)

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export function sleep(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}
