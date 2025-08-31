import type { UserConfig, UserConfigFn } from 'tsdown'
import { defineConfig } from 'tsdown'
import { name, version } from './package.json'

const tsdownConfig: UserConfig | UserConfigFn = defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    server: 'src/server.ts',
    helper: 'src/helper/index.ts',
  },
  shims: true,
  sourcemap: false,
  dts: true,
  define: {
    __PACKAGE_NAME__: JSON.stringify(name),
    __PACKAGE_VERSION__: JSON.stringify(version),
  },
  format: 'esm',
})

export default tsdownConfig
