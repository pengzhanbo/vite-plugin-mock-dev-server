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
