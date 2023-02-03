import fsp from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'esbuild'
import JSON5 from 'json5'

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
