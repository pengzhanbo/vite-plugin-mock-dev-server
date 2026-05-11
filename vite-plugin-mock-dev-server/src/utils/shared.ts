import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPrimitive } from '@pengzhanbo/utils'
import Debug from 'debug'

export function getDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl))
}

export const debug: Debug.Debugger = Debug('vite:mock-dev-server')

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
  }
  else {
    str = JSON.stringify(str)
  }
  return createHash('md5').update(Buffer.from(str as string)).digest('hex')
}
