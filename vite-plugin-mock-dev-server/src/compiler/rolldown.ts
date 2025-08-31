import type { Plugin } from 'rolldown'
import type { CompilerOptions, TransformResult } from './types'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import JSON5 from 'json5'
import { aliasMatches } from './esbuild'

const renamePlugin: Plugin = {
  name: 'vite-mock:rename-plugin',
  resolveId(id) {
    if (id === 'vite-plugin-mock-dev-server') {
      return {
        id: 'vite-plugin-mock-dev-server/helper',
        external: true,
      }
    }
  },
}

const json5Plugin: Plugin = {
  name: 'vite-mock:json5-plugin',
  transform: {
    filter: { id: /\.json5$/ },
    handler: (code) => {
      return { code: `export default ${JSON5.stringify(JSON5.parse(code))}` }
    },
  },
}

let _rolldown: null | {
  build: typeof import('rolldown').build
  aliasPlugin: typeof import('rolldown/experimental').aliasPlugin
} = null

async function rolldown() {
  _rolldown ||= {
    build: (await import('rolldown')).build,
    aliasPlugin: (await import('rolldown/experimental')).aliasPlugin,
  }
  return _rolldown
}

export async function transformWithRolldown(
  entryPoint: string,
  { isESM = true, define, alias, cwd = process.cwd() }: CompilerOptions,
): Promise<TransformResult> {
  const filepath = path.resolve(cwd, entryPoint)
  const filename = path.basename(entryPoint)
  const dirname = path.dirname(filepath)
  const isAlias = (p: string) => !!alias.find(({ find }) => aliasMatches(find, p))
  try {
    const { build, aliasPlugin } = await rolldown()
    const result = await build({
      input: entryPoint,
      write: false,
      cwd,
      output: {
        format: isESM ? 'esm' : 'cjs',
        sourcemap: false,
        file: 'out.js',
      },
      platform: 'node',
      define: {
        ...define,
        __dirname: JSON.stringify(dirname),
        __filename: JSON.stringify(filename),
        ...isESM ? {} : { 'import.meta.url': JSON.stringify(pathToFileURL(filepath)) },
      },
      external(id) {
        if (isAlias(id))
          return false
        if (id[0] !== '.' && !path.isAbsolute(id) && id !== 'vite-plugin-mock-dev-server')
          return true
      },
      plugins: [aliasPlugin({ entries: alias }), renamePlugin, json5Plugin],
    })
    return {
      code: result.output[0].code,
      deps: result.output[0].imports,
    }
  }
  catch (e) {
    console.error(e)
  }
  return { code: '', deps: [] }
}
