import type { Metafile } from 'esbuild'
import type { Plugin } from 'vite'
import type { ServerBuildOption } from '../types'
import type { ResolvedMockServerPluginOptions } from './resolvePluginOptions'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import { createFilter } from '@rollup/pluginutils'
import fg from 'fast-glob'
import isCore from 'is-core-module'
import c from 'picocolors'
import { aliasMatches, transformWithEsbuild } from './compiler'
import { lookupFile, normalizePath } from './utils'

type PluginContext<T = Plugin['buildEnd']> = T extends (
  this: infer R,
  ...args: any[]
) => void
  ? R
  : never

export async function generateMockServer(
  ctx: PluginContext,
  options: ResolvedMockServerPluginOptions,
): Promise<void> {
  const include = toArray(options.include)
  const exclude = toArray(options.exclude)
  const cwd = options.cwd || process.cwd()

  let pkg = {}
  try {
    const pkgStr = lookupFile(options.context, ['package.json'])
    if (pkgStr)
      pkg = JSON.parse(pkgStr)
  }
  catch {}

  const outputDir = (options.build as ServerBuildOption).dist!

  const content = await generateMockEntryCode(cwd, include, exclude)
  const mockEntry = path.join(cwd, `mock-data-${Date.now()}.js`)
  await fsp.writeFile(mockEntry, content, 'utf-8')

  const { code, deps } = await transformWithEsbuild(mockEntry, options)
  const mockDeps = getMockDependencies(deps, options.alias)
  await fsp.unlink(mockEntry)

  const outputList = [
    {
      filename: path.join(outputDir, 'mock-data.js'),
      source: code,
    },
    {
      filename: path.join(outputDir, 'index.js'),
      source: generatorServerEntryCode(options),
    },
    {
      filename: path.join(outputDir, 'package.json'),
      source: generatePackageJson(pkg, mockDeps),
    },
  ]
  try {
    if (path.isAbsolute(outputDir)) {
      for (const { filename } of outputList) {
        if (fs.existsSync(filename))
          await fsp.rm(filename)
      }
      options.logger.info(`${c.green('✓')} generate mock server in ${c.cyan(outputDir)}`)
      for (const { filename, source } of outputList) {
        fs.mkdirSync(path.dirname(filename), { recursive: true })
        await fsp.writeFile(filename, source, 'utf-8')
        const sourceSize = (source.length / 1024).toFixed(2)
        const name = path.relative(outputDir, filename)
        const space = name.length < 30 ? ' '.repeat(30 - name.length) : ''
        options.logger.info(`  ${c.green(name)}${space}${c.bold(c.dim(`${sourceSize} kB`))}`)
      }
    }
    else {
      for (const { filename, source } of outputList) {
        ctx.emitFile({
          type: 'asset',
          fileName: filename,
          source,
        })
      }
    }
  }
  catch (e) {
    console.error(e)
  }
}

function getMockDependencies(
  deps: Metafile['inputs'],
  alias: ResolvedMockServerPluginOptions['alias'],
): string[] {
  const list = new Set<string>()
  const excludeDeps = [__PACKAGE_NAME__, 'connect', 'cors']
  const isAlias = (p: string) => alias.find(({ find }) => aliasMatches(find, p))
  Object.keys(deps).forEach((mPath) => {
    const imports = deps[mPath].imports
      .filter(_ => _.external && !_.path.startsWith('<define:') && !isAlias(_.path))
      .map(_ => _.path)
    imports.forEach((dep) => {
      const name = normalizePackageName(dep)
      if (!excludeDeps.includes(name) && !isCore(name))
        list.add(name)
    })
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

function generatePackageJson(pkg: any, mockDeps: string[]) {
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

function generatorServerEntryCode({
  proxies,
  wsProxies,
  cookiesOptions,
  bodyParserOptions,
  priority,
  build,
}: ResolvedMockServerPluginOptions) {
  const { serverPort, log } = build as ServerBuildOption
  // 生成的 entry code 有一个 潜在的问题：
  // formidableOptions 配置在 `vite.config.ts` 中，`formidableOptions` 配置项
  // 支持 function，并不能被 `JSON.stringify` 转换，故会导致生成的
  // 代码中 `formidableOptions` 与 用户配置不一致。
  // 一种解决方式是使用单独的 `vite.mock.config.ts` 之类的插件独立配置文件来处理该问题
  // 但是目前也仅有 需要 build mock server 时有这个 `formidableOptions` 的配置问题，
  // 从功能的优先级上看，还没有实现 `mock.config.ts` 的必要性。
  // 当前也还未收到有用户有关于该功能的潜在问题报告，暂时作为一个 待优化的问题。
  return `import { createServer } from 'node:http';
import connect from 'connect';
import corsMiddleware from 'cors';
import { baseMiddleware, createLogger, mockWebSocket } from 'vite-plugin-mock-dev-server/server';
import mockData from './mock-data.js';

const app = connect();
const server = createServer(app);
const logger = createLogger('mock-server', '${log}');
const proxies = ${JSON.stringify(proxies)};
const wsProxies = ${JSON.stringify(wsProxies)};
const cookiesOptions = ${JSON.stringify(cookiesOptions)};
const bodyParserOptions = ${JSON.stringify(bodyParserOptions)};
const priority = ${JSON.stringify(priority)};
const compiler = { mockData }

mockWebSocket(compiler, server, { wsProxies, cookiesOptions, logger });

app.use(corsMiddleware());
app.use(baseMiddleware(compiler, {
  formidableOptions: { multiples: true },
  proxies,
  priority,
  cookiesOptions,
  bodyParserOptions,
  logger,
}));

server.listen(${serverPort});

console.log('listen: http://localhost:${serverPort}');
`
}

async function generateMockEntryCode(
  cwd: string,
  include: string[],
  exclude: string[],
) {
  const includePaths = await fg(include, { cwd })

  const includeFilter = createFilter(include, exclude, {
    resolve: false,
  })
  const mockFiles = includePaths.filter(includeFilter)

  let importers = ''
  const exporters: string[] = []
  mockFiles.forEach((filepath, index) => {
    // fix: #21
    const file = normalizePath(path.join(cwd, filepath))
    importers += `import * as m${index} from '${file}';\n`
    exporters.push(`[m${index}, '${filepath}']`)
  })
  return `import { transformMockData, transformRawData } from 'vite-plugin-mock-dev-server/server';
${importers}
const exporters = [\n  ${exporters.join(',\n  ')}\n];
const mockList = exporters.map(([mod, filepath]) => {
  const raw = mod.default || mod;
  return transformRawData(raw, filepath);
});
export default transformMockData(mockList);`
}
