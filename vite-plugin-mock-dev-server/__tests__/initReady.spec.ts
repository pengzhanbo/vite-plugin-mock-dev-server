/**
 * Tests for the readiness of the initial mock load
 *
 * 初始 mock 加载就绪状态的测试
 *
 * `awaitInitialLoad` decides whether the dev server waits for the initial compilation
 * of the mock files before it starts serving requests. The middlewares must always be
 * registered first, so that requests arriving during the wait still go through the mock
 * middleware instead of skipping it.
 *
 * `awaitInitialLoad` 决定开发服务是否等待 mock 文件的初始编译完成后再开始处理请求。
 * 中间件必须始终先被注册，这样等待期间到达的请求仍会经过 mock 中间件，而不是被完全绕过。
 */
import type { ResolvedConfig, ViteDevServer } from 'vite'
import type { ResolvedMockServerPluginOptions } from '../src/core/options.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initMockMiddlewares } from '../src/core/init.js'
import { serverPlugin } from '../src/core/plugin.js'

const runMock = vi.hoisted(() => vi.fn<() => Promise<void>>())

// 用最小的编译器替身：用例只需要控制 `run()` 何时 resolve，
// 不启动真实的监视器与编译流程
// A minimal compiler double: the cases only need to control when `run()` resolves,
// without starting the real watchers and compilation
vi.mock('../src/compiler/index.js', () => {
  class Compiler {
    mockData: Record<string, never> = {}
    run = runMock
    on(): this {
      return this
    }
    once(): this {
      return this
    }
    off(): this {
      return this
    }
    emit(): boolean {
      return true
    }
    close(): void {}
  }
  return { Compiler }
})

interface Deferred {
  promise: Promise<void>
  resolve: () => void
}

/**
 * Create a promise that can be resolved from the outside
 *
 * 创建可由外部控制 resolve 的 Promise
 *
 * @returns The promise and its resolver / Promise 与其 resolve 函数
 */
function createDeferred(): Deferred {
  let resolve!: () => void
  const promise = new Promise<void>((_resolve) => {
    resolve = _resolve
  })
  return { promise, resolve }
}

/**
 * Resolve with the given value after a delay
 *
 * 延迟后以指定值 resolve
 *
 * @param ms - Delay in milliseconds / 延迟毫秒数
 * @param value - Value to resolve with / resolve 的值
 * @returns Resolves with the value after the delay / 延迟后以该值 resolve
 */
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Create minimal resolved plugin options
 *
 * 创建最小化的插件解析配置
 *
 * @param awaitInitialLoad - Whether to wait for the initial load / 是否等待初始加载
 * @returns Resolved plugin options / 解析后的插件配置
 */
function createOptions(awaitInitialLoad: boolean): ResolvedMockServerPluginOptions {
  return {
    awaitInitialLoad,
    proxies: [],
    wsProxies: [],
    activeScene: [],
    cookiesOptions: {},
    formidableOptions: {},
    bodyParserOptions: {},
    priority: {},
    cors: false,
    record: { enabled: false },
    replay: false,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  } as unknown as ResolvedMockServerPluginOptions
}

/**
 * Create a minimal resolved Vite config
 *
 * 创建最小化的 Vite 解析配置
 *
 * @returns Resolved config / 解析后的配置
 */
function createResolvedConfig(): ResolvedConfig {
  return {
    root: process.cwd(),
    mode: 'development',
    define: {},
    env: {},
    resolve: { alias: [] },
    server: { proxy: {} },
  } as unknown as ResolvedConfig
}

describe('initial mock load readiness', () => {
  beforeEach(() => {
    runMock.mockReset()
  })

  it('should wait for the initial load when awaitInitialLoad is enabled', async () => {
    const deferred = createDeferred()
    runMock.mockReturnValue(deferred.promise)

    const ready = initMockMiddlewares(createOptions(true), null).ready

    // 初始加载未完成时不应就绪 / It must not be ready before the load finished
    expect(await Promise.race([ready.then(() => 'ready'), delay(20, 'timeout')])).toBe('timeout')

    deferred.resolve()
    await expect(ready).resolves.toBeUndefined()
  })

  it('should not wait for the initial load when awaitInitialLoad is disabled', async () => {
    // 永不 resolve：若仍然等待，下面的断言会超时
    // Never resolves: the assertions below time out if it still waits for it
    runMock.mockReturnValue(new Promise<void>(() => {}))

    const { middlewares, ready } = initMockMiddlewares(createOptions(false), null)

    expect(middlewares).toHaveLength(1)
    expect(runMock).toHaveBeenCalledWith(false)
    await expect(ready).resolves.toBeUndefined()
  })

  it('should register the middlewares before the initial load finishes', async () => {
    const deferred = createDeferred()
    runMock.mockReturnValue(deferred.promise)
    const use = vi.fn()
    const server = {
      middlewares: { use },
      httpServer: null,
      ws: undefined,
    } as unknown as ViteDevServer

    const plugin = serverPlugin({ prefix: ['/api'] })
    ;(plugin.configResolved as (config: ResolvedConfig) => void)(createResolvedConfig())
    const configureServer = plugin.configureServer as (server: ViteDevServer) => Promise<void>
    const hook = configureServer(server)

    await Promise.resolve()
    await Promise.resolve()
    // 等待期间请求仍会经过 mock 中间件 / Requests still hit the mock middleware while waiting
    expect(use).toHaveBeenCalledTimes(1)

    deferred.resolve()
    await hook
  })

  it('should resolve the server hook immediately when awaitInitialLoad is disabled', async () => {
    runMock.mockReturnValue(new Promise<void>(() => {}))
    const use = vi.fn()
    const server = {
      middlewares: { use },
      httpServer: null,
    } as unknown as ViteDevServer

    const plugin = serverPlugin({ prefix: ['/api'], awaitInitialLoad: false })
    ;(plugin.configResolved as (config: ResolvedConfig) => void)(createResolvedConfig())
    const configurePreviewServer = plugin.configurePreviewServer as (
      server: ViteDevServer,
    ) => Promise<void>
    await configurePreviewServer(server)

    expect(use).toHaveBeenCalledTimes(1)
  })
})
