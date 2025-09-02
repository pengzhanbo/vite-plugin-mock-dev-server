import fs, { promises as fsp } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

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
  const filepathTmp = `${filepath}.timestamp-${Date.now()}${ext}`
  const file = pathToFileURL(filepathTmp).toString()
  await fsp.writeFile(filepathTmp, code, 'utf8')
  try {
    const mod = await import(file)
    return mod.default || mod
  }
  finally {
    try {
      fs.unlinkSync(filepathTmp)
    }
    catch {}
  }
}
