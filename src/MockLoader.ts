import EventEmitter from 'node:events'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import chokidar from 'chokidar'
import type { Metafile } from 'esbuild'
import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import type { MockOptions, MockOptionsItem } from './types'
import { debug, isArray } from './utils'

export interface MockLoaderOptions {
  cwd?: string
  tempDir?: string
  include: string[]
  exclude: string[]
  external: string[]
  define: Record<string, any>
}

export class MockLoader extends EventEmitter {
  moduleCache: Map<string, MockOptions | MockOptionsItem> = new Map()
  moduleDeps: Map<string, Set<string>> = new Map()
  cwd: string
  tempDir: string
  options: MockLoaderOptions
  mockWatcher!: chokidar.FSWatcher
  depsWatcher!: chokidar.FSWatcher
  _mockList: MockOptions = []

  constructor(options: MockLoaderOptions) {
    super()
    this.options = options
    this.cwd = options.cwd || process.cwd()
    this.tempDir = options.tempDir || 'node_modules/.cache/.mock_server'
  }

  get mockList() {
    return this._mockList
  }

  async load() {
    const { include, exclude } = this.options
    const includePaths = await fastGlob(include, {
      cwd: this.cwd,
    })
    const includeFilter = createFilter(include, exclude, {
      resolve: false,
    })
    for (const filepath of includePaths.filter(includeFilter)) {
      await this.loadModule(filepath)
    }
    this.on('mock:update', async (filepath: string) => {
      if (!includeFilter(filepath)) return
      await this.loadModule(filepath)
      this.updateMockList()
    })
    this.on('mock:unlink', async (filepath: string) => {
      if (!includeFilter(filepath)) return
      this.moduleCache.delete(filepath)
      this.updateMockList()
    })
    this.watchMockEntry()
    this.watchDeps()
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
      this.emit('mock:update', filepath)
      debug('watcher:add', filepath)
    })
    watcher.on('change', async (filepath: string) => {
      this.emit('mock:update', filepath)
      debug('watcher:change', filepath)
    })
    watcher.on('unlink', async (filepath: string) => {
      this.emit('mock:unlink', filepath)
      debug('watcher:unlink', filepath)
    })
    this.mockWatcher = watcher
  }

  private watchDeps() {
    const oldDeps: string[] = []
    this.on('update:deps', () => {
      const deps = []
      for (const [dep] of this.moduleDeps.entries()) {
        deps.push(dep)
      }
      if (!this.depsWatcher && deps.length > 0) {
        this.depsWatcher = chokidar.watch(deps, {
          ignoreInitial: true,
          cwd: this.cwd,
        })
        this.depsWatcher.on('change', (filepath) => {
          const mockFiles = this.moduleDeps.get(filepath)
          mockFiles &&
            mockFiles.forEach((file) => {
              this.emit('mock:update', file)
            })
        })
        this.depsWatcher.on('unlink', (filepath) => {
          this.moduleDeps.delete(filepath)
        })
      }
      const exactDeps = deps.filter((dep) => !oldDeps.includes(dep))
      exactDeps.length > 0 && this.depsWatcher.add(exactDeps)
    })
  }

  close() {
    this.mockWatcher?.close()
    this.depsWatcher?.close()
  }

  private updateMockList() {
    const mockList = []
    for (const [, handle] of this.moduleCache.entries()) {
      isArray(handle) ? mockList.push(...handle) : mockList.push(handle)
    }
    this._mockList = mockList.filter(
      (mock) => mock.enabled || typeof mock.enabled === 'undefined'
    )
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
    debug('moduleDeps', this.moduleDeps)
    this.emit('update:deps')
  }

  private async loadModule(filepath?: string) {
    if (!filepath) return
    const { code, deps } = await this.transform(filepath)

    const tempFile = path.join(
      this.cwd,
      this.tempDir,
      filepath.replace(/\.ts$/, '.mjs')
    )
    const tempBasename = path.dirname(tempFile)
    await fs.mkdir(tempBasename, { recursive: true })
    await fs.writeFile(tempFile, code, 'utf8')
    const handle = await import(`${tempFile}?${Date.now()}`)
    const mockConfig =
      handle && handle.default
        ? handle.default
        : Object.keys(handle || {}).map((key) => handle[key])
    this.moduleCache.set(filepath, mockConfig)
    this.updateModuleDeps(filepath, deps)
  }

  private async transform(filepath: string) {
    try {
      const result = await build({
        entryPoints: [filepath],
        outfile: 'out.js',
        write: false,
        target: 'es2020',
        platform: 'node',
        bundle: true,
        external: this.options.external,
        metafile: true,
        format: 'esm',
        define: this.options.define,
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
