import type { Alias } from 'vite'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import fs from 'node:fs'
import { createRequire, isBuiltin } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { name as __PACKAGE_NAME__, version as __PACKAGE_VERSION__ } from '../../package.json'
import { aliasMatches } from '../compiler/index.js'
import { customRequire, normalizePackageName } from '../utils/index.js'

/**
 * 从 mock 文件的 importers 中获取依赖
 *
 * @param deps - mock 文件的 importers
 * @param alias - 别名配置
 * @returns - 依赖列表
 */
export function getMockDependencies(
  deps: string[],
  alias: ResolvedMockServerPluginOptions['alias'],
): string[] {
  const list = new Set<string>()
  const excludeDeps = [__PACKAGE_NAME__, 'connect', 'cors']
  const isAlias = (p: string): Alias | undefined => alias.find(({ find }) => aliasMatches(find, p))

  deps.forEach((dep) => {
    const name = normalizePackageName(dep)
    if (
      // 在 esbuild 中 define 会被处理
      name.startsWith('<define:') ||
      // 排除 别名配置的模块
      isAlias(name) ||
      // 排除 node 内置模块
      isBuiltin(name)
    ) {
      return
    }
    // 对于绝对路径和相对路径，直接排除
    if (name[0] === '/' || name.startsWith('./') || name.startsWith('../')) {
      return
    }
    if (!excludeDeps.includes(name)) {
      list.add(name)
    }
  })
  return Array.from(list)
}

export function generatePackageJson(
  pkg: Record<string, any>,
  mockDeps: string[],
  cwd: string = process.cwd(),
): string {
  const { dependencies = {}, devDependencies = {} } = pkg
  const dependents: Record<string, string | undefined> = { ...dependencies, ...devDependencies }
  const mockPkg = {
    name: 'mock-server',
    type: 'module',
    scripts: {
      start: 'node index.js',
    },
    dependencies: {
      connect: '^3.7.0',
      [__PACKAGE_NAME__]: `^${__PACKAGE_VERSION__}`,
      cors: '^2.8.6',
    } as Record<string, string>,
    pnpm: { peerDependencyRules: { ignoreMissing: ['vite'] } },
  }
  for (const dep of mockDeps) {
    mockPkg.dependencies[dep] = resolveDependencyVersion(dep, dependents[dep], cwd)
  }
  return JSON.stringify(mockPkg, null, 2)
}

// 版本范围中不可直接用作安装来源的协议前缀
const IGNORE_PROTOCOLS = /^(?:catalog|file|workspace|link|portal|git(?:\+[^:]+)?|https?):/

/**
 * Pick the dependency version written into the generated `package.json`.
 *
 * 选择写入生成的 `package.json` 中的依赖版本。
 *
 * @param dep - Package name / 包名
 * @param declared - Version range declared in the user's `package.json` / 用户 `package.json` 中声明的版本范围
 * @param cwd - Project root used as the resolution base / 作为解析基准的项目根目录
 * @returns Version range / 版本范围
 */
export function resolveDependencyVersion(
  dep: string,
  declared: string | undefined,
  cwd: string,
): string {
  const version = resolveInstalledVersion(dep, cwd)
  if (version) {
    return `^${version}`
  }
  if (declared && !IGNORE_PROTOCOLS.test(declared)) {
    return declared
  }
  return 'latest'
}

/**
 * Resolve the real `version` of an installed package.
 *
 * 解析已安装依赖的 `version` 真实值。
 *
 * The package is located with `import.meta.resolve` / `require.resolve`, then its
 * `package.json` is read —— so the result is immune to workspace protocols and
 * to nested / hoisted installations.
 *
 * 通过 `import.meta.resolve` / `require.resolve` 定位依赖，再读取其 `package.json`，
 * 因此对 workspace 协议与嵌套 / 提升安装都成立。
 *
 * @param name - Package name / 包名
 * @param cwd - Project root used as the resolution base / 作为解析基准的项目根目录
 * @returns Installed version, `undefined` when it cannot be resolved / 已安装版本，无法解析时为 `undefined`
 */
export function resolveInstalledVersion(name: string, cwd: string): string | undefined {
  const pkgJsonPath = resolveInstalledPackageJson(name, cwd)
  if (!pkgJsonPath) {
    return undefined
  }
  try {
    const { version } = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    return typeof version === 'string' && version ? version : undefined
  } catch {
    return undefined
  }
}

function resolveInstalledPackageJson(name: string, cwd: string): string | undefined {
  const packagePath = resolvePackagePath(name, cwd)
  if (!packagePath) {
    return undefined
  }
  // 从入口文件所在目录向上查找该依赖自身的 `package.json`
  // Walk up from the entry file to the manifest of this dependency
  return findPackageJson(path.dirname(packagePath), name, cwd)
}

/**
 * Locate the entry file of an installed dependency.
 *
 * 定位已安装依赖的入口文件。
 *
 * 解析顺序 / Resolution order:
 * 1. 以项目根目录（`cwd`）为基准创建的 `require.resolve` —— 与依赖在 mock 项目中的解析结果一致，
 *    优先覆盖 pnpm 隔离安装、workspace 与自定义 `cwd` 的场景；
 * 2. `import.meta.resolve` —— 回退到插件可见（含被提升）的安装位置，返回 `file:` URL；
 * 3. `customRequire` —— 以进程 cwd 为基准兜底。
 *
 * @param name - Package name / 包名
 * @param cwd - Project root used as the resolution base / 作为解析基准的项目根目录
 * @returns Absolute path of the entry file / 入口文件的绝对路径
 */
function resolvePackagePath(name: string, cwd: string): string | undefined {
  try {
    return createRequire(path.join(cwd, 'index.js')).resolve(name)
  } catch {}
  try {
    const resolved = import.meta.resolve?.(name)
    if (resolved) {
      return fileURLToPath(resolved)
    }
  } catch {}
  try {
    return customRequire.resolve(name)
  } catch {}
  return undefined
}

/**
 * Find the manifest that belongs to the dependency being resolved.
 *
 * 查找所解析依赖自身的 package.json。
 *
 * 查找区间 / Search scope:
 * - 起始于入口文件所在目录，逐级向上；
 * - **以用户项目（`cwd`）为界**：抵达项目根目录后即停止，不采用项目上下文之外的清单
 *   （依赖通过 link / workspace 安装时其真实路径仍在项目内，因此不再以 `node_modules` 为界）；
 * - 只接受 `name` 与所解析依赖一致的清单：无法读取 / 无法解析、缺少 `name`，
 *   或 `name` 不一致（子目录中的副本、别名依赖）的清单都会被跳过；
 * - 抵达项目根目录或文件系统根目录时返回 `undefined`。
 *
 * @param dir - Directory of the entry file / 入口文件所在目录
 * @param name - Package name being resolved / 所解析的包名
 * @param cwd - Project root, the search boundary / 项目根目录，查找边界
 * @returns Absolute path of the manifest, `undefined` when not found / 清单的绝对路径，未找到时为 `undefined`
 */
function findPackageJson(dir: string, name: string, cwd: string): string | undefined {
  const root = toRealPath(cwd)
  let current = toRealPath(dir)
  while (true) {
    const file = path.join(current, 'package.json')
    if (readPackageName(file) === name) {
      return file
    }
    // 边界：用户项目上下文之外不再查找
    // Boundary: never look beyond the context of the user's project
    if (current === root) {
      return undefined
    }
    const parent = path.dirname(current)
    if (parent === current) {
      return undefined
    }
    current = parent
  }
}

function toRealPath(p: string): string {
  try {
    return fs.realpathSync(p)
  } catch {
    return path.resolve(p)
  }
}

function readPackageName(file: string): string | undefined {
  try {
    const { name } = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return typeof name === 'string' ? name : undefined
  } catch {
    return undefined
  }
}
