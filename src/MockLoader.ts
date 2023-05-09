import EventEmitter from 'node:events'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import chokidar from 'chokidar'
import type { Metafile } from 'esbuild'
import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import type { ResolvedConfig } from 'vite'
import { createFilter, normalizePath } from 'vite'
import {
  aliasPlugin,
  externalizeDeps,
  json5Loader,
  jsonLoader,
} from './esbuildPlugin'
import { transformMockData } from './transform'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from './types'
import { debug, getDirname, isArray, lookupFile } from './utils'

export interface MockLoaderOptions {
  cwd?: string
  include: string[]
  exclude: string[]
  define: Record<string, any>
  alias: ResolvedConfig['resolve']['alias']
}

const _dirname = getDirname(import.meta.url)
const _require = createRequire(_dirname)

/**
 * mock配置加载器
 */
export class MockLoader extends EventEmitter {
  moduleCache: Map<string, MockOptions | MockHttpItem | MockWebsocketItem> =
    new Map()

  moduleDeps: Map<string, Set<string>> = new Map()
  cwd: string
  mockWatcher!: chokidar.FSWatcher
  depsWatcher!: chokidar.FSWatcher
  moduleType: 'cjs' | 'esm' = 'cjs'

  private _mockData: Record<string, MockOptions> = {}

  constructor(public options: MockLoaderOptions) {
    super()
    this.cwd = options.cwd || process.cwd()
    try {
      const pkg = lookupFile(this.cwd, ['package.json'])
      this.moduleType =
        !!pkg && JSON.parse(pkg).type === 'module' ? 'esm' : 'cjs'
    } catch (e) {}
  }

  get mockData() {
    return this._mockData
  }

  public load() {
    const { include, exclude } = this.options
    /**
     * 使用 rollup 提供的 include/exclude 规则，
     * 过滤包含文件
     */
    const includeFilter = createFilter(include, exclude, {
      resolve: false,
    })

    /**
     * 由于之前使用 串行 解析加载 mock文件，
     * 可能在比较大型的项目中，mock文件多的情况下会产生比较长的时间开销，
     * 改成 并行 解析加载，同时，将 async/await 改为 promise，
     * 在不影响功能的前提下，首次解析mock文件将不会阻塞 vite 启动开发服务。
     */
    fastGlob(include, {
      cwd: this.cwd,
    })
      .then((includePaths) =>
        Promise.all(
          includePaths
            .filter(includeFilter)
            .map((filepath) => this.loadMock(filepath)),
        ),
      )
      .then(() => this.updateMockList())

    this.watchMockEntry()
    this.watchDeps()

    let timer: NodeJS.Immediate | null = null

    this.on('mock:update', async (filepath: string) => {
      if (!includeFilter(filepath)) return
      await this.loadMock(filepath)
      timer && clearImmediate(timer)
      timer = setImmediate(() => {
        this.updateMockList()
        this.emit('mock:update-end', filepath)
        timer = null
      })
    })
    this.on('mock:unlink', async (filepath: string) => {
      if (!includeFilter(filepath)) return
      this.moduleCache.delete(filepath)
      this.updateMockList()
      this.emit('mock:update-end', filepath)
    })
  }

  private watchMockEntry() {
    const { include } = this.options
    const [firstGlob, ...otherGlob] = include
    const watcher = chokidar.watch(firstGlob, {
      ignoreInitial: true,
      cwd: this.cwd,
    })
    otherGlob.length > 0 && otherGlob.forEach((glob) => watcher.add(glob))

    watcher.on('add', async (filepath: string) => {
      filepath = normalizePath(filepath)
      this.emit('mock:update', filepath)
      debug('watcher:add', filepath)
    })
    watcher.on('change', async (filepath: string) => {
      filepath = normalizePath(filepath)
      this.emit('mock:update', filepath)
      debug('watcher:change', filepath)
    })
    watcher.on('unlink', async (filepath: string) => {
      filepath = normalizePath(filepath)
      this.emit('mock:unlink', filepath)
      debug('watcher:unlink', filepath)
    })
    this.mockWatcher = watcher
  }

  /**
   * 监听 mock文件依赖的本地文件变动，
   * mock依赖文件更新，mock文件也一并更新
   */
  private watchDeps() {
    const oldDeps: string[] = []
    this.depsWatcher = chokidar.watch([], {
      ignoreInitial: true,
      cwd: this.cwd,
    })
    this.depsWatcher.on('change', (filepath) => {
      filepath = normalizePath(filepath)
      const mockFiles = this.moduleDeps.get(filepath)
      mockFiles &&
        mockFiles.forEach((file) => {
          this.emit('mock:update', file)
        })
    })
    this.depsWatcher.on('unlink', (filepath) => {
      filepath = normalizePath(filepath)
      this.moduleDeps.delete(filepath)
    })
    this.on('update:deps', () => {
      const deps = []
      for (const [dep] of this.moduleDeps.entries()) {
        deps.push(dep)
      }
      const exactDeps = deps.filter((dep) => !oldDeps.includes(dep))
      exactDeps.length > 0 && this.depsWatcher.add(exactDeps)
    })
  }

  public close() {
    this.mockWatcher?.close()
    this.depsWatcher?.close()
  }

  private updateMockList() {
    this._mockData = transformMockData(this.moduleCache)
  }

  private updateModuleDeps(filepath: string, deps: Metafile['inputs']) {
    Object.keys(deps).forEach((mPath) => {
      const imports = deps[mPath].imports.map((_) => _.path)
      imports.forEach((dep) => {
        if (!this.moduleDeps.has(dep)) {
          this.moduleDeps.set(dep, new Set())
        }
        const cur = this.moduleDeps.get(dep)!
        cur.add(filepath)
      })
    })
    this.emit('update:deps')
  }

  private async loadMock(filepath?: string): Promise<void> {
    if (!filepath) return
    let isESM = false
    if (/\.m[jt]s$/.test(filepath)) {
      isESM = true
    } else if (/\.c[jt]s$/.test(filepath)) {
      isESM = false
    } else {
      isESM = this.moduleType === 'esm'
    }
    const { code, deps } = await this.transformWithEsbuild(filepath, isESM)

    try {
      const raw = (await this.loadFromCode(filepath, code, isESM)) || {}
      let mockConfig
      if (raw.default) {
        mockConfig = raw.default
      } else {
        mockConfig = []
        Object.keys(raw).forEach((key) => {
          isArray(raw[key])
            ? mockConfig.push(...raw[key])
            : mockConfig.push(raw[key])
        })
      }

      if (isArray(mockConfig)) {
        mockConfig.forEach((mock) => (mock.__filepath__ = filepath))
      } else {
        mockConfig.__filepath__ = filepath
      }
      this.moduleCache.set(filepath, mockConfig)
      this.updateModuleDeps(filepath, deps)
    } catch (e) {
      console.error(e)
    }
  }

  private async loadFromCode(filepath: string, code: string, isESM: boolean) {
    if (isESM) {
      const fileBase = `${filepath}.timestamp-${Date.now()}`
      const fileNameTmp = `${fileBase}.mjs`
      const fileUrl = `${pathToFileURL(fileBase)}.mjs`
      await fs.promises.writeFile(fileNameTmp, code, 'utf8')
      try {
        return await import(fileUrl)
      } finally {
        try {
          fs.unlinkSync(fileNameTmp)
        } catch {}
      }
    } else {
      filepath = path.resolve(this.cwd, filepath)
      const extension = path.extname(filepath)
      const realFileName = fs.realpathSync(filepath)
      const loaderExt = extension in _require.extensions ? extension : '.js'
      const defaultLoader = _require.extensions[loaderExt]!
      _require.extensions[loaderExt] = (
        module: NodeModule,
        filename: string,
      ) => {
        if (filename === realFileName) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(module as any)._compile(code, filename)
        } else {
          defaultLoader(module, filename)
        }
      }
      delete _require.cache[_require.resolve(filepath)]
      const raw = _require(filepath)
      _require.extensions[loaderExt] = defaultLoader
      return raw.__esModule ? raw : { default: raw }
    }
  }

  private async transformWithEsbuild(filepath: string, isESM: boolean) {
    try {
      const result = await build({
        entryPoints: [filepath],
        outfile: 'out.js',
        write: false,
        target: ['node14.18', 'node16'],
        platform: 'node',
        bundle: true,
        metafile: true,
        format: isESM ? 'esm' : 'cjs',
        define: this.options.define,
        plugins: [
          aliasPlugin(this.options.alias),
          externalizeDeps,
          jsonLoader,
          json5Loader,
        ],
      })
      return {
        code: result.outputFiles[0].text,
        deps: result.metafile?.inputs || {},
      }
    } catch (e) {
      console.error(e)
    }
    return {
      code: '',
      deps: {},
    }
  }
}
