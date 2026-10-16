/**
 * Tests for the `package.json` generated for the standalone mock server
 *
 * 独立 Mock 服务生成的 `package.json` 测试
 */
import { readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  generatePackageJson,
  resolveDependencyVersion,
  resolveInstalledVersion,
} from '../src/build/packageJson.js'

const require = createRequire(import.meta.url)

/**
 * Read the version of an installed package, using `require.resolve` directly ——
 * used as an independent oracle in the specs.
 *
 * 直接使用 `require.resolve` 读取已安装依赖的版本，作为用例中的独立参照。
 *
 * @param name - Package name / 包名
 * @returns Version / 版本
 */
function getInstalledVersion(name: string): string {
  const pkgJsonPath = require.resolve(`${name}/package.json`)
  return JSON.parse(readFileSync(pkgJsonPath, 'utf-8')).version
}

/**
 * Create a fake installed package under `<cwd>/node_modules`
 *
 * 在 `<cwd>/node_modules` 下创建一个假的已安装依赖
 *
 * @param cwd - Project root / 项目根目录
 * @param name - Package name / 包名
 * @param pkg - Contents of the package manifest / 包清单内容
 */
async function installPackage(cwd: string, name: string, pkg: Record<string, any>): Promise<void> {
  const dir = path.join(cwd, 'node_modules', name)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(pkg), 'utf-8')
  await fs.writeFile(path.join(dir, 'index.js'), 'export default {}', 'utf-8')
}

/**
 * Write a project manifest with a recognizable version
 *
 * 写入一个带有可识别版本号的项目清单
 *
 * @param cwd - Project root / 项目根目录
 */
async function writeProjectManifest(cwd: string): Promise<void> {
  await fs.writeFile(
    path.join(cwd, 'package.json'),
    JSON.stringify({ name: 'project', version: '0.0.0-project' }),
    'utf-8',
  )
}

/**
 * Test suite for resolving the installed version of a package
 *
 * 依赖已安装版本解析测试套件
 */
describe('resolveInstalledVersion', () => {
  let cwd: string

  beforeEach(async () => {
    cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-package-json-'))
  })

  afterEach(async () => {
    await fs.rm(cwd, { recursive: true, force: true })
  })

  it('should read the version of a package installed in the project', async () => {
    await installPackage(cwd, 'fake-dep', { name: 'fake-dep', version: '1.1.0' })

    expect(resolveInstalledVersion('fake-dep', cwd)).toBe('1.1.0')
  })

  it('should support scoped packages', async () => {
    await installPackage(cwd, '@fake/scope-dep', { name: '@fake/scope-dep', version: '0.4.2' })

    expect(resolveInstalledVersion('@fake/scope-dep', cwd)).toBe('0.4.2')
  })

  it('should support packages that restrict their `exports`', async () => {
    await installPackage(cwd, 'fake-exports-dep', {
      name: 'fake-exports-dep',
      version: '3.2.1',
      exports: { '.': './index.js' },
    })

    expect(resolveInstalledVersion('fake-exports-dep', cwd)).toBe('3.2.1')
  })

  it('should return undefined when the package is not installed', () => {
    expect(resolveInstalledVersion('never-installed-dep', cwd)).toBeUndefined()
  })

  it('should return undefined when the installed manifest has no version', async () => {
    await installPackage(cwd, 'fake-no-version-dep', { name: 'fake-no-version-dep' })

    expect(resolveInstalledVersion('fake-no-version-dep', cwd)).toBeUndefined()
  })

  it('should skip manifests without a `name` field', async () => {
    // 缺少 name 的清单不可信；项目清单名称不一致，同样不会被采用
    // A manifest without a `name` is not trusted, and the project manifest is not a match
    await installPackage(cwd, 'fake-nameless-dep', { version: '9.9.9' })
    await writeProjectManifest(cwd)

    expect(resolveInstalledVersion('fake-nameless-dep', cwd)).toBeUndefined()
  })

  it('should only accept the manifest of the resolved package', async () => {
    // 目录名与清单 name 不一致时（如别名依赖），不视为该依赖自身的清单
    // A manifest whose `name` differs (e.g. an aliased dependency) is not accepted
    await installPackage(cwd, 'fake-alias-dep', { name: 'axios', version: '1.7.0' })
    await writeProjectManifest(cwd)

    expect(resolveInstalledVersion('fake-alias-dep', cwd)).toBeUndefined()
    expect(resolveDependencyVersion('fake-alias-dep', 'npm:axios@^1.7.0', cwd)).toBe(
      'npm:axios@^1.7.0',
    )
  })

  it('should not fall back to the project manifest when the dependency has none', async () => {
    // 依赖目录内没有任何清单时，只会在项目上下文中继续查找，最终落到项目清单但名称不一致
    // Without a manifest inside the dependency, the lookup ends at the (mismatching) project manifest
    const dir = path.join(cwd, 'node_modules', 'fake-boundary-dep')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, 'index.js'), 'export default {}', 'utf-8')
    await writeProjectManifest(cwd)

    expect(resolveInstalledVersion('fake-boundary-dep', cwd)).toBeUndefined()
  })

  it('should not look for manifests outside the project context', async () => {
    // 同名清单只存在于项目之外的上级目录时，不应被采用
    // A matching manifest living above the project must not be picked up
    const project = path.join(cwd, 'project')
    const depDir = path.join(project, 'node_modules', 'fake-hoisted-dep')
    await fs.mkdir(depDir, { recursive: true })
    await fs.writeFile(path.join(depDir, 'index.js'), 'export default {}', 'utf-8')
    await fs.writeFile(
      path.join(cwd, 'package.json'),
      JSON.stringify({ name: 'fake-hoisted-dep', version: '7.0.0' }),
      'utf-8',
    )

    expect(resolveInstalledVersion('fake-hoisted-dep', project)).toBeUndefined()
  })

  it('should skip manifests that cannot be parsed and keep walking up', async () => {
    // 入口位于子目录，且该子目录中的 package.json 已损坏时，应跳过它并命中依赖自身的清单
    // The entry lives in a subdirectory holding a broken manifest, which must be skipped
    await installPackage(cwd, 'fake-nested-dep', {
      name: 'fake-nested-dep',
      version: '2.5.0',
      main: 'lib/index.js',
    })
    const libDir = path.join(cwd, 'node_modules', 'fake-nested-dep', 'lib')
    await fs.mkdir(libDir, { recursive: true })
    await fs.writeFile(path.join(libDir, 'package.json'), '{ broken: json', 'utf-8')
    await fs.writeFile(path.join(libDir, 'index.js'), 'export default {}', 'utf-8')
    await writeProjectManifest(cwd)

    expect(resolveInstalledVersion('fake-nested-dep', cwd)).toBe('2.5.0')
  })

  it('should resolve a package installed outside the project', () => {
    // 项目内解析不到时，回退到 `import.meta.resolve` 命中插件可见的安装位置（此处为仓库自身的依赖）
    // Falls back to `import.meta.resolve` from a location visible to the plugin
    expect(resolveInstalledVersion('vitest', cwd)).toBe(getInstalledVersion('vitest'))
  })

  it('should never fall back to the manifest of the project itself', async () => {
    // 回归：`import.meta.resolve` 返回 `file:` URL，未经转换时向上查找会走到相对路径
    // `package.json`，导致所有依赖都拿到项目自身的版本
    // Regression: an unresolved location used to walk up to the relative `package.json`
    await writeProjectManifest(cwd)

    expect(resolveInstalledVersion('vitest', cwd)).toBe(getInstalledVersion('vitest'))
    expect(resolveInstalledVersion('never-installed-dep', cwd)).toBeUndefined()
  })
})

/**
 * Test suite for picking the version written into the generated manifest
 *
 * 写入生成清单的依赖版本选择测试套件
 */
describe('resolveDependencyVersion', () => {
  let cwd: string

  beforeEach(async () => {
    cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-package-json-'))
  })

  afterEach(async () => {
    await fs.rm(cwd, { recursive: true, force: true })
  })

  it('should prefer the installed version over a catalog protocol declaration', async () => {
    await installPackage(cwd, 'fake-dep', { name: 'fake-dep', version: '1.1.0' })

    expect(resolveDependencyVersion('fake-dep', 'catalog:prod', cwd)).toBe('^1.1.0')
  })

  it('should prefer the installed version over a stale declared range', async () => {
    await installPackage(cwd, 'fake-dep-b', { name: 'fake-dep-b', version: '4.17.21' })

    expect(resolveDependencyVersion('fake-dep-b', '^4.0.0', cwd)).toBe('^4.17.21')
  })

  it('should keep the declared range when the package is not resolvable', () => {
    expect(resolveDependencyVersion('never-installed-dep', '~1.6.0', cwd)).toBe('~1.6.0')
  })

  it('should fall back to `latest` for unresolvable workspace protocols', () => {
    expect(resolveDependencyVersion('never-installed-dep', 'catalog:prod', cwd)).toBe('latest')
    expect(resolveDependencyVersion('never-installed-dep', 'workspace:^', cwd)).toBe('latest')
    expect(resolveDependencyVersion('never-installed-dep', 'file:../dep', cwd)).toBe('latest')
  })

  it('should fall back to `latest` when nothing is declared', () => {
    expect(resolveDependencyVersion('never-installed-dep', undefined, cwd)).toBe('latest')
  })
})

/**
 * Test suite for the generated package manifest
 *
 * 生成的包清单测试套件
 */
describe('generatePackageJson', () => {
  let cwd: string

  beforeEach(async () => {
    cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-package-json-'))
  })

  afterEach(async () => {
    await fs.rm(cwd, { recursive: true, force: true })
  })

  it('should write the resolved versions of the mock dependencies', async () => {
    await installPackage(cwd, 'fake-dep', { name: 'fake-dep', version: '1.1.0' })
    await installPackage(cwd, 'fake-dep-b', { name: 'fake-dep-b', version: '1.11.13' })

    const json = JSON.parse(
      generatePackageJson(
        { dependencies: { 'fake-dep': 'catalog:prod', 'fake-dep-b': '^1.11.0' } },
        ['fake-dep', 'fake-dep-b'],
        cwd,
      ),
    )

    expect(json.dependencies['fake-dep']).toBe('^1.1.0')
    expect(json.dependencies['fake-dep-b']).toBe('^1.11.13')
  })

  it('should keep the runtime dependencies and metadata of the server', () => {
    const json = JSON.parse(generatePackageJson({}, [], cwd))

    expect(json.name).toBe('mock-server')
    expect(json.type).toBe('module')
    expect(json.scripts.start).toBe('node index.js')
    expect(json.dependencies.connect).toBe('^3.7.0')
    expect(json.dependencies.cors).toBe('^2.8.6')
    expect(json.dependencies['vite-plugin-mock-dev-server']).toMatch(/^\^\d+\.\d+\.\d+/)
    expect(json.pnpm).toEqual({ peerDependencyRules: { ignoreMissing: ['vite'] } })
  })

  it('should fall back to the declared range or `latest` when unresolved', () => {
    const json = JSON.parse(
      generatePackageJson(
        { devDependencies: { 'declared-dep': '~1.6.0', 'protocol-dep': 'catalog:prod' } },
        ['declared-dep', 'protocol-dep', 'never-installed-dep'],
        cwd,
      ),
    )

    expect(json.dependencies['declared-dep']).toBe('~1.6.0')
    expect(json.dependencies['protocol-dep']).toBe('latest')
    expect(json.dependencies['never-installed-dep']).toBe('latest')
  })
})
