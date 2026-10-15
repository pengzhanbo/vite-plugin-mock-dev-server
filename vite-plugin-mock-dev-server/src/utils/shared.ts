import type { Debugger } from 'obug'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPrimitive } from '@pengzhanbo/utils'
import { createDebug } from 'obug'

export function getDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl))
}

export const debug: Debugger = createDebug('vite:mock', { useColors: true })

const windowsSlashRE = /\\/g
const isWindows = os.platform() === 'win32'

export function slash(p: string): string {
  return p.replace(windowsSlashRE, '/')
}
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

export function getHash(str: unknown): string {
  if (isPrimitive(str)) {
    str = String(str)
  } else {
    str = JSON.stringify(str)
  }
  return createHash('md5')
    .update(Buffer.from(str as string))
    .digest('hex')
}

/**
 * Format an unknown error into a readable message, including its stack if available.
 *
 * 将未知错误格式化为可读信息，若存在堆栈则一并包含。
 *
 * @param error - Unknown error / 未知错误
 * @returns Formatted error message / 格式化后的错误信息
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message
  }
  return String(error)
}
