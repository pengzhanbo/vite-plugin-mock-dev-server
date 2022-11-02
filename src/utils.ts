import fs from 'fs/promises'
import path from 'node:path'
import Debug from 'debug'

export const isArray = <T = any>(val: unknown): val is T[] => Array.isArray(val)

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export function sleep(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

export const debug = Debug('vite:plugin-mock-dev-server')

export async function getPackageDeps(cwd: string) {
  const filepath = path.resolve(cwd, 'package.json')
  const content = await fs.readFile(filepath, 'utf-8')
  const pkg = JSON.parse(content)
  const { dependencies = {}, devDependencies = {} } = pkg
  const deps = [...Object.keys(dependencies), ...Object.keys(devDependencies)]
  return deps
}
