import type { UserConfig } from 'tsdown'
import fs from 'node:fs/promises'
import parse from 'js-tokens'
import { defineConfig } from 'tsdown'

const tsdownConfig: UserConfig = defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types/index.ts',
    server: 'src/server.ts',
    helper: 'src/helpers/index.ts',
  },
  clean: true,
  shims: true,
  sourcemap: false,
  dts: true,
  format: 'esm',
  fixedExtension: false,
  async onSuccess(config) {
    for await (const file of fs.glob('*.js', { cwd: config.outDir })) {
      const filepath = `${config.outDir}/${file}`
      const code = await fs.readFile(filepath, 'utf-8')
      await fs.writeFile(filepath, strip(code))
    }
  },
})

function strip(code: string): string {
  let result = ''
  const tokens = parse(code)
  for (const token of tokens) {
    if (token.type === 'MultiLineComment' || token.type === 'SingleLineComment') {
      continue
    }
    result += token.value
  }
  return result
}

export default tsdownConfig
