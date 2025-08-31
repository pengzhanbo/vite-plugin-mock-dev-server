import type { Readable, Stream } from 'node:stream'

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
