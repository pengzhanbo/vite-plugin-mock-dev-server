import type { UserConfig } from 'tsdown'
import { defineConfig } from 'tsdown'

const tsdownConfig: UserConfig = defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types/index.ts',
    server: 'src/server.ts',
    helper: 'src/helpers/index.ts',
  },
  shims: true,
  sourcemap: false,
  minify: true,
  dts: true,
  format: 'esm',
  fixedExtension: false,
})

export default tsdownConfig
