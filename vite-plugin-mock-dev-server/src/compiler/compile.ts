import type { CompilerOptions, CompilerResult, MockRawData, TransformResult } from './types'
import process from 'node:process'
import { isPackageExists } from '../utils'
import { transformWithEsbuild } from './esbuild'
import { loadFromCode } from './loadFromCode'
import { transformWithRolldown } from './rolldown'

export async function transform(entryPoint: string, options: CompilerOptions): Promise<TransformResult> {
  if (await isPackageExists('rolldown'))
    return transformWithRolldown(entryPoint, options)
  if (await isPackageExists('esbuild'))
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
