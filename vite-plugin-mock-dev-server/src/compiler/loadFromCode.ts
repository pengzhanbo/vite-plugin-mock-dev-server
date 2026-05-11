import fs, { promises as fsp } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { attemptAsync } from '@pengzhanbo/utils'
import { getHash } from '../utils'

interface LoadFromCodeOptions {
  filepath: string
  code: string
  isESM: boolean
  cwd: string
}

/**
 * 在一些 IDE 中，如果有使用到 vite 相关上下游的扩展，可能会加载执行 vite 配置，
 * 导致插件的非预期的情况下被执行。
 * 这可能会导致插件在错误的环境下被调用，生成临时文件后没有及时删除。
 * 因此，在进程退出时，需要清理临时文件，确保没有遗留的临时文件。
 */
const TEMP_FILES = new Set<string>()

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
  TEMP_FILES.add(filepathTmp)
  const [, mod] = await attemptAsync(importDefault, String(pathToFileURL(filepathTmp)))
  await attemptAsync(unlink, filepathTmp)
  return mod
}

async function importDefault(filepath: string): Promise<any> {
  const mod = await import(filepath)
  return mod.default || mod
}

async function unlink(filepath: string) {
  await fsp.unlink(filepath)
  TEMP_FILES.delete(filepath)
}

async function cleanupTempFiles() {
  for (const filepath of TEMP_FILES) {
    if (fs.existsSync(filepath))
      await attemptAsync(fsp.unlink, filepath)
  }
}

// 在进程退出时，清理临时文件
process.on('exit', cleanupTempFiles)
