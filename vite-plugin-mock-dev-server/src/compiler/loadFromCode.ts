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
 * 标记插件自身注册的信号处理器。
 *
 * 使用 `Symbol.for` 以便同一进程内被重复加载/打包的模块实例共享同一标记，
 * 从而在判断监听器来源时不会把插件自身的处理器误判为宿主监听器。
 */
const PLUGIN_LISTENER_MARK = Symbol.for('vite-plugin-mock-dev-server:signal-listener')

/**
 * 进程级共享注册表。
 *
 * 模块可能被重复加载（多份 bundle、IDE 预加载等），因此使用挂载在 `globalThis`
 * 上的注册表，保证每个信号只存在一个进程级处理器，并汇总所有模块实例的清理函数。
 */
const SIGNAL_REGISTRY_KEY = Symbol.for('vite-plugin-mock-dev-server:signal-registry')

interface SignalRegistry {
  /** 各模块实例注册的临时文件清理函数 */
  cleanups: Set<() => void>
  /** 进程级单例信号处理器 */
  handlers: Partial<Record<TerminateSignal, () => void>>
}

function getSignalRegistry(): SignalRegistry {
  const holder = globalThis as unknown as Record<symbol, SignalRegistry | undefined>
  let registry = holder[SIGNAL_REGISTRY_KEY]
  if (!registry) {
    registry = { cleanups: new Set(), handlers: {} }
    holder[SIGNAL_REGISTRY_KEY] = registry
  }
  return registry
}

function isPluginListener(listener: unknown): boolean {
  return (
    typeof listener === 'function' &&
    (listener as unknown as Record<symbol, unknown>)[PLUGIN_LISTENER_MARK] === true
  )
}

/**
 * 处理终止信号。
 *
 * - 清理所有模块实例遗留的临时文件；
 * - 仅当该信号不存在外部（宿主）监听器时，恢复 Node.js 的默认终止行为；
 * - 存在宿主监听器时保留其处理与清理流程，由宿主决定是否退出进程。
 *
 * @param registry 进程级共享注册表
 * @param signal 终止信号
 * @param exitCode 无法通过信号终止进程时的兜底退出码
 */
function handleSignal(registry: SignalRegistry, signal: TerminateSignal, exitCode: number): void {
  for (const cleanup of registry.cleanups) {
    attempt(cleanup)
  }

  const listeners = process.listeners(signal)
  // 存在宿主注册的监听器时，不接管退出流程
  if (listeners.some((listener) => !isPluginListener(listener))) {
    return
  }
  // 移除全部插件自身监听器后重新发送信号，以触发默认终止行为（包含正确的退出码）
  for (const listener of listeners) {
    process.removeListener(signal, listener)
  }
  delete registry.handlers[signal]
  process.kill(process.pid, signal)
  // 兜底：若信号无法终止当前进程，则使用约定的退出码退出
  process.exit(exitCode)
}

/**
 * 注册进程级信号处理器，重复加载的模块实例复用同一个处理器。
 *
 * @param registry 进程级共享注册表
 * @param signal 终止信号
 * @param exitCode 无法通过信号终止进程时的兜底退出码
 */
function registerSignalHandler(
  registry: SignalRegistry,
  signal: TerminateSignal,
  exitCode: number,
): void {
  const registered = registry.handlers[signal]
  // 复用已注册的进程级处理器；宿主可能移除过监听器，此时需要重新注册
  if (registered && process.listeners(signal).includes(registered)) {
    return
  }
  const handler = (): void => handleSignal(registry, signal, exitCode)
  Object.defineProperty(handler, PLUGIN_LISTENER_MARK, { value: true })
  registry.handlers[signal] = handler
  process.on(signal, handler)
}

const signalRegistry = getSignalRegistry()
signalRegistry.cleanups.add(cleanupTempFiles)

// 在进程意外 退出/终止 时，清理临时文件
process.on('exit', cleanupTempFiles)
registerSignalHandler(signalRegistry, 'SIGINT', 130)
registerSignalHandler(signalRegistry, 'SIGTERM', 143)
