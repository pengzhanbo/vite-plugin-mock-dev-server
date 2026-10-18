import type { Plugin } from 'vite'
import type { TransformResult } from '../compiler/index.js'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import type { ServerBuildOption } from '../types/index.js'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import ansis from 'ansis'
import { loadPackageJSON } from 'local-pkg'
import { glob } from 'tinyglobby'
import { transform } from '../compiler/index.js'
import { formatError } from '../utils/index.js'
import { generateMockEntryCode } from './mockEntryCode.js'
import { generatePackageJson, getMockDependencies } from './packageJson.js'
import { generatorServerEntryCode } from './serverEntryCode.js'

type PluginContext<T = Plugin['buildEnd']> = T extends (this: infer R, ...args: any[]) => void
  ? R
  : never

export async function generateMockServer(
  ctx: PluginContext,
  options: ResolvedMockServerPluginOptions,
): Promise<void> {
  const include = toArray(options.include)
  const exclude = toArray(options.exclude)
  const cwd = options.cwd || process.cwd()
  const dir = options.dir
  const buildOptions = options.build as Required<ServerBuildOption>

  const pkg = (await loadPackageJSON(options.context)) ?? {}
  const outputDir = buildOptions.dist

  const content = await generateMockEntryCode(cwd, dir, include, exclude)
  const mockEntry = path.join(cwd, `mock-data-${Date.now()}.js`)

  let result: TransformResult
  try {
    await fsp.writeFile(mockEntry, content, 'utf-8')
    result = await transform(mockEntry, options)
  } finally {
    // 无论转换成功还是抛错（例如既未安装 rolldown 也未安装 esbuild 时 `transform` 直接抛错），
    // 都要删除临时入口文件，避免它残留在项目根目录、被误提交
    await fsp.rm(mockEntry, { force: true })
  }

  const { code, externalDeps } = result
  if (!code) {
    // 转换失败时 `transformWithEsbuild` / `transformWithRolldown` 只记录日志并返回空产物，
    // 若不中止构建，会生成一个启动即失败的空 `mock-data.js`
    const message = 'Failed to generate mock server: the mock entry was not transformed'
    options.logger.error(message)
    throw new Error(message)
  }

  const mockDeps = getMockDependencies(externalDeps, options.alias)

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
      source: generatePackageJson(pkg, mockDeps, cwd),
    },
  ]

  // 构建录制文件，复制到输出目录
  // 由 `includeRecord` 独立控制：即使未开启录制功能（`record.enabled` 为 `false`），
  // 只要 `includeRecord` 为 `true`，已有的录制文件依然会被打包到产物中（用于仅回放的场景）。
  if (buildOptions.includeRecord) {
    const files = await glob(path.join(options.record.dir, '**/*.json'), {
      cwd: options.cwd,
      dot: true,
    })
    for (const file of files) {
      outputList.push({
        filename: path.join(outputDir, file),
        source: await fsp.readFile(path.join(options.cwd, file), 'utf-8'),
      })
    }
  }

  try {
    if (path.isAbsolute(outputDir)) {
      for (const { filename } of outputList) {
        if (fs.existsSync(filename)) {
          await fsp.rm(filename)
        }
      }
      options.logger.info(`${ansis.green('✓')} generate mock server in ${ansis.cyan(outputDir)}`)
      for (const { filename, source } of outputList) {
        await fsp.mkdir(path.dirname(filename), { recursive: true })
        await fsp.writeFile(filename, source, 'utf-8')
        const sourceSize = (source.length / 1024).toFixed(2)
        const name = path.relative(outputDir, filename)
        const space = name.length < 30 ? ' '.repeat(30 - name.length) : ''
        options.logger.info(`  ${ansis.green(name)}${space}${ansis.bold.dim(`${sourceSize} kB`)}`)
      }
    } else {
      for (const { filename, source } of outputList) {
        ctx.emitFile({ type: 'asset', fileName: filename, source })
      }
    }
  } catch (e) {
    options.logger.error(`Failed to generate mock server\n${formatError(e)}`)
  }
}
