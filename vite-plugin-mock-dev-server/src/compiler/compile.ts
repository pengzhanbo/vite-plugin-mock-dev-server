import type { CompilerOptions, CompilerResult, MockRawData, TransformResult } from './types'
import process from 'node:process'
import { isPackageExists } from 'local-pkg'
import { transformWithEsbuild } from './esbuild'
import { loadFromCode } from './loadFromCode'
import { transformWithRolldown } from './rolldown'

const hasRolldown = isPackageExists('rolldown')
const hasEsbuild = isPackageExists('esbuild')

export async function transform(entryPoint: string, options: CompilerOptions): Promise<TransformResult> {
  if (hasRolldown)
    return transformWithRolldown(entryPoint, options)
  if (hasEsbuild)
    return transformWithEsbuild(entryPoint, options)
  throw new Error('rolldown or esbuild not found')
}

export async function compile(
  filepath: string,
  options: CompilerOptions,
): Promise<CompilerResult> {
  let isESM = false
  if (/\.m[jt]s$/.test(filepath))
    isESM = true
  else if (/\.c[jt]s$/.test(filepath))
    isESM = false
  else
    isESM = options.isESM || false

  const { code, deps } = await transform(filepath, {
    ...options,
    isESM,
  })
  const data: MockRawData = (await loadFromCode({
    filepath,
    code,
    isESM,
    cwd: options.cwd || process.cwd(),
  })) || {}

  return { data, deps }
}
