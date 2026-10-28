import type { Readable, Stream } from 'node:stream'
import { LRUCache, attempt } from '@pengzhanbo/utils'
import { customRequire } from './shared.js'

export function isStream(stream: unknown): stream is Stream {
  return stream != null && typeof stream === 'object' && typeof (stream as any).pipe === 'function'
}

export function isReadableStream(stream: unknown): stream is Readable {
  return (
    isStream(stream) &&
    (stream as any).readable !== false &&
    typeof (stream as any)._read === 'function' &&
    typeof (stream as any)._readableState === 'object'
  )
}

const PACKAGE_CACHE = new LRUCache<string, boolean>({ maxSize: 1024 })

/**
 * 检查包是否存在
 *
 * @param mod 包名
 * @returns 包是否存在
 */
export function isPackageExists(mod: string): boolean {
  if (PACKAGE_CACHE.has(mod)) {
    return PACKAGE_CACHE.get(mod)!
  }

  const [err, resolved] = attempt(() => import.meta.resolve(mod))
  let isExists = err ? false : !!resolved
  if (!isExists) {
    attempt(() => (isExists = !!customRequire.resolve(mod)))
  }
  PACKAGE_CACHE.set(mod, isExists)
  return isExists
}

/**
 * 判断内容类型是否为文本类型
 *
 * @param contentType 内容类型
 * @returns 是否为文本类型
 */
export function isTextContent(contentType: string): boolean {
  return ['text', 'json', 'xml'].some((type) => contentType.includes(type))
}
