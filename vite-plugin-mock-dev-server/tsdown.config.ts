import type { UserConfig } from 'tsdown'
import { defineConfig } from 'tsdown'

const tsdownConfig: UserConfig = defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    server: 'src/server.ts',
    helper: 'src/helper/index.ts',
  },
  shims: true,
  sourcemap: false,
  dts: true,
  format: 'esm',
})

export default tsdownConfig
