import { createHash } from 'node:crypto'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { attemptAsync } from '@pengzhanbo/utils'

interface LoadFromCodeOptions {
  filepath: string
  code: string
  isESM: boolean
  cwd: string
}

export async function loadFromCode<T = any>({
  filepath,
  code,
  isESM,
  cwd,
}: LoadFromCodeOptions): Promise<T | { [key: string]: T }> {
  filepath = path.resolve(cwd, filepath)
  const ext = isESM ? '.mjs' : '.cjs'
  const filepathTmp = `${filepath}.${getHash(code)}${ext}`
  await fsp.writeFile(filepathTmp, code, 'utf8')
  const [, mod] = await attemptAsync(importDefault, String(pathToFileURL(filepathTmp)))
  await attemptAsync(fsp.unlink, filepathTmp)
  return mod
}

async function importDefault(filepath: string): Promise<any> {
  const mod = await import(filepath)
  return mod.default || mod
}

function getHash(str: string): string {
  return createHash('md5').update(str).digest('hex')
}
