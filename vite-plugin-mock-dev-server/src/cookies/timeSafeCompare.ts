import type { Buffer } from 'node:buffer'
import crypto from 'node:crypto'

function bufferEqual(a: Buffer<ArrayBuffer>, b: Buffer<ArrayBuffer>): boolean {
  if (a.length !== b.length)
    return false

  if (crypto.timingSafeEqual)
    return crypto.timingSafeEqual(a, b)

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

function createHmac(key: crypto.BinaryLike | crypto.KeyObject, data: string): Buffer<ArrayBuffer> {
  return crypto.createHmac('sha256', key).update(data).digest()
}

export function timeSafeCompare(a: string, b: string): boolean {
  const sa = String(a)
  const sb = String(b)
  const key = crypto.randomBytes(32)

  return bufferEqual(createHmac(key, sa), createHmac(key, sb)) && a === b
}
