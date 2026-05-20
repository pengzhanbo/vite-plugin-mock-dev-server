import type { Readable, Stream } from 'node:stream'
import { createRequire } from 'node:module'
import process from 'node:process'
import { LRUCache } from '@pengzhanbo/utils'

export function isStream(stream: unknown): stream is Stream {
  return stream !== null
    && typeof stream === 'object'
    && typeof (stream as any).pipe === 'function'
}

export function isReadableStream(stream: unknown): stream is Readable {
  return isStream(stream)
    && (stream as any).readable !== false
    && typeof (stream as any)._read === 'function'
    && typeof (stream as any)._readableState === 'object'
}

const PACKAGE_CACHE = new LRUCache<string, boolean>({ maxSize: 1024 })
const require = createRequire(process.cwd())

export function isPackageExists(mod: string): boolean {
  if (PACKAGE_CACHE.has(mod)) {
    return PACKAGE_CACHE.get(mod)!
  }

  let isExists = false
  try {
    // @ts-expect-error fallback for node
    if (import.meta.resolve) {
      isExists = !!import.meta.resolve(mod)
    }
    else {
      require.resolve(mod)
      isExists = true
    }
  }
  catch {}
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
  return ['text', 'json', 'xml'].some(type => contentType.includes(type))
}
