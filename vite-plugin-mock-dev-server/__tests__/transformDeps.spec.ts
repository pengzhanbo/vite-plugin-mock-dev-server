/**
 * Tests for the internal dependency collection of both bundler channels
 *
 * 两条打包通道的内部依赖采集测试
 *
 * The dependency list drives the dependency watcher: a module missing from it
 * silently stops triggering the re-compilation of the mock files importing it.
 * A dependency whose code is fully inlined into the entry chunk is the tricky
 * case — rolldown reports it neither in `chunk.moduleIds` nor in `chunk.modules`
 * (M5), while esbuild reports every input in its metafile.
 *
 * 依赖列表驱动依赖监视器：列表里缺失的模块会让「依赖变更 → 引用方重新编译」
 * 静默失效。代码被完全内联进入口 chunk 的依赖是最棘手的情况 ——
 * rolldown 既不会把它列在 `chunk.moduleIds` 中，也不会列在 `chunk.modules` 中（M5），
 * 而 esbuild 的 metafile 会完整列出所有输入。
 */
import type { CompilerOptions, TransformResult } from '../src/compiler/types.js'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transformWithEsbuild } from '../src/compiler/esbuild.js'
import { transformWithRolldown } from '../src/compiler/rolldown.js'
import { isPackageExists } from '../src/utils/index.js'

const ENTRY = 'mock/a.mock.ts'
/**
 * A dependency whose code is fully inlined into the entry chunk
 *
 * 代码会被完全内联进入口 chunk 的依赖
 */
const INLINE_DEP = 'mock/constants.ts'
/**
 * A dependency that stays in the output chunk
 *
 * 会保留在输出 chunk 中的依赖
 */
const KEPT_DEP = 'mock/helper.ts'
const EXTERNAL_PKG = 'mime-types'
const hasExternalPkg = isPackageExists(EXTERNAL_PKG)

const INLINE_DEP_CODE = `export const version = 1\n`
const KEPT_DEP_CODE = `export function createMock(url: string): any {\n  return { url, method: 'GET', body: { source: 'helper' } }\n}\n`

/**
 * Entry code importing both kinds of dependencies (and an external package)
 *
 * 同时引入两类依赖（以及一个外部包）的入口代码
 *
 * The constant is only used in a value position (an object property shorthand),
 * which is what makes rolldown fold it into the entry chunk and drop its module
 * from the output.
 *
 * 常量只用在值位置上（对象属性简写），这正是 rolldown 把它折叠进入口 chunk、
 * 并从产物中丢弃其模块的原因。
 *
 * @returns Mock file source / mock 文件源码
 */
function entryCode(): string {
  return `import { version } from './constants.js'
import { createMock } from './helper.js'
${hasExternalPkg ? `import mimeTypes from '${EXTERNAL_PKG}'\n` : ''}export default [createMock('/api/a'), { url: '/api/a', method: 'GET', body: { version${
    hasExternalPkg ? ', mime: typeof mimeTypes' : ''
  } } }]
`
}

function createOptions(cwd: string): CompilerOptions {
  return {
    isESM: true,
    define: {},
    alias: [],
    cwd,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  }
}

interface BundlerChannel {
  /** Channel name used in the test titles / 用例名称中的通道名 */
  name: string
  transform: (entry: string, options: CompilerOptions) => Promise<TransformResult>
  /**
   * Whether the channel folds the constant module into the entry chunk, which
   * is the premise of the inlined dependency case
   *
   * 该通道是否把常量模块折叠进入口 chunk，即内联依赖用例的前提
   */
  foldsConstants: boolean
}

const channels: BundlerChannel[] = [
  { name: 'rolldown', transform: transformWithRolldown, foldsConstants: true },
  { name: 'esbuild', transform: transformWithEsbuild, foldsConstants: false },
]

describe.skipIf(!isPackageExists('rolldown') || !isPackageExists('esbuild'))(
  'transform internal deps',
  () => {
    let cwd: string

    beforeEach(async () => {
      // `realpath` keeps `cwd` identical to the paths resolved by the bundler:
      // on macOS `tmpdir()` is a symlink to `/private/var/...`
      // `realpath` 让 `cwd` 与打包器解析出的路径保持一致：
      // macOS 上的 `tmpdir()` 是指向 `/private/var/...` 的软链接
      cwd = await realpath(await mkdtemp(path.join(tmpdir(), 'vite-mock-deps-')))
      await mkdir(path.join(cwd, 'mock'), { recursive: true })
      await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ type: 'module' }))
      await writeFile(path.join(cwd, INLINE_DEP), INLINE_DEP_CODE)
      await writeFile(path.join(cwd, KEPT_DEP), KEPT_DEP_CODE)
      await writeFile(path.join(cwd, ENTRY), entryCode())
    })

    afterEach(async () => {
      await rm(cwd, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
    })

    it.each(channels)(
      'should collect a fully inlined dependency through $name',
      async ({ transform, foldsConstants }) => {
        const result = await transform(ENTRY, createOptions(cwd))

        if (foldsConstants) {
          // Guard the premise of this case: the constant has to be folded into
          // the entry, otherwise its module stays in the output chunk and would
          // be collected even without reading the module graph
          // 守卫本用例的前提：常量必须真的被折叠进入口代码，
          // 否则其模块仍留在输出 chunk 中，不读模块图也能采集到
          expect(result.code).toMatch(/version:\s*1/)
        }
        // The module is inlined, so it must be collected from the module graph
        // rather than from the output chunk
        // 该模块已被内联，因此必须从模块图而非输出 chunk 中采集
        expect(result.internalDeps).toContain(INLINE_DEP)
      },
    )

    it.each(channels)('should collect a kept dependency through $name', async ({ transform }) => {
      const result = await transform(ENTRY, createOptions(cwd))

      expect(result.internalDeps).toContain(KEPT_DEP)
    })

    it.each(channels)(
      'should report dependencies relative to cwd and skip the entry itself through $name',
      async ({ transform }) => {
        const result = await transform(ENTRY, createOptions(cwd))

        expect(result.internalDeps).not.toContain(ENTRY)
        expect(result.internalDeps.every((dep) => !path.isAbsolute(dep))).toBe(true)
        expect(result.internalDeps.every((dep) => dep.startsWith('mock/'))).toBe(true)
      },
    )

    for (const { name, transform } of channels) {
      it.skipIf(!hasExternalPkg)(
        `should not collect external packages through ${name}`,
        async () => {
          const result = await transform(ENTRY, createOptions(cwd))

          // External modules are not part of the bundle, so they must not show up
          // in the dependency list (they would be watched inside `node_modules`)
          // 外部模块不参与打包，因此不应出现在依赖列表中（否则会去监视 `node_modules`）
          expect(result.externalDeps).toContain(EXTERNAL_PKG)
          expect(result.internalDeps.some((dep) => dep.includes('node_modules'))).toBe(false)
        },
      )
    }
  },
)
