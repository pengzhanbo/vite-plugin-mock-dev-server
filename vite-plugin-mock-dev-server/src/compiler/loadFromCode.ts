import type { Logger } from '../core/logger.js'
import fs, { promises as fsp } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { attempt, attemptAsync } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { formatError, getHash, MOCK_TEMP_FILE_MARK } from '../utils/index.js'

interface LoadFromCodeOptions {
  filepath: string
  code: string
  isESM: boolean
  cwd: string
  logger: Logger
}

/**
 * 在一些 IDE 中，如果有使用到 vite 相关上下游的扩展，可能会加载执行 vite 配置，
 * 导致插件的非预期的情况下被执行。
 * 这可能会导致插件在错误的环境下被调用，生成临时文件后没有及时删除。
 * 因此，在进程退出时，需要清理临时文件，确保没有遗留的临时文件。
 *
 * 这只是一种兜底策略，实际上在某些 IDE 中能否清理存疑。
 */
const TEMP_FILES = new Set<string>()

export async function loadFromCode<T = any>({
  filepath,
  code,
  isESM,
  cwd,
  logger,
}: LoadFromCodeOptions): Promise<T | { [key: string]: T }> {
  const dirname = path.dirname(path.resolve(cwd, filepath))
  const ext = isESM ? '.mjs' : '.cjs'
  const filepathTmp = `${dirname}/${MOCK_TEMP_FILE_MARK}${getHash(code)}${ext}`
  await fsp.writeFile(filepathTmp, code, 'utf8')
  TEMP_FILES.add(filepathTmp)
  const [error, mod] = await attemptAsync<any>(importDefault, String(pathToFileURL(filepathTmp)))
  await attemptAsync(unlink, filepathTmp)
  if (error) {
    logger.error(
      `Failed to load mock configuration from ${ansis.yellow.underline(filepath)}:\n${formatError(error)}`,
    )
    throw error
  }
  return mod
}

async function importDefault(filepath: string): Promise<any> {
  const mod = await import(filepath)
  return mod.default ?? mod
}

async function unlink(filepath: string): Promise<void> {
  await fsp.unlink(filepath)
  TEMP_FILES.delete(filepath)
}

/**
 * 清理当前进程遗留的临时文件
 */
function cleanupTempFiles(): void {
  for (const filepath of TEMP_FILES) {
    if (fs.existsSync(filepath)) {
      attempt(fs.unlinkSync, filepath)
    }
  }
  TEMP_FILES.clear()
}

// 在进程意外 退出/终止 时，清理临时文件
process.on('exit', cleanupTempFiles)
process.on('SIGINT', () => {
  cleanupTempFiles()
  process.kill(process.pid, 'SIGINT')
  process.exit(130)
})
process.on('SIGTERM', () => {
  cleanupTempFiles()
  process.kill(process.pid, 'SIGTERM')
  process.exit(143)
})
