import EventEmitter from 'node:events'
import process from 'node:process'
import { hasOwn, isArray, promiseParallel, toArray } from '@pengzhanbo/utils'
import chokidar from 'chokidar'
import type { Metafile } from 'esbuild'
import fastGlob from 'fast-glob'
import type { ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { loadFromCode, transformWithEsbuild } from './compiler'
import { transformMockData } from './transform'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from './types'
import { debug, lookupFile, normalizePath } from './utils'

export interface MockLoaderOptions {
  cwd?: string
  include: string[]
  exclude: string[]
  define: Record<string, any>
  alias: ResolvedConfig['resolve']['alias']
}

/**
 * mock配置加载器
 */
export class MockLoader extends EventEmitter {
  moduleCache: Map<string, MockOptions | MockHttpItem | MockWebsocketItem>
    = new Map()

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
      this.moduleType
        = !!pkg && JSON.parse(pkg).type === 'module' ? 'esm' : 'cjs'
    }
    catch (e) {}
  }

  get mockData() {
    return this._mockData
  }

  load() {
    const { include, exclude } = this.options
    /**
     * 使用 rollup 提供的 include/exclude 规则，
     * 过滤包含文件
     */
    const includeFilter = createFilter(include, exclude, {
      resolve: false,
    })

    fastGlob(include, { cwd: this.cwd })
      /**
       * 控制 文件编译 并发 数量。
       * 当使用 Promise.all 时，可能在一些比较大型的项目中，过多的 mock 文件
       * 可能导致实例化过多的 esbuild 实例而导致带来过多的内存开销，导致额外的
       * 性能开销，从而影响编译速度。
       * 实测在控制并发数的前提下，总编译时间 差异不大，但内存开销更小更加稳定。
       */
      .then(files =>
        files.filter(includeFilter).map(file => () => this.loadMock(file)),
      )
      .then(loadList => promiseParallel(loadList, 10))
      .then(() => this.updateMockList())

    this.watchMockEntry()
    this.watchDeps()

    let timer: NodeJS.Immediate | null = null

    this.on('mock:update', async (filepath: string) => {
      if (!includeFilter(filepath))
        return
      await this.loadMock(filepath)
      timer && clearImmediate(timer)
      timer = setImmediate(() => {
        this.updateMockList()
        this.emit('mock:update-end', filepath)
        timer = null
      })
    })
    this.on('mock:unlink', async (filepath: string) => {
      if (!includeFilter(filepath))
        return
      this.moduleCache.delete(filepath)
      this.updateMockList()
      this.emit('mock:update-end', filepath)
    })
  }

  private watchMockEntry() {
    const { include } = this.options
    const [firstGlob, ...otherGlob] = include
    const watcher = (this.mockWatcher = chokidar.watch(firstGlob, {
      ignoreInitial: true,
      cwd: this.cwd,
    }))
    otherGlob.length > 0 && otherGlob.forEach(glob => watcher.add(glob))

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
      mockFiles
      && mockFiles.forEach((file) => {
        this.emit('mock:update', file)
      })
    })
    this.depsWatcher.on('unlink', (filepath) => {
      filepath = normalizePath(filepath)
      this.moduleDeps.delete(filepath)
    })
    this.on('update:deps', () => {
      const deps = []
      for (const [dep] of this.moduleDeps.entries())
        deps.push(dep)

      const exactDeps = deps.filter(dep => !oldDeps.includes(dep))
      exactDeps.length > 0 && this.depsWatcher.add(exactDeps)
    })
  }

  close() {
    this.mockWatcher?.close()
    this.depsWatcher?.close()
  }

  private updateMockList() {
    this._mockData = transformMockData(this.moduleCache)
  }

  private updateModuleDeps(filepath: string, deps: Metafile['inputs']) {
    Object.keys(deps).forEach((mPath) => {
      const imports = deps[mPath].imports.map(_ => _.path)
      imports.forEach((dep) => {
        if (!this.moduleDeps.has(dep))
          this.moduleDeps.set(dep, new Set())

        const cur = this.moduleDeps.get(dep)!
        cur.add(filepath)
      })
    })
    this.emit('update:deps')
  }

  private async loadMock(filepath?: string): Promise<void> {
    if (!filepath)
      return

    let isESM = false
    if (/\.m[jt]s$/.test(filepath))
      isESM = true

    else if (/\.c[jt]s$/.test(filepath))
      isESM = false

    else
      isESM = this.moduleType === 'esm'

    const { define, alias } = this.options
    const { code, deps } = await transformWithEsbuild(
      filepath,
      { isESM, define, alias },
    )

    try {
      const raw
        = (await loadFromCode<MockHttpItem | MockWebsocketItem | MockOptions>(
          filepath,
          code,
          isESM,
          this.cwd,
        )) || {}
      let mockConfig: MockHttpItem | MockWebsocketItem | MockOptions

      if (hasOwn(raw, 'default')) {
        mockConfig = raw.default
      }
      else {
        mockConfig = []
        Object.keys(raw).forEach(key =>
          (mockConfig as MockOptions).push(...toArray(raw[key])),
        )
      }

      if (isArray(mockConfig)) {
        mockConfig.forEach(mock => ((mock as any).__filepath__ = filepath))
      }
      else {
        ;(mockConfig as any).__filepath__ = filepath
      }
      this.moduleCache.set(filepath, mockConfig)
      this.updateModuleDeps(filepath, deps)
    }
    catch (e) {
      console.error(e)
    }
  }
}
