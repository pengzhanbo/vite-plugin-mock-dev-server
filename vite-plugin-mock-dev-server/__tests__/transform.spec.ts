/**
 * Tests for mock file transform error logging
 *
 * Mock 文件编译错误日志测试
 */
import type { CompilerOptions } from '../src/compiler/types.js'
import process from 'node:process'
import { describe, expect, it, vi } from 'vitest'
import { transformWithEsbuild } from '../src/compiler/esbuild.js'
import { transformWithRolldown } from '../src/compiler/rolldown.js'

vi.mock('esbuild', () => ({
  build: vi.fn(async () => {
    throw new Error('boom')
  }),
}))

vi.mock('rolldown', () => ({
  build: vi.fn(async () => {
    throw new Error('boom')
  }),
}))

vi.mock('rolldown/experimental', () => ({
  viteAliasPlugin: vi.fn(() => ({ name: 'alias-plugin' })),
}))

const transforms: Array<[string, typeof transformWithEsbuild]> = [
  ['esbuild', transformWithEsbuild],
  ['rolldown', transformWithRolldown],
]

function createOptions(): CompilerOptions {
  return {
    isESM: true,
    define: {},
    alias: [],
    cwd: process.cwd(),
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  }
}

describe('transform error logging', () => {
  it.each(transforms)(
    'should report %s transform failures through logger instead of console',
    async (_, transform) => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const options = createOptions()

      const result = await transform('missing.mock.ts', options)

      const loggerError = vi.mocked(options.logger.error)
      expect(loggerError).toHaveBeenCalledTimes(1)
      expect(loggerError.mock.calls[0][0]).toContain('Failed to transform')
      expect(loggerError.mock.calls[0][0]).toContain('boom')
      expect(consoleError).not.toHaveBeenCalled()
      expect(result).toMatchObject({ code: '', externalDeps: [], internalDeps: [] })
      // 失败必须显式上报：仅凭空 `code` 无法与「合法空产物」区分
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('boom')

      consoleError.mockRestore()
    },
  )
})
