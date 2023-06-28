import fs, { promises as fsp } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Metafile, Plugin } from 'esbuild'
import { build } from 'esbuild'
import JSON5 from 'json5'
import type { ResolvedConfig } from 'vite'
import { getDirname } from './utils'

/* ===== esbuild begin ===== */

const externalizeDeps: Plugin = {
  name: 'externalize-deps',
  setup(build) {
    build.onResolve({ filter: /.*/ }, ({ path: id }) => {
      if (id[0] !== '.' && !path.isAbsolute(id)) {
        return { external: true }
      }
    })
  },
}

const json5Loader: Plugin = {
  name: 'json5-loader',
  setup(build) {
    build.onLoad({ filter: /\.json5$/ }, async ({ path }) => {
      const content = await fsp.readFile(path, 'utf-8')
      return {
        contents: `export default ${JSON.stringify(JSON5.parse(content))}`,
        loader: 'js',
      }
    })
  },
}

const jsonLoader: Plugin = {
  name: 'json-loader',
  setup(build) {
    build.onLoad({ filter: /\.json$/ }, async ({ path }) => {
      const content = await fsp.readFile(path, 'utf-8')
      return {
        contents: `export default ${content}`,
        loader: 'js',
      }
    })
  },
}

const aliasPlugin = (alias: ResolvedConfig['resolve']['alias']): Plugin => {
  return {
    name: 'alias-plugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, async ({ path: id }) => {
        // First match is supposed to be the correct one
        const matchedEntry = alias.find(({ find }) => matches(find, id))
        if (!matchedEntry) {
          return null
        }
        // 插件内部 对 alias 的支持并不完善，还缺少对 `customResolver` 的支持
        // 但是在 esbuild 的插件实现中，暂时不能很好的实现对 `customResolver` 的参数兼容
        // 这里作为 待优化的 问题
        const { find, replacement } = matchedEntry

        const result = await build.resolve(id.replace(find, replacement), {
          kind: 'import-statement',
          resolveDir: replacement,
          namespace: 'file',
        })

        return {
          path: result.path,
          external: false,
        }
      })
    },
  }
}

function matches(pattern: string | RegExp, importee: string) {
  if (pattern instanceof RegExp) {
    return pattern.test(importee)
  }
  if (importee.length < pattern.length) {
    return false
  }
  if (importee === pattern) {
    return true
  }
  return importee.startsWith(`${pattern}/`)
}

export interface TransformWithEsbuildOptions {
  isESM?: boolean
  define: Record<string, string>
  alias: ResolvedConfig['resolve']['alias']
}

export type TransformWithEsbuildResult = Promise<{
  code: string
  deps: Metafile['inputs']
}>

export async function transformWithEsbuild(
  entryPoint: string,
  options: TransformWithEsbuildOptions,
): TransformWithEsbuildResult {
  const { isESM = true, define, alias } = options
  try {
    const result = await build({
      entryPoints: [entryPoint],
      outfile: 'out.js',
      write: false,
      target: ['node14.18', 'node16'],
      platform: 'node',
      bundle: true,
      metafile: true,
      format: isESM ? 'esm' : 'cjs',
      define,
      plugins: [aliasPlugin(alias), externalizeDeps, jsonLoader, json5Loader],
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

/* ===== esbuild end ===== */

const _dirname = getDirname(import.meta.url)
const _require = createRequire(_dirname)

export async function loadFromCode<T = any>(
  filepath: string,
  code: string,
  isESM: boolean,
  cwd: string,
): Promise<{
  [key: string]: T
}> {
  if (isESM) {
    const fileBase = `${filepath}.timestamp-${Date.now()}`
    const fileNameTmp = `${fileBase}.mjs`
    const fileUrl = `${pathToFileURL(fileBase)}.mjs`
    await fsp.writeFile(fileNameTmp, code, 'utf8')
    try {
      return await import(fileUrl)
    } finally {
      try {
        fs.unlinkSync(fileNameTmp)
      } catch {}
    }
  } else {
    filepath = path.resolve(cwd, filepath)
    const extension = path.extname(filepath)
    const realFileName = fs.realpathSync(filepath)
    const loaderExt = extension in _require.extensions ? extension : '.js'
    const defaultLoader = _require.extensions[loaderExt]!
    _require.extensions[loaderExt] = (module: NodeModule, filename: string) => {
      if (filename === realFileName) {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(module as any)._compile(code, filename)
      } else {
        defaultLoader(module, filename)
      }
    }
    delete _require.cache[_require.resolve(filepath)]
    const raw = _require(filepath)
    _require.extensions[loaderExt] = defaultLoader
    return raw.__esModule ? raw : { default: raw }
  }
}
