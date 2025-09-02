import type { Plugin } from 'esbuild'
import type { Alias } from 'vite'
import type { CompilerOptions, TransformResult } from './types'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import JSON5 from 'json5'

const externalizeDeps: Plugin = {
  name: 'externalize-deps',
  setup(build) {
    build.onResolve({ filter: /.*/ }, ({ path: id }) => {
      if (id[0] !== '.' && !path.isAbsolute(id))
        return { external: true }
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

const renamePlugin: Plugin = {
  name: 'rename-plugin',
  setup(build) {
    build.onResolve({ filter: /.*/ }, ({ path: id }) => {
      if (id === 'vite-plugin-mock-dev-server') {
        return {
          path: 'vite-plugin-mock-dev-server/helper',
          external: true,
        }
      }
      return null
    })
  },
}

function aliasPlugin(alias: Alias[]): Plugin {
  return {
    name: 'alias-plugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, async ({ path: id }) => {
        // First match is supposed to be the correct one
        const matchedEntry = alias.find(({ find }) => aliasMatches(find, id))
        if (!matchedEntry)
          return null

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

export function aliasMatches(pattern: string | RegExp, importee: string): boolean {
  if (pattern instanceof RegExp)
    return pattern.test(importee)

  if (importee.length < pattern.length)
    return false

  if (importee === pattern)
    return true

  return importee.startsWith(`${pattern}/`)
}

let _build: null | typeof import('esbuild').build = null

async function esbuild(): Promise<NonNullable<typeof _build>> {
  _build ||= (await import('esbuild')).build
  return _build
}

export async function transformWithEsbuild(
  entryPoint: string,
  { isESM = true, define, alias, cwd = process.cwd() }: CompilerOptions,
): Promise<TransformResult> {
  const filepath = path.resolve(cwd, entryPoint)
  const filename = path.basename(entryPoint)
  const dirname = path.dirname(filepath)
  try {
    const build = await esbuild()
    const result = await build({
      entryPoints: [entryPoint],
      outfile: 'out.js',
      write: false,
      target: ['node18'],
      platform: 'node',
      bundle: true,
      metafile: true,
      format: isESM ? 'esm' : 'cjs',
      define: {
        ...define,
        __dirname: JSON.stringify(dirname),
        __filename: JSON.stringify(filename),
        ...isESM ? {} : { 'import.meta.url': JSON.stringify(pathToFileURL(filepath)) },
      },
      plugins: [aliasPlugin(alias), renamePlugin, externalizeDeps, jsonLoader, json5Loader],
      absWorkingDir: cwd,
    })
    const deps: Set<string> = new Set()
    const inputs = result.metafile?.inputs || {}
    Object.keys(inputs).forEach(key =>
      inputs[key].imports.forEach(dep => deps.add(dep.path)),
    )

    return {
      code: result.outputFiles[0].text,
      deps: Array.from(deps),
    }
  }
  catch (e) {
    console.error(e)
  }
  return { code: '', deps: [] }
}
