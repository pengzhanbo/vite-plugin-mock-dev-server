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

const DIR = 'mock'
const SHARED_DEP = `${DIR}/shared.ts`
const CHANGED_BODY = { name: 'changed' }
const TEST_TIMEOUT = 20_000
const WAIT_TIMEOUT = 10_000

/**
 * Shared module imported by a mock file
 *
 * 被 mock 文件引入的共享模块
 *
 * It exports a function on purpose: a module whose code is fully inlined as a
 * constant may be merged into the entry by the bundler and never reported as a
 * dependency.
 *
 * 它刻意导出一个函数：代码被完全内联为常量的模块可能被打包器合并进入口模块，
 * 从而不会被上报为依赖。
 */
const SHARED_DEP_CODE = `export function createMock(url: string): any {
  return { url, method: 'GET', body: { name: url } }
}
`

const MOCK_WITH_DEP_CODE = `import { createMock } from './shared.js'
export default [createMock('/api/a')]
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
 * @param compiler - Compiler instance / 编译器实例
 * @param url - Mock url / mock url
 * @param index - Index of the mock item / mock 条目下标
 * @returns The mock body / mock body
 */
function bodyOf(compiler: Compiler, url: string, index = 0): MockHttpItem['body'] {
  return (compiler.mockData[url][index] as MockHttpItem).body
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
 * Whether the watcher has already registered the given file.
 *
 * 监视器是否已注册给定文件。
 *
 * Needed because chokidar never emits `ready` for a watcher created without any
 * path, which is the case for the deps watcher on startup.
 *
 * 由于 chokidar 对启动时未指定任何路径的监视器（即依赖监视器）不会触发 `ready`，
 * 因此需要这个判断。
 *
 * @param watcher - File watcher / 文件监视器
 * @param filename - File name to look for / 待查找的文件名
 * @returns Whether the file is watched / 文件是否已被监视
 */
function isWatched(watcher: FSWatcher, filename: string): boolean {
  return Object.values(watcher.getWatched()).some((files) =>
    files.some((file) => file.includes(filename)),
  )
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

  function depsWatcherOf(instance: Compiler): FSWatcher {
    return (instance as unknown as { depsWatcher: FSWatcher }).depsWatcher
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
    'should release the dependency tracking of a deleted dependency file',
    async () => {
      await writeMock(SHARED_DEP, SHARED_DEP_CODE)
      await writeMock(`${DIR}/a.mock.ts`, MOCK_WITH_DEP_CODE)
      const instance = await start(['/api/a'])
      const { moduleDeps } = instance as unknown as { moduleDeps: Map<string, Set<string>> }
      expect(moduleDeps.size).toBe(1)

      const depsWatcher = depsWatcherOf(instance)
      await waitFor(() => isWatched(depsWatcher, 'shared.ts'), 'the dependency to be watched')

      await unlink(path.join(cwd, SHARED_DEP))
      await waitFor(() => moduleDeps.size === 0, 'the deleted dependency to be released')

      expect(moduleDeps.has(SHARED_DEP)).toBe(false)
      // The watcher must release the dependency once nothing imports it
      // 当没有任何文件引用该依赖时，监视器必须释放它
      await waitFor(() => !isWatched(depsWatcher, 'shared.ts'), 'the dependency to be unwatched')
    },
    TEST_TIMEOUT,
  )
})
