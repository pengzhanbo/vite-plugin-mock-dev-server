import type { Plugin } from 'vite'
import type { ResolvedMockServerPluginOptions } from '../options'
import type { ServerBuildOption } from '../types'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { toArray } from '@pengzhanbo/utils'
import c from 'picocolors'
import { transform } from '../compiler'
import { lookupFile } from '../utils'
import { generateMockEntryCode } from './mockEntryCode'
import { generatePackageJson, getMockDependencies } from './packageJson'
import { generatorServerEntryCode } from './serverEntryCode'

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
  const dir = options.dir

  let pkg = {}
  try {
    const pkgStr = lookupFile(options.context, ['package.json'])
    if (pkgStr)
      pkg = JSON.parse(pkgStr)
  }
  catch {}

  const outputDir = (options.build as ServerBuildOption).dist!

  const content = await generateMockEntryCode(cwd, dir, include, exclude)
  const mockEntry = path.join(cwd, `mock-data-${Date.now()}.js`)
  await fsp.writeFile(mockEntry, content, 'utf-8')

  const { code, deps } = await transform(mockEntry, options)
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
