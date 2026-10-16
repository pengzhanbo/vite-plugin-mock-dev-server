/**
 * Integration tests for the compiler file watcher
 *
 * 编译器文件监视器集成测试
 *
 * These tests drive a real `Compiler` with a real chokidar watcher and a real
 * temporary mock directory, covering the add / change / unlink lifecycle and the
 * cache bookkeeping (`moduleCache` / `moduleDeps`) that a pure function test
 * cannot reach.
 *
 * 这些用例使用真实的 chokidar 监视器与真实的临时 mock 目录驱动 `Compiler`，
 * 覆盖 add / change / unlink 生命周期以及纯函数测试无法触及的缓存记账
 * （`moduleCache` / `moduleDeps`）。
 */
import type { FSWatcher } from 'chokidar'
import type { ResolvedMockServerPluginOptions } from '../src/core/options.js'
import type { MockHttpItem } from '../src/types/index.js'
import { mkdir, mkdtemp, realpath, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Compiler } from '../src/compiler/compiler.js'

/**
 * Gate that can hold the result of a finished compilation, so that a test can
 * interleave a file deletion with a compilation that is still in flight
 *
 * 用于暂挂已完成编译结果的闸门，使测试能够把文件删除插入到仍在进行中的编译之间
 */
const compileGate = vi.hoisted(() => ({
  /** Whether finished compilations are held / 是否暂挂已完成的编译 */
  enabled: false,
  /** Number of held compilations / 被暂挂的编译数量 */
  held: 0,
  /** Number of released compilations / 已释放的编译数量 */
  released: 0,
  /** Resolvers of the held compilations / 被暂挂编译的释放回调 */
  waiters: [] as Array<() => void>,
}))

// The gate wraps the real implementation: the compilation itself runs normally,
// only its result is withheld from the compiler
// 闸门包裹真实实现：编译本身照常执行，仅把结果暂不交还给编译器
vi.mock('../src/compiler/compile.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/compiler/compile.js')>()
  return {
    compile: async (...args: Parameters<typeof actual.compile>) => {
      const result = await actual.compile(...args)
      if (compileGate.enabled) {
        compileGate.held++
        await new Promise<void>((resolve) => compileGate.waiters.push(resolve))
        compileGate.released++
      }
      return result
    },
  }
})

const DIR = 'mock'
const SHARED_DEP = `${DIR}/shared.ts`
const CHANGED_BODY = { name: 'changed' }
const TEST_TIMEOUT = 20_000
const WAIT_TIMEOUT = 10_000

/**
 * Shared module imported by a mock file, parameterized by version
 *
 * 被 mock 文件引入的共享模块，按版本参数化
 *
 * It exports a plain constant on purpose: a module whose code is fully inlined
 * into the entry chunk is not reported in the output chunk (`chunk.moduleIds`),
 * so the constant keeps the M5 regression (dependencies collected from the
 * output chunk only) detectable here, in the real watcher pipeline, instead of
 * only in the unit test of the bundler channel.
 *
 * 它刻意导出一个纯常量：被完全内联进入口 chunk 的模块不会出现在输出 chunk
 * （`chunk.moduleIds`）中，因此常量能让 M5 的回归（只从输出 chunk 采集依赖）
 * 在真实的监视器链路中同样可被检出，而不只是在打包通道的单元测试里。
 *
 * @param version - Version rendered into the mock body / 写入 mock body 的版本号
 * @returns Shared module source / 共享模块源码
 */
function sharedDepCode(version: number): string {
  return `export const version = ${version}\n`
}

const SHARED_DEP_CODE = sharedDepCode(1)

const MOCK_WITH_DEP_CODE = `import { version } from './shared.js'
export default [{ url: '/api/a', method: 'GET', body: { name: '/api/a', version } }]
`

const SHARED_MOCK = `${DIR}/shared.mock.ts`
const MOCK_IMPORTING_MOCK = `import { createMock } from './shared.mock.js'
export default [createMock('b')]
`

/**
 * Another mock file imported by a mock file, parameterized by version
 *
 * 被 mock 文件引入的另一个 mock 文件，按版本参数化
 *
 * @param version - Version rendered into the mock body / 写入 mock body 的版本号
 * @returns Mock file source / mock 文件源码
 */
function sharedMockCode(version: number): string {
  return `export function createMock(name: string): any {
  return { url: '/api/' + name, method: 'GET', body: { name, version: ${version} } }
}
export default [{ url: '/api/shared', method: 'GET', body: { name: 'shared', version: ${version} } }]
`
}

interface LoggerStub {
  debug: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
}

function createLogger(): LoggerStub {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

function createOptions(cwd: string, logger: LoggerStub): ResolvedMockServerPluginOptions {
  return {
    cwd,
    dir: DIR,
    include: ['**/*.mock.ts'],
    exclude: [],
    define: {},
    alias: [],
    logger,
  } as unknown as ResolvedMockServerPluginOptions
}

/**
 * Read the body of a mock item registered for the given url
 *
 * 读取指定 url 上 mock 条目的 body
 *
 * Returns `undefined` while the rule is not registered (a mock file may be
 * transiently absent from the data between two updates), so that it can be used
 * inside polling assertions.
 *
 * 规则未注册时返回 `undefined`（两次更新之间 mock 文件可能短暂从数据中消失），
 * 因此可以在轮询断言中安全使用。
 *
 * @param compiler - Compiler instance / 编译器实例
 * @param url - Mock url / mock url
 * @param index - Index of the mock item / mock 条目下标
 * @returns The mock body, if registered / mock body（若已注册）
 */
function bodyOf(compiler: Compiler, url: string, index = 0): MockHttpItem['body'] | undefined {
  return (compiler.mockData[url]?.[index] as MockHttpItem | undefined)?.body
}

function mockFileCode(url: string, body: Record<string, unknown> = {}): string {
  return `export default [{ url: '${url}', method: 'GET', body: ${JSON.stringify(body)} }]\n`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitFor(assertion: () => boolean, message: string): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < WAIT_TIMEOUT) {
    if (assertion()) {
      return
    }
    await delay(50)
  }
  throw new Error(`Timed out waiting for: ${message}`)
}

function waitForReady(watcher: FSWatcher): Promise<void> {
  return new Promise((resolve) => watcher.once('ready', () => resolve()))
}

/**
 * Wait until the given counter stopped changing for a quiet period
 *
 * 等待计数器在静默期内不再变化
 *
 * The watcher may deliver more than one event per write (and chokidar delays
 * unlink events to detect atomic writes), so measurements have to be taken
 * after the previous events have been fully processed.
 *
 * 监视器对一次写入可能发出多个事件（且 chokidar 会延迟 unlink 事件以识别原子写），
 * 因此需要在先前事件处理完毕后再进行测量。
 *
 * @param read - Reader of the current counter / 当前计数器读取函数
 * @param quiet - Quiet period in ms / 静默期（毫秒）
 */
async function waitForQuiet(read: () => number, quiet = 400): Promise<void> {
  let last = read()
  const start = Date.now()
  while (Date.now() - start < WAIT_TIMEOUT) {
    await delay(quiet)
    const current = read()
    if (current === last) {
      return
    }
    last = current
  }
  throw new Error('Timed out waiting for the pending events to settle')
}

describe('compiler watcher', () => {
  let cwd: string
  let logger: LoggerStub
  let compiler: Compiler | undefined

  beforeEach(async () => {
    // `realpath` keeps `cwd` identical to the paths resolved by the bundler and
    // the watcher: on macOS `tmpdir()` is a symlink to `/private/var/...`
    // `realpath` 让 `cwd` 与打包器、监视器解析出的路径保持一致：
    // macOS 上的 `tmpdir()` 是指向 `/private/var/...` 的软链接
    cwd = await realpath(await mkdtemp(path.join(tmpdir(), 'vite-mock-compiler-')))
    await mkdir(path.join(cwd, DIR), { recursive: true })
    // A real `mock` directory is always part of an ESM project in practice,
    // which also makes the compiled temporary file use the `.mjs` extension
    // 真实的 `mock` 目录基本都处于 ESM 项目中，
    // 这也让编译产生的临时文件使用 `.mjs` 扩展名
    await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ type: 'module' }))
    logger = createLogger()
  })

  afterEach(async () => {
    compiler?.close()
    compiler = undefined
    // `close()` does not wait for the compilations already in flight, which may
    // still write their temporary file into the mock directory, so retry
    // `close()` 不会等待进行中的编译，编译可能仍在向 mock 目录写入临时文件，因此需要重试
    await rm(cwd, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  async function writeMock(relativePath: string, content: string): Promise<void> {
    await writeFile(path.join(cwd, relativePath), content)
  }

  /**
   * Start a compiler with watchers enabled and wait until the initial
   * scan finished and the mock data has been loaded
   *
   * 启动带监视器的编译器，等待初始扫描完成并加载 mock 数据
   *
   * @param expectUrls - Mock urls expected to be loaded / 期望已加载的 mock url
   * @returns The started compiler / 已启动的编译器
   */
  async function start(expectUrls: string[]): Promise<Compiler> {
    const instance = new Compiler(createOptions(cwd, logger))
    compiler = instance
    instance.run(true)
    const { mockWatcher } = instance as unknown as { mockWatcher: FSWatcher }
    await waitForReady(mockWatcher)
    await waitFor(
      () => expectUrls.every((url) => !!instance.mockData[url]),
      `mock data to contain ${expectUrls.join(', ')}`,
    )
    return instance
  }

  it(
    'should drop the mock rules of a deleted mock file',
    async () => {
      await writeMock(`${DIR}/a.mock.ts`, mockFileCode('/api/a', { name: 'a' }))
      await writeMock(`${DIR}/b.mock.ts`, mockFileCode('/api/b', { name: 'b' }))
      const instance = await start(['/api/a', '/api/b'])

      const updateEvents: string[] = []
      instance.on('mock:update-end', (filepath: string) => updateEvents.push(filepath))

      await unlink(path.join(cwd, DIR, 'a.mock.ts'))
      await waitFor(() => !instance.mockData['/api/a'], 'the deleted mock rule to be dropped')

      expect(instance.mockData['/api/a']).toBeUndefined()
      // The remaining mock file must stay untouched
      // 剩余 mock 文件不受影响
      expect(instance.mockData['/api/b']).toBeDefined()
      // The emitted path must be relative to `cwd` and `dir`-prefixed, which is
      // also the key used by `__filepath__` (consumed by the ws HMR map)
      // 发出的路径必须是相对 `cwd` 且带 `dir` 前缀，这也是 `__filepath__` 使用的键（供 ws HMR 映射使用）
      expect(updateEvents).toContain(`${DIR}/a.mock.ts`)
      expect(updateEvents).not.toContain(`${DIR}/${DIR}/a.mock.ts`)
      expect(logger.error).not.toHaveBeenCalled()
    },
    TEST_TIMEOUT,
  )

  it(
    'should remove the deleted mock file from the module caches',
    async () => {
      // A shared dependency of the mock file, so that `moduleDeps` is populated
      // mock 文件共享的依赖，用于填充 `moduleDeps`
      await writeMock(SHARED_DEP, SHARED_DEP_CODE)
      await writeMock(`${DIR}/a.mock.ts`, MOCK_WITH_DEP_CODE)
      const instance = await start(['/api/a'])
      const { moduleCache, moduleDeps } = instance as unknown as {
        moduleCache: Map<string, unknown>
        moduleDeps: Map<string, Set<string>>
      }

      expect(moduleCache.has(`${DIR}/a.mock.ts`)).toBe(true)
      expect(moduleDeps.get(SHARED_DEP)).toEqual(new Set([`${DIR}/a.mock.ts`]))

      await unlink(path.join(cwd, DIR, 'a.mock.ts'))
      await waitFor(() => !instance.mockData['/api/a'], 'the deleted mock rule to be dropped')

      expect(moduleCache.has(`${DIR}/a.mock.ts`)).toBe(false)
      // Neither the mock file itself nor its reverse references stay behind
      // mock 文件自身与其反向引用都不应残留
      expect(moduleDeps.size).toBe(0)
    },
    TEST_TIMEOUT,
  )

  it(
    'should not restore a mock file that is deleted while its compilation is in flight',
    async () => {
      await writeMock(`${DIR}/a.mock.ts`, mockFileCode('/api/a', { name: 'v1' }))
      await writeMock(`${DIR}/b.mock.ts`, mockFileCode('/api/b', { name: 'b' }))
      const instance = await start(['/api/a', '/api/b'])
      const { moduleCache } = instance as unknown as { moduleCache: Map<string, unknown> }
      const updateEvents: string[] = []
      instance.on('mock:update-end', (filepath: string) => updateEvents.push(filepath))

      // Hold the compilation triggered by the next change, so that the deletion
      // happens while the compilation is still in flight
      // 暂挂下一次变更触发的编译，使删除发生在编译仍在进行期间
      compileGate.enabled = true
      compileGate.held = 0
      compileGate.released = 0
      await writeMock(`${DIR}/a.mock.ts`, mockFileCode('/api/a', { name: 'v2' }))
      await waitFor(() => compileGate.held > 0, 'the new compilation to finish and be held')
      compileGate.enabled = false

      await unlink(path.join(cwd, DIR, 'a.mock.ts'))
      await waitFor(() => !instance.mockData['/api/a'], 'the deleted mock rule to be dropped')
      // Let the remaining watcher events of this deletion be processed before
      // measuring, so that the assertion below only reflects the released
      // compilation
      // 先等这次删除引发的其余监视器事件处理完毕，再进行测量，
      // 使下面的断言只反映被释放的那次编译
      await waitForQuiet(() => updateEvents.length)

      const updatesBeforeRelease = updateEvents.length
      for (const release of compileGate.waiters.splice(0)) {
        release()
      }
      await waitFor(() => compileGate.released > 0, 'the held compilation to be released')
      // Give the compiler enough time to publish a stale result: the coalescing
      // `setImmediate` timer runs right after a compilation resolves
      // 给编译器足够时间发布过期结果：合并计时器会在编译完成后立即执行
      await delay(200)

      // The deleted rule must stay gone, and its module must not come back
      // 已删除的规则必须保持消失，其模块也不应回到缓存
      expect(instance.mockData['/api/a']).toBeUndefined()
      expect(moduleCache.has(`${DIR}/a.mock.ts`)).toBe(false)
      // The cancelled compilation must not report an update either
      // 被取消的编译同样不应上报更新
      expect(updateEvents.length).toBe(updatesBeforeRelease)
      expect(instance.mockData['/api/b']).toBeDefined()
    },
    TEST_TIMEOUT,
  )

  it(
    'should update the mock data when a mock file changes',
    async () => {
      await writeMock(`${DIR}/a.mock.ts`, mockFileCode('/api/a', { name: 'a' }))
      const instance = await start(['/api/a'])

      await writeMock(`${DIR}/a.mock.ts`, mockFileCode('/api/a', CHANGED_BODY))
      await waitFor(
        () => JSON.stringify(bodyOf(instance, '/api/a')) === JSON.stringify(CHANGED_BODY),
        'the changed mock body to be applied',
      )

      expect(bodyOf(instance, '/api/a')).toEqual(CHANGED_BODY)
      expect(logger.error).not.toHaveBeenCalled()
    },
    TEST_TIMEOUT,
  )

  it(
    'should load a newly added mock file',
    async () => {
      await writeMock(`${DIR}/a.mock.ts`, mockFileCode('/api/a'))
      const instance = await start(['/api/a'])

      await writeMock(`${DIR}/c.mock.ts`, mockFileCode('/api/c', { name: 'c' }))
      await waitFor(() => !!instance.mockData['/api/c'], 'the added mock rule to be loaded')

      expect(bodyOf(instance, '/api/c')).toEqual({ name: 'c' })
      expect(logger.error).not.toHaveBeenCalled()
    },
    TEST_TIMEOUT,
  )

  it(
    'should keep tracking a mock file imported by another mock file',
    async () => {
      await writeMock(SHARED_MOCK, sharedMockCode(1))
      await writeMock(`${DIR}/b.mock.ts`, MOCK_IMPORTING_MOCK)
      const instance = await start(['/api/b', '/api/shared'])
      const { moduleDeps } = instance as unknown as { moduleDeps: Map<string, Set<string>> }
      const dependent = `${DIR}/b.mock.ts`
      expect(moduleDeps.get(SHARED_MOCK)).toEqual(new Set([dependent]))

      await writeMock(SHARED_MOCK, sharedMockCode(2))
      await waitFor(
        () =>
          JSON.stringify(bodyOf(instance, '/api/b')) === JSON.stringify({ name: 'b', version: 2 }),
        'the dependent mock file to be reloaded',
      )

      // Reloading the dependent mock file must not drop the tracking of its dep
      // 重新编译依赖方不应丢失对共享 mock 文件的依赖跟踪
      expect(moduleDeps.get(SHARED_MOCK)).toEqual(new Set([dependent]))

      await writeMock(SHARED_MOCK, sharedMockCode(3))
      // Both the mock file itself and its dependent are reloaded by their own
      // watcher, so wait for each of them independently
      // mock 文件自身与它的依赖方各自由自己的监视器重新加载，因此分别等待
      await waitFor(
        () =>
          JSON.stringify(bodyOf(instance, '/api/b')) === JSON.stringify({ name: 'b', version: 3 }),
        'the dependent mock file to be reloaded again',
      )
      await waitFor(
        () =>
          JSON.stringify(bodyOf(instance, '/api/shared')) ===
          JSON.stringify({ name: 'shared', version: 3 }),
        'the shared mock file to be reloaded again',
      )

      expect(logger.error).not.toHaveBeenCalled()
    },
    TEST_TIMEOUT,
  )

  it(
    'should keep the reverse references of a deleted dependency',
    async () => {
      await writeMock(SHARED_DEP, SHARED_DEP_CODE)
      await writeMock(`${DIR}/a.mock.ts`, MOCK_WITH_DEP_CODE)
      const instance = await start(['/api/a'])
      const { moduleDeps, missingDeps } = instance as unknown as {
        moduleDeps: Map<string, Set<string>>
        missingDeps: Set<string>
      }
      expect(moduleDeps.get(SHARED_DEP)).toEqual(new Set([`${DIR}/a.mock.ts`]))

      await unlink(path.join(cwd, SHARED_DEP))
      await waitFor(() => missingDeps.has(SHARED_DEP), 'the deleted dependency to be tracked')

      // The mock file importing the deleted dependency stays mapped to it: that
      // relation is what allows it to be restored once the dependency returns
      // 引用已删除依赖的 mock 文件仍与之保持映射关系：
      // 该关系是依赖恢复后重新编译引用方的依据
      expect(moduleDeps.get(SHARED_DEP)).toEqual(new Set([`${DIR}/a.mock.ts`]))
      // The rule built from the last available content is kept (last-good)
      // 基于最后一份可用内容构建的规则会被保留（last-good）
      expect(bodyOf(instance, '/api/a')).toEqual({ name: '/api/a', version: 1 })
    },
    TEST_TIMEOUT,
  )

  it(
    'should re-compile the mock files importing a dependency that is created again',
    async () => {
      await writeMock(SHARED_DEP, sharedDepCode(1))
      await writeMock(`${DIR}/a.mock.ts`, MOCK_WITH_DEP_CODE)
      const instance = await start(['/api/a'])
      const { missingDeps } = instance as unknown as { missingDeps: Set<string> }
      expect(bodyOf(instance, '/api/a')).toEqual({ name: '/api/a', version: 1 })

      await unlink(path.join(cwd, SHARED_DEP))
      await waitFor(() => missingDeps.has(SHARED_DEP), 'the deleted dependency to be tracked')

      // The dependency is created again: the mock file importing it must be
      // compiled again, otherwise it would keep serving the deleted content
      // 依赖被重新创建：引用它的 mock 文件必须重新编译，
      // 否则会继续提供已删除内容构建的规则
      await writeMock(SHARED_DEP, sharedDepCode(2))
      await waitFor(
        () =>
          JSON.stringify(bodyOf(instance, '/api/a')) ===
          JSON.stringify({ name: '/api/a', version: 2 }),
        'the dependent mock file to be re-compiled',
      )
      await waitFor(
        () => !missingDeps.has(SHARED_DEP),
        'the restored dependency to be tracked again',
      )

      expect(logger.error).not.toHaveBeenCalled()
    },
    TEST_TIMEOUT,
  )

  it(
    'should re-compile the mock files importing a mock file that is created again',
    async () => {
      await writeMock(SHARED_MOCK, sharedMockCode(1))
      await writeMock(`${DIR}/b.mock.ts`, MOCK_IMPORTING_MOCK)
      const instance = await start(['/api/b', '/api/shared'])
      const { missingDeps } = instance as unknown as { missingDeps: Set<string> }
      expect(bodyOf(instance, '/api/b')).toEqual({ name: 'b', version: 1 })

      await unlink(path.join(cwd, SHARED_MOCK))
      await waitFor(() => missingDeps.has(SHARED_MOCK), 'the deleted mock file to be tracked')
      // Only the rule of the deleted file itself is gone: its dependents keep
      // the last-good rules until it is created again
      // 只有被删除文件自身的规则消失：引用方保留 last-good 规则直到文件重新创建
      expect(instance.mockData['/api/shared']).toBeUndefined()
      expect(bodyOf(instance, '/api/b')).toEqual({ name: 'b', version: 1 })

      // Re-creating the imported mock file restores the rules of its dependents
      // 重新创建被引用的 mock 文件会恢复其引用方的规则
      await writeMock(SHARED_MOCK, sharedMockCode(2))
      await waitFor(
        () =>
          JSON.stringify(bodyOf(instance, '/api/b')) === JSON.stringify({ name: 'b', version: 2 }),
        'the dependent mock file to be re-compiled',
      )

      expect(logger.error).not.toHaveBeenCalled()
    },
    TEST_TIMEOUT,
  )
})
