import type { Readable, Stream } from 'node:stream'
import { hasOwn } from '@pengzhanbo/utils'

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

const PACKAGE_CACHE: Record<string, boolean> = {}

export async function isPackageExists(mod: string): Promise<boolean> {
  if (hasOwn(PACKAGE_CACHE, mod)) {
    return PACKAGE_CACHE[mod]
  }
  try {
    // @ts-expect-error fallback for node
    if (import.meta.resolve) {
      PACKAGE_CACHE[mod] = !!import.meta.resolve(mod)
    }
    else {
      await import(mod)
      PACKAGE_CACHE[mod] = true
    }
    return PACKAGE_CACHE[mod]
  }
  catch {}
  PACKAGE_CACHE[mod] = false
  return false
}
