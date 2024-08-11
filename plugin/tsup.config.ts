import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'tsup'
import { name, version } from './package.json'

export default defineConfig({
  entry: ['src/index.ts', 'src/helper.ts', 'src/server.ts'],
  shims: true,
  sourcemap: false,
  dts: true,
  splitting: true,
  clean: true,
  define: {
    __PACKAGE_NAME__: JSON.stringify(name),
    __PACKAGE_VERSION__: JSON.stringify(version),
  },
  format: ['esm', 'cjs'],
  onSuccess: async () => {
    const cwd = process.cwd()
    const filepath = path.resolve(cwd, 'dist/index.cjs')
    let content = await fs.promises.readFile(filepath, 'utf-8')
    content = content.replace('const mod = await Promise.resolve().then(() => _interopRequireWildcard(require(file)));', 'const mod = await import(file);')
    await fs.promises.writeFile(filepath, content)
  },
})
