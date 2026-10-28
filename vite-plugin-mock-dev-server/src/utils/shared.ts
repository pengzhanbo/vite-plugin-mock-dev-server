import type { Debugger } from 'obug'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isPrimitive, slash } from '@pengzhanbo/utils'
import { createDebug } from 'obug'

export const customRequire: NodeJS.Require = createRequire(path.join(process.cwd(), 'fake.js'))

export function getDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl))
}

export const debug: Debugger = createDebug('vite:mock', { useColors: true })

/**
 * Marker used by the compiler for temporary ESM/CJS files.
 *
 * These files are created next to the mock file so that `import.meta.url` and
 * relative imports keep working, but they must be ignored by the Vite watcher and
 * the mock watcher. Otherwise every initial mock load looks like dozens of project
 * file changes and stalls Vite's HMR graph.
 *
 * 编译器生成临时 ESM/CJS 文件时使用的标记。
 *
 * 临时文件需要放在 mock 文件旁边，保证 `import.meta.url` 与相对导入仍然可用；
 * 但必须被 Vite watcher 与 mock watcher 忽略，否则首次加载 mock 会被当成大量
 * 项目文件变更，阻塞 Vite 的 HMR 图更新。
 */
export const MOCK_TEMP_FILE_MARK: string = '.vite-mock-tmp-'

/**
 * Match temporary mock files created by the compiler
 *
 * 匹配编译器生成的临时 mock 文件
 */
export const MOCK_TEMP_FILE_RE: RegExp = /\.vite-mock-tmp-[a-f0-9]+\.(?:mjs|cjs)$/

export function normalizePath(id: string): string {
  return slash(path.normalize(id))
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
 * Whether the current process runs under a test runner
 *
 * 当前进程是否运行在测试运行器中
 *
 * @param env - Environment variables to inspect / 需要检查的环境变量
 * @returns Whether it is a test environment / 是否是测试环境
 */
export function isTestEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'test' || env.VITEST != null || env.JEST_WORKER_ID != null
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

/**
 * Normalize a package name.
 *
 * 规范化包名。
 *
 * @param dep - Package name / 包名
 * @returns Normalized package name / 规范化后的包名
 */
export function normalizePackageName(dep: string): string {
  const [scope, name] = dep.split('/')
  if (scope[0] === '@') {
    return `${scope}/${name}`
  }
  return scope
}
