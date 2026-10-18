/**
 * Shared helpers for the end-to-end specs.
 *
 * 端到端测试的公共辅助函数。
 *
 * The e2e specs boot a real Vite dev server in a temporary project, so that the
 * plugin lifecycle (`config` / `configResolved` / `configureServer`), the request
 * pipeline and the file watcher are all exercised together instead of being
 * replaced by hand-rolled `req` / `res` fakes.
 *
 * 端到端用例会在临时目录中启动真实的 Vite 开发服务器，从而把插件生命周期
 * （`config` / `configResolved` / `configureServer`）、请求链路与文件监听
 * 一起覆盖，而不是用伪造的 `req` / `res` 代替。
 */
import type { AddressInfo } from 'node:net'
import type { ServerOptions, ViteDevServer } from 'vite'
import type { MockServerPluginOptions } from '../../src/types/index.js'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import { mockDevServerPlugin } from '../../src/index.js'

/**
 * A temporary project used by an e2e spec
 *
 * 端到端用例使用的临时项目
 */
export interface E2EProject {
  /**
   * Absolute path of the project root
   *
   * 项目根目录的绝对路径
   */
  root: string
  /**
   * Write a file relative to the project root
   *
   * 写入相对项目根目录的文件
   *
   * @param file - Relative file path / 相对文件路径
   * @param content - File content / 文件内容
   */
  write: (file: string, content: string) => Promise<void>
  /**
   * Read a file relative to the project root
   *
   * 读取相对项目根目录的文件
   *
   * @param file - Relative file path / 相对文件路径
   * @returns File content / 文件内容
   */
  read: (file: string) => Promise<string>
  /**
   * Remove the project directory
   *
   * 删除项目目录
   */
  cleanup: () => Promise<void>
}

/**
 * A running Vite dev server with the mock plugin installed
 *
 * 安装了 mock 插件的 Vite 开发服务器
 */
export interface RunningServer {
  /**
   * The Vite dev server instance
   *
   * Vite 开发服务器实例
   */
  server: ViteDevServer
  /**
   * Base URL of the dev server, e.g. `http://127.0.0.1:5173`
   *
   * 开发服务器的地址，如 `http://127.0.0.1:5173`
   */
  origin: string
  /**
   * Request a path on the dev server
   *
   * 请求开发服务器上的路径
   *
   * @param pathname - Request path / 请求路径
   * @param init - Fetch options / fetch 配置
   * @returns The response / 响应
   */
  request: (pathname: string, init?: RequestInit) => Promise<Response>
  /**
   * Stop the dev server
   *
   * 关闭开发服务器
   */
  close: () => Promise<void>
}

/**
 * Create a temporary project with the given files
 *
 * 创建包含指定文件的临时项目
 *
 * @param files - Files keyed by their path relative to the project root / 以相对路径为键的文件
 * @returns The project / 项目
 */
export async function createProject(files: Record<string, string> = {}): Promise<E2EProject> {
  const root = await mkdtemp(path.join(tmpdir(), 'mock-e2e-'))
  const write = async (file: string, content: string): Promise<void> => {
    const filepath = path.join(root, file)
    await mkdir(path.dirname(filepath), { recursive: true })
    await writeFile(filepath, content, 'utf-8')
  }

  await write(
    'package.json',
    JSON.stringify({ name: 'mock-e2e', private: true, type: 'module' }, null, 2),
  )
  await write('index.html', '<!doctype html><html><body></body></html>')
  for (const [file, content] of Object.entries(files)) {
    await write(file, content)
  }

  return {
    root,
    write,
    read: async (file) => readFile(path.join(root, file), 'utf-8'),
    cleanup: async () => {
      await rm(root, { recursive: true, force: true })
    },
  }
}

/**
 * Start a real Vite dev server with the mock plugin
 *
 * 启动安装了 mock 插件的真实 Vite 开发服务器
 *
 * @param options - Server options / 服务器配置
 * @param options.root - Project root / 项目根目录
 * @param options.pluginOptions - Options passed to the plugin / 传给插件的配置
 * @param options.serverOptions - Extra Vite server options / 额外的 Vite server 配置
 * @returns The running server / 运行中的服务器
 */
export async function startMockServer({
  root,
  pluginOptions = {},
  serverOptions = {},
}: {
  root: string
  pluginOptions?: MockServerPluginOptions
  serverOptions?: ServerOptions
}): Promise<RunningServer> {
  const server = await createServer({
    configFile: false,
    root,
    logLevel: 'silent',
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: {
      host: '127.0.0.1',
      port: 0,
      strictPort: false,
      // 端到端用例不依赖 Vite 的 HMR websocket，关闭它可以避免与插件的 upgrade
      // 处理互相干扰
      hmr: false,
      ...serverOptions,
    },
    plugins: [mockDevServerPlugin({ cwd: root, dir: 'mock', log: 'error', ...pluginOptions })],
  })

  await server.listen()

  const address = server.httpServer!.address() as AddressInfo
  const origin = `http://127.0.0.1:${address.port}`

  return {
    server,
    origin,
    request: (pathname, init) => fetch(`${origin}${pathname}`, init),
    close: async () => {
      await server.close()
    },
  }
}

/**
 * Sleep for the given time
 *
 * 等待指定时间
 *
 * @param ms - Milliseconds / 毫秒
 * @returns Resolves after the delay / 延迟后 resolve
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Poll an async predicate until it returns a truthy value
 *
 * 轮询异步断言直到返回真值
 *
 * @param probe - Predicate to run / 需要运行的断言
 * @param message - Error message on timeout / 超时时的错误信息
 * @param timeout - Timeout in milliseconds / 超时时间（毫秒）
 * @returns The truthy value returned by the probe / 断言返回的真值
 */
export async function waitFor<T>(
  probe: () => Promise<T | false | undefined | null> | T | false | undefined | null,
  message: string,
  timeout = 15_000,
): Promise<T> {
  const start = Date.now()
  let lastError: unknown
  while (Date.now() - start < timeout) {
    try {
      const value = await probe()
      if (value) {
        return value
      }
    } catch (error) {
      lastError = error
    }
    await sleep(50)
  }
  throw new Error(`Timed out after ${timeout}ms: ${message}`, { cause: lastError })
}

/**
 * Wait until the mock data of the given path is ready
 *
 * 等待指定路径的 mock 数据准备完成
 *
 * @param server - Running server / 运行中的服务器
 * @param pathname - Request path / 请求路径
 * @param init - Fetch options / fetch 配置
 * @returns The first successful response / 首个成功的响应
 */
export async function waitForMock(
  server: RunningServer,
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  return waitFor(async () => {
    const response = await server.request(pathname, init)
    if (response.status >= 500) {
      return false
    }
    // 未加载完成时请求会继续走后续中间件（此处是 Vite 的 404）
    if (response.status === 404) {
      return false
    }
    return response
  }, `mock data for ${pathname} was not ready`)
}
