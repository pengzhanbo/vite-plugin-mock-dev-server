import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import type { Metafile } from 'esbuild'
import fg from 'fast-glob'
import isCore from 'is-core-module'
import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import c from 'picocolors'
import { aliasMatches, transformWithEsbuild } from './compiler'
import { viteDefine } from './define'
import type { MockServerPluginOptions, ServerBuildOption } from './types'
import { ensureProxies, lookupFile, normalizePath } from './utils'

declare const __PACKAGE_NAME__: string
declare const __PACKAGE_VERSION__: string

const packageName = typeof __PACKAGE_NAME__ === 'string' ? __PACKAGE_NAME__ : 'vite-plugin-mock-dev-server'
const packageVersion = typeof __PACKAGE_VERSION__ === 'string' ? __PACKAGE_VERSION__ : 'latest'

type PluginContext<T = Plugin['buildEnd']> = T extends (
  this: infer R,
  ...args: any[]
) => void
  ? R
  : never

export async function generateMockServer(
  ctx: PluginContext,
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>,
) {
  const include = toArray(options.include)
  const exclude = toArray(options.exclude)
  const define = viteDefine(config)
  const cwd = options.cwd || process.cwd()

  const { httpProxies } = ensureProxies(config.server.proxy || {})
  httpProxies.push(...toArray(options.prefix))
  const wsProxies = toArray(options.wsPrefix)

  let pkg = {}
  try {
    const pkgStr = lookupFile(config.root, ['package.json'])
    if (pkgStr)
      pkg = JSON.parse(pkgStr)
  }
  catch {}

  const outputDir = (options.build as ServerBuildOption).dist!

  const content = await generateMockEntryCode(cwd, include, exclude)
  const mockEntry = path.join(cwd, `mock-data-${Date.now()}.js`)
  await fsp.writeFile(mockEntry, content, 'utf-8')
  const { code, deps } = await transformWithEsbuild(mockEntry, {
    define,
    alias: config.resolve.alias,
  })
  const mockDeps = getMockDependencies(deps, config.resolve.alias)
  await fsp.unlink(mockEntry)
  const outputList = [
    {
      filename: path.join(outputDir, 'mock-data.js'),
      source: code,
    },
    {
      filename: path.join(outputDir, 'index.js'),
      source: generatorServerEntryCode(
        httpProxies,
        wsProxies,
        options.cookiesOptions,
        options.bodyParserOptions,
        options.priority,
        options.build as ServerBuildOption,
      ),
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
      config.logger.info(`${c.green('✓')} generate mock server in ${c.cyan(outputDir)}`)
      for (const { filename, source } of outputList) {
        fs.mkdirSync(path.dirname(filename), { recursive: true })
        await fsp.writeFile(filename, source, 'utf-8')
        const sourceSize = (source.length / 1024).toFixed(2)
        const name = path.relative(outputDir, filename)
        const space = name.length < 30 ? ' '.repeat(30 - name.length) : ''
        config.logger.info(`  ${c.green(name)}${space}${c.bold(c.dim(`${sourceSize} kB`))}`)
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

function getMockDependencies(deps: Metafile['inputs'], alias: ResolvedConfig['resolve']['alias']): string[] {
  const list = new Set<string>()
  const excludeDeps = [packageName, 'connect', 'cors']
  const isAlias = (p: string) => alias.find(({ find }) => aliasMatches(find, p))
  Object.keys(deps).forEach((mPath) => {
    const imports = deps[mPath].imports
      .filter(_ => _.external && !_.path.startsWith('<define:') && !isAlias(_.path))
      .map(_ => _.path)
    imports.forEach((dep) => {
      if (!excludeDeps.includes(dep) && !isCore(dep))
        list.add(dep)
    })
  })
  return Array.from(list)
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
      'connect': '^3.7.0',
      'vite-plugin-mock-dev-server': `^${packageVersion}`,
      'cors': '^2.8.5',
    } as Record<string, string>,
    pnpm: { peerDependencyRules: { ignoreMissing: ['vite'] } },
  }
  mockDeps.forEach((dep) => {
    mockPkg.dependencies[dep] = dependents[dep] || 'latest'
  })
  return JSON.stringify(mockPkg, null, 2)
}

function generatorServerEntryCode(
  httpProxies: string[],
  wsProxies: string[],
  cookiesOptions: MockServerPluginOptions['cookiesOptions'] = {},
  bodyParserOptions: MockServerPluginOptions['bodyParserOptions'] = {},
  priority: MockServerPluginOptions['priority'] = {},
  build: ServerBuildOption,
) {
  const { serverPort, log } = build
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
import { baseMiddleware, createLogger, mockWebSocket } from 'vite-plugin-mock-dev-server';
import mockData from './mock-data.js';

const app = connect();
const server = createServer(app);
const logger = createLogger('mock-server', '${log}');
const httpProxies = ${JSON.stringify(httpProxies)};
const wsProxies = ${JSON.stringify(wsProxies)};
const cookiesOptions = ${JSON.stringify(cookiesOptions)};
const bodyParserOptions = ${JSON.stringify(bodyParserOptions)};
const priority = ${JSON.stringify(priority)};

mockWebSocket({ 
  loader: { mockData },
  httpServer: server,
  proxies: wsProxies,
  cookiesOptions,
  logger,
});

app.use(corsMiddleware());
app.use(baseMiddleware({ mockData }, {
  formidableOptions: { multiples: true },
  proxies: httpProxies,
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
  let exporters = ''
  mockFiles.forEach((filepath, index) => {
    // fix: #21
    const file = normalizePath(path.join(cwd, filepath))
    importers += `import * as m${index} from '${file}';\n`
    exporters += `m${index}, `
  })
  return `import { transformMockData } from 'vite-plugin-mock-dev-server';
${importers}
const exporters = [${exporters}];
const mockList = exporters.map((raw) => {
  let mockConfig
  if (raw.default) {
    mockConfig = raw.default
  } else {
    mockConfig = []
    Object.keys(raw || {}).forEach((key) => {
      Array.isArray(raw[key])
        ? mockConfig.push(...raw[key])
        : mockConfig.push(raw[key])
    })
  }
  return mockConfig
});
export default transformMockData(mockList);`
}
