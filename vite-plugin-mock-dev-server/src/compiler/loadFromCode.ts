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

type TerminateSignal = 'SIGINT' | 'SIGTERM'

/**
 * 处理终止信号。
 *
 * - 仅清理临时文件，不接管宿主的退出流程；
 * - 当该信号没有其它监听器时，恢复 Node.js 的默认终止行为（重新发送信号）；
 * - 当宿主已注册监听器时，保留其处理与清理流程，由宿主决定是否退出进程。
 *
 * @param signal 终止信号
 * @param exitCode 无法通过信号终止进程时的兜底退出码
 * @param handler 当前注册的信号处理函数，用于恢复默认行为前移除自身监听
 */
function handleSignal(signal: TerminateSignal, exitCode: number, handler: () => void): void {
  cleanupTempFiles()

  // 当前监听器仍在监听列表中，因此 > 1 表示存在其它监听器
  if (process.listenerCount(signal) > 1) {
    return
  }
  // 移除自身监听器后重新发送信号，以触发默认终止行为（包含正确的退出码）
  process.removeListener(signal, handler)
  process.kill(process.pid, signal)
  // 兜底：若信号无法终止当前进程，则使用约定的退出码退出
  process.exit(exitCode)
}

const onSigint = (): void => handleSignal('SIGINT', 130, onSigint)
const onSigterm = (): void => handleSignal('SIGTERM', 143, onSigterm)

// 在进程意外 退出/终止 时，清理临时文件
process.on('exit', cleanupTempFiles)
process.on('SIGINT', onSigint)
process.on('SIGTERM', onSigterm)
