import type { FSWatcher } from 'chokidar'
/**
 * Tests for the compilation failure handling of the compiler
 *
 * 编译器编译失败处理的测试
 *
 * A failed compilation must keep the rules of the last successful one: replacing them
 * with an empty list silently forwards the requests to the real backend, which is hard
 * to notice. The failure has to be reported (`mock:error`) and the recovery too
 * (`mock:recovered`), so that the dev server can show / clear the error overlay.
 *
 * 编译失败时必须保留上一次成功编译的规则：把规则替换为空会让请求静默透传到真实后端，
 * 很难被发现。失败（`mock:error`）与恢复（`mock:recovered`）都需要上报，
 * 以便开发服务展示 / 清除错误浮层。
 */
import type { Server } from 'node:http'
import type { WebSocketServer } from 'vite'
import type { ResolvedMockServerPluginOptions } from '../src/core/options.js'
import type { MockHttpItem } from '../src/types/index.js'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Compiler } from '../src/compiler/compiler.js'
import { initMockMiddlewares } from '../src/core/init.js'

const DIR = 'mock'
const FILE = `${DIR}/a.mock.ts`
const WAIT_TIMEOUT = 10_000

interface LoggerStub {
  debug: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
}

/**
 * Create a logger stub
 *
 * 创建日志桩
 *
 * @returns Logger stub / 日志桩
 */
function createLogger(): LoggerStub {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

/**
 * Build the mock file source with the given body
 *
 * 用给定 body 构造 mock 文件源码
 *
 * @param body - Mock response body / mock 响应体
 * @returns Mock file source / mock 文件源码
 */
function mockCode(body: Record<string, unknown>): string {
  return `export default [{ url: '/api/a', method: 'GET', body: ${JSON.stringify(body)} }]\n`
}

// 缺少右括号：打包阶段必定失败
// Missing closing bracket: the bundling phase fails
const BROKEN_CODE = `export default [{ url: '/api/a', method: 'GET', body: { name: 'broken' } }\n`

// 打包成功但模块执行时抛错
// Bundles fine, but throws while the module is executed
const THROWING_CODE = `throw new Error('boom at import')\nexport default []\n`

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

/**
 * Wait until the counter stopped changing for a quiet period
 *
 * 等待计数器在静默期内不再变化
 *
 * @param read - Reader of the counter / 计数器读取函数
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

/**
 * Read the body of the mock item registered for the given url
 *
 * 读取指定 url 上 mock 条目的 body
 *
 * @param compiler - Compiler instance / 编译器实例
 * @param url - Mock url / mock url
 * @returns The mock body, if registered / mock body（若已注册）
 */
function bodyOf(compiler: Compiler, url: string): any {
  return (compiler.mockData[url]?.[0] as MockHttpItem | undefined)?.body
}

describe('compiler failure', () => {
  let cwd: string
  let logger: LoggerStub
  let compiler: Compiler | undefined

  beforeEach(async () => {
    cwd = await realpath(await mkdtemp(path.join(tmpdir(), 'vite-mock-failure-')))
    await mkdir(path.join(cwd, DIR), { recursive: true })
    await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ type: 'module' }))
    logger = createLogger()
  })

  afterEach(async () => {
    compiler?.close()
    compiler = undefined
    await rm(cwd, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  /**
   * Start a compiler with watchers enabled and wait for the initial load
   *
   * 启动带监视器的编译器并等待初次加载完成
   *
   * @returns The started compiler / 已启动的编译器
   */
  async function start(): Promise<Compiler> {
    const instance = new Compiler({
      cwd,
      dir: DIR,
      include: ['**/*.mock.ts'],
      exclude: [],
      define: {},
      alias: [],
      logger,
    } as unknown as ResolvedMockServerPluginOptions)
    compiler = instance
    instance.run(true)
    const { mockWatcher } = instance as unknown as { mockWatcher: FSWatcher }
    await new Promise<void>((resolve) => mockWatcher.once('ready', () => resolve()))
    await waitFor(() => !!instance.mockData['/api/a'], 'the mock data to be loaded')
    return instance
  }

  it('should keep the previous rules when the mock file fails to compile', async () => {
    await writeFile(path.join(cwd, FILE), mockCode({ name: 'before' }))
    const instance = await start()

    const errors: Array<{ filepath: string; error: Error }> = []
    const updates: string[] = []
    instance.on('mock:error', (payload: { filepath: string; error: Error }) => errors.push(payload))
    instance.on('mock:update-end', (filepath: string) => updates.push(filepath))

    await writeFile(path.join(cwd, FILE), BROKEN_CODE)
    await waitFor(() => errors.length > 0, 'the compilation error to be reported')

    expect(errors[0].filepath).toBe(FILE)
    expect(errors[0].error).toBeInstanceOf(Error)
    expect(logger.error).toHaveBeenCalled()
    // 上一次成功编译的规则仍在生效
    // The rules of the last successful compilation are still effective
    expect(bodyOf(instance, '/api/a')).toEqual({ name: 'before' })

    // 失败不产生更新事件，因此不会触发整页刷新 / websocket 重启
    // A failure produces no update event, so no full reload / websocket restart happens
    await waitForQuiet(() => updates.length)
    expect(updates).toHaveLength(0)
  })

  it('should report the recovery once the mock file compiles again', async () => {
    await writeFile(path.join(cwd, FILE), mockCode({ name: 'before' }))
    const instance = await start()

    const recovered = vi.fn()
    let failed = 0
    instance.on('mock:error', () => {
      failed++
    })
    instance.on('mock:recovered', recovered)

    await writeFile(path.join(cwd, FILE), BROKEN_CODE)
    await waitFor(() => failed > 0, 'the compilation error to be reported')
    expect(recovered).not.toHaveBeenCalled()
    expect(bodyOf(instance, '/api/a')).toEqual({ name: 'before' })

    await writeFile(path.join(cwd, FILE), mockCode({ name: 'after' }))
    await waitFor(() => recovered.mock.calls.length > 0, 'the recovery event')
    expect(recovered).toHaveBeenCalledWith(FILE)
    await waitFor(() => bodyOf(instance, '/api/a')?.name === 'after', 'the updated rules')
  })

  it('should keep the previous rules when the mock module throws while loading', async () => {
    await writeFile(path.join(cwd, FILE), mockCode({ name: 'before' }))
    const instance = await start()

    const errors: Array<{ filepath: string; error: Error }> = []
    instance.on('mock:error', (payload: { filepath: string; error: Error }) => errors.push(payload))

    await writeFile(path.join(cwd, FILE), THROWING_CODE)
    await waitFor(() => errors.length > 0, 'the load error to be reported')

    expect(errors[0].error.message).toContain('boom at import')
    expect(bodyOf(instance, '/api/a')).toEqual({ name: 'before' })
  })
})

describe('compilation error overlay', () => {
  let cwd: string
  let logger: LoggerStub
  let server: EventEmitter

  beforeEach(async () => {
    cwd = await realpath(await mkdtemp(path.join(tmpdir(), 'vite-mock-overlay-')))
    await mkdir(path.join(cwd, DIR), { recursive: true })
    await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ type: 'module' }))
    await writeFile(path.join(cwd, FILE), BROKEN_CODE)
    logger = createLogger()
    server = new EventEmitter()
  })

  afterEach(async () => {
    server.emit('close')
    await rm(cwd, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  /**
   * Create the resolved options required by the middlewares
   *
   * 创建中间件所需的解析配置
   *
   * @returns Resolved plugin options / 解析后的插件配置
   */
  function createOptions(): ResolvedMockServerPluginOptions {
    return {
      enabled: true,
      cwd,
      dir: DIR,
      include: ['**/*.mock.ts'],
      exclude: [],
      context: cwd,
      reload: false,
      cors: false,
      cookiesOptions: {},
      log: 'error',
      formidableOptions: {},
      bodyParserOptions: {},
      priority: {},
      build: false,
      proxies: ['/api'],
      wsProxies: [],
      activeScene: [],
      logger,
      alias: [],
      define: {},
      record: {
        enabled: false,
        cwd,
        dir: `${DIR}/.recordings`,
        overwrite: true,
        status: [],
        expires: Number.MAX_SAFE_INTEGER,
        gitignore: true,
        filter: () => true,
      },
      replay: false,
    } as unknown as ResolvedMockServerPluginOptions
  }

  it('should send the error to the overlay and clear it after the recovery', async () => {
    const ws = { send: vi.fn() }
    const middlewares = initMockMiddlewares(
      createOptions(),
      server as unknown as Server,
      ws as unknown as WebSocketServer,
    )
    expect(middlewares.length).toBeGreaterThan(0)

    await vi.waitFor(
      () => {
        const payload = ws.send.mock.calls
          .map(([sent]) => sent)
          .find((sent) => sent?.type === 'error')
        expect(payload).toBeTruthy()
        expect(payload.err.message).toContain(FILE)
        expect(payload.err.plugin).toBe('vite-plugin-mock-dev-server')
      },
      { timeout: WAIT_TIMEOUT },
    )

    await writeFile(path.join(cwd, FILE), mockCode({ name: 'fixed' }))

    await vi.waitFor(
      () => {
        const cleared = ws.send.mock.calls.some(
          ([payload]) => payload?.type === 'update' && payload.updates.length === 0,
        )
        expect(cleared).toBe(true)
      },
      { timeout: WAIT_TIMEOUT },
    )
  })
})
