import type { FSWatcher } from 'chokidar'
import type { Matcher } from 'picomatch'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import type { MockHttpItem, MockOptions, MockWebsocketItem } from '../types/index.js'
import EventEmitter from 'node:events'
import path from 'node:path'
import process from 'node:process'
import { promiseParallel } from '@pengzhanbo/utils'
import { watch } from 'chokidar'
import { loadPackageJSONSync } from 'local-pkg'
import { glob } from 'tinyglobby'
import { createMatcher, debug, formatError, normalizePath } from '../utils/index.js'
import { compile } from './compile.js'
import { processMockData, processRawData } from './processData.js'

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
  private moduleCache: Map<string, MockOptions | MockHttpItem | MockWebsocketItem> = new Map()

  /**
   * Dependencies mapping for mock modules
   *
   * Mock 模块依赖映射
   */
  private moduleDeps: Map<string, Set<string>> = new Map()

  /**
   * Dependencies whose file has been deleted but whose reverse references are kept
   *
   * 文件已删除、但反向引用仍然保留的依赖
   *
   * Deleting a dependency does not remove the mock files that import it from the
   * mapping: as long as they are there, the dependency can be created again and
   * those mock files can be re-compiled with its new content. This set tells the
   * deps watcher which of the tracked dependencies are currently absent.
   *
   * 删除依赖不会把引用它的 mock 文件从映射中移除：只要这些引用关系还在，
   * 依赖重新创建后就能用新内容重新编译它们。该集合用于标记
   * 依赖监视器当前跟踪的依赖中，哪些正处于「文件缺失」状态。
   */
  private missingDeps: Set<string> = new Set()

  /**
   * Tokens of the compilations that are currently in flight, keyed by mock file
   *
   * 正在进行中的编译令牌，以 mock 文件为键
   *
   * Compilation is asynchronous, so a slow compilation may finish after the mock
   * file has been deleted or re-compiled. Every compilation takes a token and
   * only applies its result while the token is still the current one, otherwise
   * a stale result would resurrect a deleted mock file in the caches.
   *
   * 编译是异步的，一次较慢的编译可能在 mock 文件被删除或重新编译之后才完成。
   * 每次编译都会取得一个令牌，只有令牌仍然是最新的才会写入结果，
   * 否则过期结果会让已删除的 mock 文件在缓存中「复活」。
   */
  private loadTokens: Map<string, symbol> = new Map()

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
    } catch {}
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
   * @param isWatch - Whether to watch for file changes / 是否监视文件变化
   */
  run(isWatch?: boolean): void {
    const { include, exclude } = this.options
    const { pattern, ignore, isMatch } = createMatcher(include, exclude)
    this.loadAll(pattern, ignore)

    if (!isWatch) {
      return
    }

    this.watchMockEntry(isMatch)
    this.watchDeps()

    let timer: NodeJS.Immediate | null = null

    this.on('mock:update', async (filepath: string) => {
      filepath = normalizePath(filepath)

      if (!isMatch(filepath)) {
        return
      }
      const applied = await this.load(filepath)
      // A compilation that was invalidated (the file was deleted, or a newer
      // compilation superseded it) must not report an update: for a deleted file
      // the rules are gone from the cache, and reporting it would restart the ws
      // mocks / full-reload for a file that no longer exists.
      // 被取消的编译（文件已删除或已被更新的编译取代）不应上报更新：
      // 文件已删除时规则已从缓存移除，否则会为已不存在的文件重启 ws mock
      // 或触发全页刷新。
      if (!applied) {
        return
      }
      if (timer) {
        clearImmediate(timer)
      }

      timer = setImmediate(() => {
        this.updateMockData()
        this.emit('mock:update-end', normalizePath(filepath))
        timer = null
      })
    })

    this.on('mock:unlink', (filepath: string) => {
      filepath = normalizePath(filepath)
      if (!isMatch(filepath)) {
        return
      }
      // The watcher emits paths relative to `cwd` and already prefixed with `dir`
      // (e.g. `mock/a.mock.ts`), which is exactly the key used by `moduleCache`.
      // Joining `dir` again would build `mock/mock/a.mock.ts` and silently fail to
      // remove the module, leaving deleted mock rules active until restart.
      // 监视器发出的路径是相对 `cwd` 且已包含 `dir` 前缀的（如 `mock/a.mock.ts`），
      // 正是 `moduleCache` 使用的键。再次拼接 `dir` 会得到 `mock/mock/a.mock.ts`，
      // 导致删除静默失败，被删除的 mock 规则会一直生效直到重启。
      this.moduleCache.delete(filepath)
      // Cancel the compilation that may still be in flight for this file,
      // otherwise `load()` would write the deleted module back into the caches
      // once it resolves (see `loadTokens`).
      // 取消该文件可能仍在进行中的编译，否则 `load()` 完成后会把已删除的模块
      // 写回缓存（见 `loadTokens`）。
      this.loadTokens.delete(filepath)
      this.removeModuleDeps(filepath, true)
      // A deleted mock file may itself be imported by other mock files: keep
      // watching it, so that they can be restored when it is created again.
      // 被删除的 mock 文件也可能被其他 mock 文件引用：继续监视它，
      // 以便它重新创建时恢复这些引用方。
      this.watchDepReturn(filepath)
      this.emit('update:deps')
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
    void this.mockWatcher?.close()
    void this.depsWatcher?.close()
  }

  /**
   * Load and compile all mock files
   *
   * 加载并编译所有 Mock 文件
   *
   * @param pattern - Glob pattern to match mock files / 匹配 Mock 文件的 glob 模式
   * @param ignore - Glob pattern to ignore files / 忽略文件的 glob 模式
   */
  private loadAll(pattern: string[], ignore: string[]): void {
    glob(pattern, { ignore, cwd: normalizePath(path.join(this.cwd, this.options.dir)) })
      /**
       * 控制 文件编译 并发 数量。
       * 当使用 Promise.all 时，可能在一些比较大型的项目中，过多的 mock 文件
       * 可能导致实例化过多的 编译实例而带来过多的内存开销，导致额外的
       * 性能开销，从而影响编译速度。
       * 实测在控制并发数的前提下，总编译时间 差异不大，但内存开销更小更加稳定。
       */
      .then((files) =>
        files.map((file) => () => this.load(normalizePath(path.join(this.options.dir, file)))),
      )
      .then((loaders) => promiseParallel(loaders, 64))
      .then(() => this.updateMockData())
      .catch((e) => this.options.logger.error(formatError(e)))
  }

  /**
   * Load and compile a mock file
   *
   * 加载并编译 Mock 文件
   *
   * @param filepath - Path to the mock file / Mock 文件路径
   * @returns Whether the compilation result was applied; `false` means the mock
   * file was deleted or re-compiled while this compilation was in flight, so its
   * result was discarded.
   *
   * 编译结果是否被写入；`false` 表示编译期间 mock 文件被删除或重新编译，
   * 本次结果已被丢弃。
   */
  private async load(filepath?: string): Promise<boolean> {
    if (!filepath) {
      return false
    }

    const token = Symbol(filepath)
    this.loadTokens.set(filepath, token)

    try {
      const { define, alias, logger } = this.options
      const { data, internalDeps } = await compile(filepath, {
        cwd: this.cwd,
        isESM: this.isESM,
        define,
        alias,
        logger,
      })
      // The mock file may have been deleted (or re-compiled) while compiling:
      // writing the stale result would bring the deleted mock rules back, so it
      // must be dropped before touching the caches.
      // 编译期间 mock 文件可能已被删除（或重新编译）：写入过期结果会让已删除的
      // mock 规则「复活」，因此必须在写入缓存前丢弃。
      if (this.loadTokens.get(filepath) !== token) {
        return false
      }
      this.moduleCache.set(filepath, processRawData(data, filepath))
      this.updateModuleDeps(filepath, internalDeps)
      return true
    } catch (e) {
      // A compilation that fails for an already invalidated file is expected
      // (the file was deleted on purpose), so stay silent in that case.
      // 已被取消的编译失败属于预期情况（文件被有意删除），此时不必报错。
      if (this.loadTokens.get(filepath) !== token) {
        return false
      }
      this.options.logger.error(`Failed to load mock file ${filepath}:\n${formatError(e)}`)
      return true
    } finally {
      if (this.loadTokens.get(filepath) === token) {
        this.loadTokens.delete(filepath)
      }
    }
  }

  /**
   * Update mock data from module cache
   *
   * 从模块缓存更新 Mock 数据
   */
  private updateMockData(): void {
    this._mockData = processMockData(this.moduleCache, this.options.logger)
  }

  /**
   * Update module dependencies
   *
   * 更新模块依赖
   *
   * @param filepath - Path to the mock file / Mock 文件路径
   * @param deps - Dependencies of the mock file / Mock 文件的依赖
   */
  private updateModuleDeps(filepath: string, deps: string[]): void {
    // Drop stale reverse references first: when a mock file is re-compiled its
    // dependency list may shrink, and old entries would otherwise live forever.
    // 先清理过期的反向引用：mock 文件重新编译后依赖列表可能变短，
    // 否则旧条目会永久驻留（内存与 watcher 泄漏）。
    this.removeModuleDeps(filepath)
    for (const dep of deps) {
      if (!this.moduleDeps.has(dep)) {
        this.moduleDeps.set(dep, new Set())
      }

      const cur = this.moduleDeps.get(dep)!
      cur.add(filepath)
    }
    this.emit('update:deps')
  }

  /**
   * Remove a mock file from the dependency mapping
   *
   * 从依赖映射中移除指定的 mock 文件
   *
   * Always removes every reference to the mock file held by other entries, since
   * a file that no longer exists is not a dependency of anything anymore.
   *
   * With `removeSelf` (the file itself has been deleted) the reverse references
   * are kept instead of being dropped: other mock files may still import the
   * deleted file, and that relation is what allows them to be re-compiled once
   * the file is created again. The dep key is marked in `missingDeps`, so the
   * deps watcher can watch for its return and clean the marker up on its own
   * terms. Callers are responsible for emitting `update:deps` once the mapping is
   * settled.
   *
   * 始终移除其他条目对该 mock 文件的引用：文件不存在就不再是任何条目的依赖。
   *
   * 开启 `removeSelf`（文件自身被删除）时，不再丢弃反向引用，而是保留它们：
   * 其他 mock 文件可能仍然引用被删除的文件，而这层关系正是「文件重新创建后
   * 重新编译这些引用方」的依据。该依赖键会被记入 `missingDeps`，
   * 以便依赖监视器等待它重新创建，并自行清理标记。
   * 调用方需在映射稳定后触发 `update:deps`。
   *
   * @param filepath - Path to the mock file / Mock 文件路径
   * @param removeSelf - Whether the file itself has been deleted / 文件自身是否已被删除
   */
  private removeModuleDeps(filepath: string, removeSelf = false): void {
    for (const [dep, mockFiles] of this.moduleDeps) {
      if (mockFiles.delete(filepath) && mockFiles.size === 0) {
        this.moduleDeps.delete(dep)
        this.missingDeps.delete(dep)
      }
    }
    if (!removeSelf) {
      return
    }
    if (this.moduleDeps.has(filepath)) {
      this.missingDeps.add(filepath)
    } else {
      this.missingDeps.delete(filepath)
    }
  }

  /**
   * Watch a deleted dependency for its return
   *
   * 等待已删除的依赖重新创建
   *
   * chokidar stops watching a path once it disappeared, so the dependency has to
   * be registered again to be notified when it is created again.
   *
   * chokidar 在路径消失后会停止监视，因此需要重新注册该依赖，
   * 才能在它被重新创建时收到通知。
   *
   * @param filepath - Path to the deleted dependency / 已删除依赖的路径
   */
  private watchDepReturn(filepath: string): void {
    if (this.missingDeps.has(filepath)) {
      this.depsWatcher.add(filepath)
    }
  }

  /**
   * Re-compile the mock files that import a dependency
   *
   * 重新编译引用该依赖的 mock 文件
   *
   * Used when a deleted dependency has been created again: the mock files that
   * import it still serve the rules compiled from the previous content, so they
   * have to be compiled again to pick up the new version.
   *
   * 用于已删除的依赖被重新创建之后：引用它的 mock 文件仍在提供基于旧内容编译的
   * 规则，因此需要重新编译它们，以获取最新版本。
   *
   * @param filepath - Path to the dependency / 依赖的路径
   */
  private reloadDepMocks(filepath: string): void {
    this.moduleDeps.get(filepath)?.forEach((file) => this.emit('mock:update', file))
  }

  /**
   * Watch mock entry files
   *
   * 监视 Mock 入口文件
   *
   * @param isMatch - Function to check if a file matches the include/exclude pattern / 检查文件是否匹配包含/排除模式的函数
   */
  watchMockEntry(isMatch: Matcher): void {
    const watcher = (this.mockWatcher = watch(this.options.dir, {
      ignoreInitial: true,
      cwd: this.cwd,
      ignored: (filepath, stats) => {
        if (filepath.includes('node_modules')) {
          return true
        }
        // Normalize path for cross-platform compatibility (Windows)
        // 规范化路径以确保跨平台兼容性（Windows）
        return !!stats?.isFile() && !isMatch(normalizePath(filepath))
      },
    }))

    watcher.on('add', (filepath: string) => {
      filepath = normalizePath(filepath)
      this.emit('mock:update', filepath)
      debug('watcher:add', filepath)
    })
    watcher.on('change', (filepath: string) => {
      filepath = normalizePath(filepath)
      this.emit('mock:update', filepath)
      debug('watcher:change', filepath)
    })
    watcher.on('unlink', (filepath: string) => {
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
    const watcher = (this.depsWatcher = watch([...oldDeps], {
      ignoreInitial: true,
      cwd: this.cwd,
    }))
    watcher.on('change', (filepath) => {
      filepath = normalizePath(filepath)
      this.reloadDepMocks(filepath)
    })
    watcher.on('add', (filepath) => {
      filepath = normalizePath(filepath)
      // A deleted dependency has been created again: re-compile every mock file
      // that imports it, so that their rules are updated to the new version.
      // 已删除的依赖被重新创建：重新编译引用它的 mock 文件，
      // 让它们的规则更新为最新版本。
      if (this.missingDeps.delete(filepath)) {
        this.reloadDepMocks(filepath)
      }
    })
    watcher.on('unlink', (filepath) => {
      filepath = normalizePath(filepath)
      this.removeModuleDeps(filepath, true)
      this.watchDepReturn(filepath)
      this.emit('update:deps')
    })

    this.on('update:deps', () => {
      const deps: string[] = [...this.moduleDeps.keys()]
      const addedDeps = deps.filter((dep) => !oldDeps.includes(dep))
      // Release dependencies that are no longer imported by any mock file,
      // otherwise the watcher keeps references to them for the whole session.
      // 释放不再被任何 mock 文件引用的依赖，否则监视器会在整个会话中保留它们。
      const removedDeps = oldDeps.filter((dep) => !deps.includes(dep))
      oldDeps = deps
      if (addedDeps.length > 0) {
        watcher.add(addedDeps)
      }
      if (removedDeps.length > 0) {
        void watcher.unwatch(removedDeps)
      }
    })
  }
}
