/**
 * Tests for the standalone mock server generator
 *
 * 独立 Mock 服务产物生成测试
 */
import type { ResolvedMockServerPluginOptions } from '../src/core/options.js'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateMockServer } from '../src/build/generate.js'
import { transform } from '../src/compiler/index.js'

vi.mock('../src/compiler/index.js', () => ({
  aliasMatches: vi.fn(() => false),
  transform: vi.fn(async () => ({ code: 'export default {}', externalDeps: [] })),
}))

interface GenerateCase {
  recordEnabled: boolean
  includeRecord: boolean
  activeScene?: string[]
  formidableOptions?: Record<string, unknown>
}

/**
 * Create resolved plugin options for the generator
 *
 * 创建用于生成器的插件解析配置
 *
 * @param cwd - Temporary working directory / 临时工作目录
 * @param options - Case options / 用例配置
 * @returns Resolved plugin options / 解析后的插件配置
 */
function createOptions(cwd: string, options: GenerateCase): ResolvedMockServerPluginOptions {
  return {
    enabled: true,
    cwd,
    dir: 'mock',
    include: ['**/*.mock.{js,ts,cjs,mjs,json,json5}'],
    exclude: [],
    context: cwd,
    reload: false,
    cors: false,
    cookiesOptions: {},
    log: 'error',
    formidableOptions: { multiples: true, ...options.formidableOptions },
    bodyParserOptions: {},
    priority: {},
    build: {
      serverPort: 8080,
      dist: 'mockServer',
      log: 'error',
      includeRecord: options.includeRecord,
    },
    proxies: ['/api'],
    wsProxies: [],
    activeScene: options.activeScene ?? [],
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    alias: [],
    define: {},
    record: {
      enabled: options.recordEnabled,
      cwd,
      dir: 'mock/.recordings',
      overwrite: true,
      status: [],
      expires: Number.MAX_SAFE_INTEGER,
      gitignore: true,
      filter: () => true,
    },
    replay: options.includeRecord,
  }
}

/**
 * Test suite for generateMockServer
 *
 * generateMockServer 测试套件
 */
describe('generateMockServer', () => {
  let cwd: string

  beforeEach(async () => {
    cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-server-build-'))
    await fs.mkdir(path.join(cwd, 'mock/.recordings'), { recursive: true })
    await fs.writeFile(path.join(cwd, 'mock/.recordings/api-users.json'), '[]', 'utf-8')
  })

  afterEach(async () => {
    await fs.rm(cwd, { recursive: true, force: true })
  })

  async function generate(options: GenerateCase): Promise<string[]> {
    const emitFile = vi.fn()
    await generateMockServer({ emitFile } as any, createOptions(cwd, options))
    return emitFile.mock.calls.map(([asset]) => asset.fileName)
  }

  it('should bundle existing recordings when includeRecord is true but record is disabled', async () => {
    const files = await generate({ recordEnabled: false, includeRecord: true })

    expect(files).toContain(path.join('mockServer', 'mock/.recordings/api-users.json'))
    expect(files).toContain(path.join('mockServer', 'mock-data.js'))
    expect(files).toContain(path.join('mockServer', 'index.js'))
  })

  it('should bundle recordings when both includeRecord and record are enabled', async () => {
    const files = await generate({ recordEnabled: true, includeRecord: true })

    expect(files).toContain(path.join('mockServer', 'mock/.recordings/api-users.json'))
  })

  it('should skip recordings when includeRecord is disabled', async () => {
    const files = await generate({ recordEnabled: true, includeRecord: false })

    expect(files).not.toContain(path.join('mockServer', 'mock/.recordings/api-users.json'))
    expect(files).toContain(path.join('mockServer', 'mock-data.js'))
  })

  it('should pass activeScene and serializable formidableOptions to the server entry', async () => {
    const options = createOptions(cwd, {
      recordEnabled: false,
      includeRecord: false,
      activeScene: ['dev'],
      formidableOptions: { maxFileSize: 1024, filter: () => true },
    })
    const emitFile = vi.fn()

    await generateMockServer({ emitFile } as any, options)

    const assets = emitFile.mock.calls.map(([asset]) => asset)
    const entry = assets.find((asset) => asset.fileName === path.join('mockServer', 'index.js'))

    expect(entry.source).toContain('const activeScene = ["dev"];')
    expect(entry.source).toContain(`const logger = createLogger('mock-server', "error");`)
    expect(entry.source).toContain(
      'const formidableOptions = {"multiples":true,"maxFileSize":1024};',
    )
    expect(entry.source).toContain(
      'mockWebSocket(compiler, server, { wsProxies, cookiesOptions, logger, activeScene, priority });',
    )
    expect(entry.source).toContain(`  replay: false,
  activeScene,
}, sortMockUrls));`)

    // Non-serializable options are ignored with a build-time warning
    // 无法序列化的配置项会被忽略，并在构建期输出警告
    const warn = vi.mocked(options.logger.warn)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('filter')
    expect(entry.source).not.toContain('"filter"')
  })

  it('should relocate a configured uploadDir into the output directory', async () => {
    const options = createOptions(cwd, {
      recordEnabled: false,
      includeRecord: false,
      formidableOptions: { maxFileSize: 1024, uploadDir: '/usr/xxx/tmp/' },
    })
    const emitFile = vi.fn()

    await generateMockServer({ emitFile } as any, options)

    const assets = emitFile.mock.calls.map(([asset]) => asset)
    const entry = assets.find((asset) => asset.fileName === path.join('mockServer', 'index.js'))

    // 机器相关的绝对路径不会出现在产物中
    // The machine specific absolute path never appears in the artifact
    expect(entry.source).not.toContain('/usr/xxx/tmp')
    expect(entry.source).toContain(
      'const formidableOptions = {"multiples":true,"maxFileSize":1024};',
    )

    // 重定位到产物目录下的同名目录，并在启动时创建
    // It is relocated to the same-named directory inside the output directory,
    // and created on startup
    expect(entry.source).toContain(`import fs from 'node:fs';`)
    expect(entry.source).toContain(`import path from 'node:path';`)
    expect(entry.source).toContain('const uploadDir = path.resolve(import.meta.dirname, "tmp");')
    expect(entry.source).toContain('fs.mkdirSync(uploadDir, { recursive: true });')
    expect(entry.source).toContain('formidableOptions.uploadDir = uploadDir;')
    expect(entry.source).toContain('formidableOptions.uploadDir = os.tmpdir();')

    // 构建期提示
    // A build-time notice is logged
    const warn = vi.mocked(options.logger.warn)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('/usr/xxx/tmp/')
    expect(warn.mock.calls[0][0]).toContain('./tmp')
  })

  it('should relocate the legacy `uploaddir` alias as well', async () => {
    const options = createOptions(cwd, {
      recordEnabled: false,
      includeRecord: false,
      formidableOptions: { uploaddir: 'mock/uploads' },
    })
    const emitFile = vi.fn()

    await generateMockServer({ emitFile } as any, options)

    const assets = emitFile.mock.calls.map(([asset]) => asset)
    const entry = assets.find((asset) => asset.fileName === path.join('mockServer', 'index.js'))

    expect(entry.source).toContain('const formidableOptions = {"multiples":true};')
    expect(entry.source).toContain(
      'const uploadDir = path.resolve(import.meta.dirname, "uploads");',
    )
    expect(vi.mocked(options.logger.warn)).toHaveBeenCalledTimes(1)
  })

  it('should warn about non-serializable cors options and keep the others', async () => {
    const options = createOptions(cwd, { recordEnabled: false, includeRecord: false })
    options.cors = { origin: /^https:\/\/example\.com$/, credentials: true }
    const emitFile = vi.fn()

    await generateMockServer({ emitFile } as any, options)

    const entry = emitFile.mock.calls
      .map(([asset]) => asset)
      .find((asset) => asset.fileName === path.join('mockServer', 'index.js'))

    // 可序列化的配置项被保留，RegExp 形式的 origin 被忽略
    // Serializable options are kept, the RegExp `origin` is dropped
    expect(entry.source).toContain('const cors = {"credentials":true};')

    const warn = vi.mocked(options.logger.warn)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('cors.origin')
    expect(warn.mock.calls[0][0]).toContain('all origins')
  })

  it('should support PORT / HOST environment variables and handle listen errors', async () => {
    const options = createOptions(cwd, { recordEnabled: false, includeRecord: false })
    const emitFile = vi.fn()

    await generateMockServer({ emitFile } as any, options)

    const entry = emitFile.mock.calls
      .map(([asset]) => asset)
      .find((asset) => asset.fileName === path.join('mockServer', 'index.js'))

    // 端口/主机可通过环境变量覆盖，且启动错误被记录而不是变成未捕获异常
    // The port / host can be overridden by env variables, and startup errors are
    // logged instead of becoming uncaught exceptions
    expect(entry.source).toContain(
      'const port = Number.isInteger(envPort) && envPort > 0 ? envPort : 8080;',
    )
    expect(entry.source).toContain('const host = process.env.HOST || undefined;')
    expect(entry.source).toContain("server.on('error', (error) => {")
    expect(entry.source).toContain('process.exitCode = 1;')
    expect(entry.source).toContain('server.listen(port, host, () => {')
  })

  it('should remove the temporary entry when the transform fails', async () => {
    vi.mocked(transform).mockRejectedValueOnce(new Error('rolldown or esbuild not found'))
    const emitFile = vi.fn()
    const options = createOptions(cwd, { recordEnabled: false, includeRecord: false })

    // 既未安装 rolldown 也未安装 esbuild 时 `transform` 直接抛错
    // `transform` throws when neither rolldown nor esbuild is installed
    await expect(generateMockServer({ emitFile } as any, options)).rejects.toThrow(
      'rolldown or esbuild not found',
    )

    // 临时入口文件不会残留在项目根目录
    // The temporary entry does not stay in the project root
    const files = await fs.readdir(cwd)
    expect(files.filter((file) => file.startsWith('mock-data-'))).toEqual([])
    expect(emitFile).not.toHaveBeenCalled()
  })

  it('should abort the build when the mock entry is not transformed', async () => {
    vi.mocked(transform).mockResolvedValueOnce({ code: '', externalDeps: [], internalDeps: [] })
    const emitFile = vi.fn()
    const options = createOptions(cwd, { recordEnabled: false, includeRecord: false })

    // 空产物不会被写出：构建明确失败，而不是产出一个启动即失败的 mock server
    // No empty artifact is emitted: the build fails explicitly instead of producing a
    // mock server that fails on startup
    await expect(generateMockServer({ emitFile } as any, options)).rejects.toThrow(
      /the mock entry was not transformed/,
    )
    expect(emitFile).not.toHaveBeenCalled()
    expect(vi.mocked(options.logger.error)).toHaveBeenCalledWith(
      expect.stringContaining('the mock entry was not transformed'),
    )
    const files = await fs.readdir(cwd)
    expect(files.filter((file) => file.startsWith('mock-data-'))).toEqual([])
  })

  it('should keep the server entry untouched when uploadDir is not configured', async () => {
    const options = createOptions(cwd, { recordEnabled: false, includeRecord: false })
    const emitFile = vi.fn()

    await generateMockServer({ emitFile } as any, options)

    const assets = emitFile.mock.calls.map(([asset]) => asset)
    const entry = assets.find((asset) => asset.fileName === path.join('mockServer', 'index.js'))

    expect(entry.source).not.toContain('mkdirSync')
    expect(entry.source).not.toContain('node:fs')
    expect(entry.source).not.toContain('node:os')
    expect(entry.source).not.toContain('node:path')
    expect(vi.mocked(options.logger.warn)).not.toHaveBeenCalled()
  })
})
