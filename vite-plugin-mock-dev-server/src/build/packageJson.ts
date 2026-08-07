import type { Alias } from 'vite'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import { isBuiltin } from 'node:module'
import { getPackageInfoSync } from 'local-pkg'
import { name as __PACKAGE_NAME__, version as __PACKAGE_VERSION__ } from '../../package.json'
import { aliasMatches } from '../compiler/index.js'

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

function normalizePackageName(dep: string): string {
  const [scope, name] = dep.split('/')
  if (scope[0] === '@') {
    return `${scope}/${name}`
  }
  return scope
}

export function generatePackageJson(pkg: Record<string, any>, mockDeps: string[]): string {
  const { dependencies = {}, devDependencies = {} } = pkg
  const dependents = { ...dependencies, ...devDependencies }
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
  const ignores: string[] = ['catalog:', 'file:', 'workspace:']
  for (const dep of mockDeps) {
    const version = dependents[dep] as string | undefined
    if (!version || ignores.some((ignore) => version.startsWith(ignore))) {
      const info = getPackageInfoSync(dep)
      mockPkg.dependencies[dep] = info?.version ? `^${info.version}` : 'latest'
    } else {
      mockPkg.dependencies[dep] = 'latest'
    }
  }
  return JSON.stringify(mockPkg, null, 2)
}
