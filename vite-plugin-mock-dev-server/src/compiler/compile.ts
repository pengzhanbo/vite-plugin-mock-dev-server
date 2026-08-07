import type { CompilerOptions, CompilerResult, MockRawData, TransformResult } from './types.js'
import process from 'node:process'
import { isPackageExists } from '../utils/index.js'
import { transformWithEsbuild } from './esbuild.js'
import { loadFromCode } from './loadFromCode.js'
import { transformWithRolldown } from './rolldown.js'

let bundler: 'esbuild' | 'rolldown' | 'none' | undefined

export async function transform(
  entryPoint: string,
  options: CompilerOptions,
): Promise<TransformResult> {
  bundler ??= isPackageExists('rolldown')
    ? 'rolldown'
    : isPackageExists('esbuild')
      ? 'esbuild'
      : 'none'

  if (bundler === 'rolldown') {
    return transformWithRolldown(entryPoint, options)
  }

  if (bundler === 'esbuild') {
    return transformWithEsbuild(entryPoint, options)
  }

  throw new Error('rolldown or esbuild not found')
}

export async function compile(filepath: string, options: CompilerOptions): Promise<CompilerResult> {
  let isESM = false
  if (/\.m[jt]s$/.test(filepath)) {
    isESM = true
  } else if (/\.c[jt]s$/.test(filepath)) {
    isESM = false
  } else {
    isESM = options.isESM ?? false
  }

  const { code, externalDeps, internalDeps } = await transform(filepath, {
    ...options,
    isESM,
  })
  const data: MockRawData = await loadFromCode({
    filepath,
    code,
    isESM,
    cwd: options.cwd ?? process.cwd(),
    logger: options.logger,
  })

  return { data, externalDeps, internalDeps }
}
