import type { ResolvedMockServerPluginOptions } from '../options'
import isCore from 'is-core-module'
import { aliasMatches } from '../compiler'

export function getMockDependencies(
  deps: string[],
  alias: ResolvedMockServerPluginOptions['alias'],
): string[] {
  const list = new Set<string>()
  const excludeDeps = [__PACKAGE_NAME__, 'connect', 'cors']
  const isAlias = (p: string) => alias.find(({ find }) => aliasMatches(find, p))
  deps.forEach((dep) => {
    const name = normalizePackageName(dep)
    if (name.startsWith('<define:') || isAlias(name) || isCore(name))
      return
    if (name[0] === '/' || name[0] === '.')
      return
    if (!excludeDeps.includes(name))
      list.add(name)
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

export function generatePackageJson(pkg: any, mockDeps: string[]) {
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
      cors: '^2.8.5',
    } as Record<string, string>,
    pnpm: { peerDependencyRules: { ignoreMissing: ['vite'] } },
  }
  mockDeps.forEach((dep) => {
    mockPkg.dependencies[dep] = dependents[dep] || 'latest'
  })
  return JSON.stringify(mockPkg, null, 2)
}
