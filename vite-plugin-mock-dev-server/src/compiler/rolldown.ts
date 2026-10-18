import type { Plugin } from 'rolldown'
import type { CompilerOptions, TransformResult } from './types.js'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import ansis from 'ansis'
import JSON5 from 'json5'
import { formatError, isPackageExists, normalizePath } from '../utils/index.js'
import { aliasMatches } from './aliasMatches.js'

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
    handler: (code) => ({ code: `export default ${JSON5.stringify(JSON5.parse(code))}` }),
  },
}

/**
 * 采集本次构建中实际参与打包的每个模块
 *
 * `chunk.moduleIds` 只列出仍然存在于输出 chunk 中的模块，代码被完全内联的依赖
 * （例如纯常量）会从列表中消失，其变更将不再触发引用它的 mock 文件重新编译，
 * 表现为依赖热更新静默失效。`moduleParsed` 钩子会为模块图中的每个模块调用，
 * 无论其是否被内联；外部依赖不会被加载，因此也不会出现在这里。
 *
 * @param ids - Set filled with the absolute ids of the parsed modules / 用于收集已解析模块绝对路径的集合
 * @returns The collector plugin / 采集插件
 */
function createDepsCollector(ids: Set<string>): Plugin {
  return {
    name: 'vite-mock:deps-collector',
    moduleParsed(moduleInfo) {
      ids.add(moduleInfo.id)
    },
  }
}

let _rolldown: null | {
  build: typeof import('rolldown').build
  aliasPlugin: typeof import('rolldown/experimental').viteAliasPlugin
} = null

async function rolldown(): Promise<NonNullable<typeof _rolldown>> {
  _rolldown ??= {
    build: (await import('rolldown')).build,
    aliasPlugin: (await import('rolldown/experimental')).viteAliasPlugin,
  }
  return _rolldown
}

export async function transformWithRolldown(
  entryPoint: string,
  { isESM = true, define, alias, cwd = process.cwd(), logger }: CompilerOptions,
): Promise<TransformResult> {
  const filepath = path.resolve(cwd, entryPoint)
  const filename = path.basename(entryPoint)
  const dirname = path.dirname(filepath)
  const isAlias = (p: string): boolean => !!alias.find(({ find }) => aliasMatches(find, p))
  try {
    const { build, aliasPlugin } = await rolldown()
    const parsedIds = new Set<string>()

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
      tsconfig: true,
      transform: {
        define: {
          ...define,
          __dirname: JSON.stringify(dirname),
          __filename: JSON.stringify(filename),
          ...(isESM ? {} : { 'import.meta.url': JSON.stringify(pathToFileURL(filepath)) }),
        },
      },
      external(id) {
        if (isAlias(id)) {
          return false
        }
        if (id[0] !== '.' && !path.isAbsolute(id) && id !== 'vite-plugin-mock-dev-server') {
          return isPackageExists(id)
        }
      },
      plugins: [
        aliasPlugin({ entries: alias }),
        renamePlugin,
        json5Plugin,
        createDepsCollector(parsedIds),
      ],
      onLog(level, log, defaultHandler) {
        if (log.code === 'PLUGIN_TIMINGS' && log.message.includes('vite-mock')) {
          return
        }
        defaultHandler(level, log)
      },
    })

    const output = result.output[0]
    // 已解析模块是 chunk 模块的超集：两者取并集，
    // 以便在打包器不再上报已解析模块时退回到原有行为，而不是完全丢失依赖。
    return {
      code: output.code,
      internalDeps: [...new Set([...output.moduleIds, ...parsedIds])]
        // 虚拟模块（`\0` 前缀）与入口文件自身不属于 mock 文件的依赖。
        .filter((id) => !id.startsWith('\0') && path.basename(id) !== filename)
        .map((id) => normalizePath(path.relative(cwd, id))),
      externalDeps: [...output.imports, ...output.dynamicImports],
    }
  } catch (e) {
    logger.error(`Failed to transform ${ansis.yellow.underline(filepath)}\n${formatError(e)}`)
  }
  return { code: '', internalDeps: [], externalDeps: [] }
}
