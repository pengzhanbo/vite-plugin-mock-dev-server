import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import type { Metafile } from 'esbuild'
import { build } from 'esbuild'
import fg from 'fast-glob'
import isCore from 'is-core-module'
import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from 'vite'
import { name, version } from '../package.json'
import { externalizeDeps, json5Loader, jsonLoader } from './esbuildPlugin'
import type { MockServerPluginOptions, ServerBuildOption } from './types'
import { isArray, lookupFile } from './utils'

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
  const include = isArray(options.include) ? options.include : [options.include]
  const exclude = isArray(options.exclude) ? options.exclude : [options.exclude]
  const define: ResolvedConfig['define'] = {}
  if (config.define) {
    for (const key in config.define) {
      const val = config.define[key]
      define[key] = typeof val === 'string' ? val : JSON.stringify(val)
    }
  }
  let pkg = {}
  try {
    const pkgStr = lookupFile(config.root, ['package.json'])
    if (pkgStr) {
      pkg = JSON.parse(pkgStr)
    }
  } catch {}

  const outputDir = (options.build as ServerBuildOption).dist!

  const content = await generateMockEntryCode(process.cwd(), include, exclude)
  const mockEntry = path.join(config.root, `mock-data-${Date.now()}.js`)
  await fsp.writeFile(mockEntry, content, 'utf-8')
  const { code, deps } = await buildMockEntry(mockEntry, define)
  const mockDeps = getMockDependencies(deps)
  await fsp.unlink(mockEntry)

  const outputList = [
    {
      filename: path.join(outputDir, 'mock-data.js'),
      source: code,
    },
    {
      filename: path.join(outputDir, 'index.js'),
      source: generatorServerEntryCode(
        config.server.proxy || {},
        (options.build as ServerBuildOption).serverPort,
      ),
    },
    {
      filename: path.join(outputDir, 'package.json'),
      source: generatePackageJson(pkg, mockDeps),
    },
  ]

  try {
    if (path.isAbsolute(outputDir)) {
      await fsp.rm(outputDir, { recursive: true })
      fs.mkdirSync(outputDir, { recursive: true })
      for (const { filename, source } of outputList) {
        await fsp.writeFile(filename, source, 'utf-8')
      }
    } else {
      for (const { filename, source } of outputList) {
        ctx.emitFile({
          type: 'asset',
          fileName: filename,
          source,
        })
      }
    }
  } catch {}
}

function getMockDependencies(deps: Metafile['inputs']): string[] {
  const list = new Set<string>()
  const excludeDeps = [name, 'connect']
  Object.keys(deps).forEach((mPath) => {
    const imports = deps[mPath].imports
      .filter((_) => _.external)
      .map((_) => _.path)
    imports.forEach((dep) => {
      if (!excludeDeps.includes(dep) && !isCore(dep)) {
        list.add(dep)
      }
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
      'vite-plugin-mock-dev-server': `^${version}`,
    } as Record<string, string>,
  }
  mockDeps.forEach((dep) => {
    mockPkg.dependencies[dep] = dependents[dep] || 'latest'
  })
  return JSON.stringify(mockPkg, null, 2)
}

function generatorServerEntryCode(proxy = {}, port = 8080) {
  const proxies: string[] = Object.keys(proxy || {})
  return `import connect from 'connect'
import { baseMiddleware } from 'vite-plugin-mock-dev-server'
import mockData from './mock-data.js'
const app = connect()
app.use(baseMiddleware({ mockData }, {
  formidableOptions: { multiples: true },
  proxies: ${JSON.stringify(proxies)} 
}))
app.listen(${port})
console.log('listen: http://localhost:${port}')
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
    const file = path.join(cwd, filepath)
    importers += `import * as m${index} from '${file}'\n`
    exporters += `m${index}, `
  })
  return `${importers}const mockData = [${exporters}];\n
const data = [];
const mocks = {};
mockData.forEach(mock => {
  Object.keys(mock).forEach(key => {
    const mockData = mock[key];
    if (Array.isArray(mockData)) {
      data.push(...mockData);
    } else {
      if (typeof mockData === 'object' && Object.prototype.hasOwnProperty.call(mockData, 'url')) {
        data.push(mockData);
      }
    }
  })
})
data
  .filter((mock) => mock.enabled || typeof mock.enabled === "undefined")
  .forEach((mock) => {
    if (!mocks[mock.url]) {
      mocks[mock.url] = [];
    }
    const list = mocks[mock.url];
    mock.validator ? list.unshift(mock) : list.push(mock);
  });
export default mocks;
  `
}

async function buildMockEntry(
  inputFile: string,
  define: ResolvedConfig['define'],
) {
  try {
    const result = await build({
      entryPoints: [inputFile],
      outfile: 'out.js',
      write: false,
      target: ['node14.18', 'node16'],
      platform: 'node',
      bundle: true,
      metafile: true,
      format: 'esm',
      define,
      plugins: [externalizeDeps, json5Loader, jsonLoader],
    })
    return {
      code: result.outputFiles[0].text,
      deps: result.metafile?.inputs || {},
    }
  } catch (e) {
    console.error(e)
  }
  return { code: '', deps: {} }
}
