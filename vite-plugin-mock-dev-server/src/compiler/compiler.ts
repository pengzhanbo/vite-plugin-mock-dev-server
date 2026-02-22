import type { FSWatcher } from 'chokidar'
import type { Matcher } from 'picomatch'
import type { ResolvedMockServerPluginOptions } from '../options'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from '../types'
import EventEmitter from 'node:events'
import path from 'node:path'
import process from 'node:process'
import { promiseParallel } from '@pengzhanbo/utils'
import { watch } from 'chokidar'
import { loadPackageJSONSync } from 'local-pkg'
import { glob } from 'tinyglobby'
import { createMatcher, debug, normalizePath } from '../utils'
import { compile } from './compile'
import { processMockData, processRawData } from './processData'

/**
 * Mock file loading and compilation, converting to Mock data
 *
 * Mock 文件加载编译，并转换为 Mock 数据
 */
export class Compiler extends EventEmitter {
  /**
   * Cache for mock modules
   *
   * Mock 模块缓存
   */
  private moduleCache: Map<string, MockOptions | MockHttpItem | MockWebsocketItem>
    = new Map()

  /**
   * Dependencies mapping for mock modules
   *
   * Mock 模块依赖映射
   */
  private moduleDeps: Map<string, Set<string>> = new Map()

  /**
   * Current working directory
   *
   * 当前工作目录
   */
  cwd: string

  /**
   * File watcher for mock files
   *
   * Mock 文件监视器
   */
  private mockWatcher!: FSWatcher

  /**
   * File watcher for dependency files
   *
   * 依赖文件监视器
   */
  private depsWatcher!: FSWatcher

  /**
   * Whether the project uses ES modules
   *
   * 项目是否使用 ES 模块
   */
  private isESM = false

  /**
   * Processed mock data
   *
   * 处理后的 Mock 数据
   */
  private _mockData: Record<string, MockOptions> = {}

  /**
   * Resolved plugin options
   *
   * 解析后的插件配置项
   */
  options!: ResolvedMockServerPluginOptions

  /**
   * Constructor
   *
   * 构造函数
   *
   * @param options - Resolved plugin options / 解析后的插件配置项
   */
  constructor(options: ResolvedMockServerPluginOptions) {
    super()
    this.options = options
    this.cwd = options.cwd || process.cwd()
    try {
      const pkg = loadPackageJSONSync(this.cwd)
      this.isESM = pkg?.type === 'module'
    }
    catch {}
  }

  /**
   * Get processed mock data
   *
   * 获取处理后的 Mock 数据
   *
   * @returns Processed mock data / 处理后的 Mock 数据
   */
  get mockData(): Record<string, MockOptions> {
    return this._mockData
  }

  /**
   * Run the compiler
   *
   * 运行编译器
   *
   * @param watch - Whether to watch for file changes / 是否监视文件变化
   */
  run(watch?: boolean): void {
    const { include, exclude } = this.options
    const { pattern, ignore, isMatch } = createMatcher(include, exclude)

    glob(pattern, { ignore, cwd: path.join(this.cwd, this.options.dir) })
    /**
     * 控制 文件编译 并发 数量。
     * 当使用 Promise.all 时，可能在一些比较大型的项目中，过多的 mock 文件
     * 可能导致实例化过多的 esbuild 实例而导致带来过多的内存开销，导致额外的
     * 性能开销，从而影响编译速度。
     * 实测在控制并发数的前提下，总编译时间 差异不大，但内存开销更小更加稳定。
     */
      .then(files => files.map(file => () => this.load(normalizePath(path.join(this.options.dir, file)))))
      .then(loaders => promiseParallel(loaders, 64))
      .then(() => this.updateMockData())

    if (!watch)
      return

    this.watchMockEntry(isMatch)
    this.watchDeps()

    let timer: NodeJS.Immediate | null = null

    this.on('mock:update', async (filepath: string) => {
      if (!isMatch(filepath))
        return
      await this.load(filepath)
      if (timer)
        clearImmediate(timer)

      timer = setImmediate(() => {
        this.updateMockData()
        this.emit('mock:update-end', normalizePath(filepath))
        timer = null
      })
    })
    this.on('mock:unlink', async (filepath: string) => {
      if (!isMatch(filepath))
        return
      filepath = normalizePath(path.join(this.options.dir, filepath))
      this.moduleCache.delete(filepath)
      this.updateMockData()
      this.emit('mock:update-end', filepath)
    })
  }

  /**
   * Close the compiler and watchers
   *
   * 关闭编译器和监视器
   */
  close(): void {
    this.mockWatcher?.close()
    this.depsWatcher?.close()
  }

  /**
   * Load and compile a mock file
   *
   * 加载并编译 Mock 文件
   *
   * @param filepath - Path to the mock file / Mock 文件路径
   */
  private async load(filepath?: string) {
    if (!filepath)
      return

    try {
      const { define, alias } = this.options
      const { data, deps } = await compile(filepath, {
        cwd: this.cwd,
        isESM: this.isESM,
        define,
        alias,
      })
      this.moduleCache.set(filepath, processRawData(data, filepath))
      this.updateModuleDeps(filepath, deps)
    }
    catch (e) {
      console.error(e)
    }
  }

  /**
   * Update mock data from module cache
   *
   * 从模块缓存更新 Mock 数据
   */
  private updateMockData() {
    this._mockData = processMockData(this.moduleCache)
  }

  /**
   * Update module dependencies
   *
   * 更新模块依赖
   *
   * @param filepath - Path to the mock file / Mock 文件路径
   * @param deps - Dependencies of the mock file / Mock 文件的依赖
   */
  private updateModuleDeps(filepath: string, deps: string[]) {
    for (const dep of deps) {
      if (!this.moduleDeps.has(dep))
        this.moduleDeps.set(dep, new Set())

      const cur = this.moduleDeps.get(dep)!
      cur.add(filepath)
    }
    this.emit('update:deps')
  }

  /**
   * Watch mock entry files
   *
   * 监视 Mock 入口文件
   *
   * @param isMatch - Function to check if a file matches the include/exclude pattern / 检查文件是否匹配包含/排除模式的函数
   */
  watchMockEntry(isMatch: Matcher): void {
    const watcher = this.mockWatcher = watch(this.options.dir, {
      ignoreInitial: true,
      cwd: this.cwd,
      ignored: (filepath, stats) => {
        if (filepath.includes('node_modules'))
          return true
        return !!stats?.isFile() && !isMatch(filepath)
      },
    })

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
   * Watch dependency files
   *
   * 监视依赖文件
   */
  watchDeps(): void {
    let oldDeps: string[] = [...this.moduleDeps.keys()]
    const watcher = this.depsWatcher = watch([...oldDeps], {
      ignoreInitial: true,
      cwd: this.cwd,
    })
    watcher.on('change', (filepath) => {
      filepath = normalizePath(filepath)
      const mockFiles = this.moduleDeps.get(filepath)
      mockFiles?.forEach(file => this.emit('mock:update', file))
    })
    watcher.on('unlink', (filepath) => {
      filepath = normalizePath(filepath)
      this.moduleDeps.delete(filepath)
    })

    this.on('update:deps', () => {
      const deps: string[] = [...this.moduleDeps.keys()]
      const exactDeps = deps.filter(dep => !oldDeps.includes(dep))
      oldDeps = deps
      if (exactDeps.length > 0)
        watcher.add(exactDeps)
    })
  }
}
