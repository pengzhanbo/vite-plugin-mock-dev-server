import fsp from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'esbuild'
import JSON5 from 'json5'
import type { ResolvedConfig } from 'vite'

export const externalizeDeps: Plugin = {
  name: 'externalize-deps',
  setup(build) {
    build.onResolve({ filter: /.*/ }, ({ path: id }) => {
      if (id[0] !== '.' && !path.isAbsolute(id)) {
        return {
          external: true,
        }
      }
    })
  },
}

export const json5Loader: Plugin = {
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

export const jsonLoader: Plugin = {
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

export const aliasPlugin = (
  alias: ResolvedConfig['resolve']['alias'],
): Plugin => {
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
