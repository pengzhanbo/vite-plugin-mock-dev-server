import type { UserConfig, UserConfigFn } from 'tsdown'
import { defineConfig } from 'tsdown'
import { name, version } from './package.json'

const tsdownConfig: UserConfig | UserConfigFn = defineConfig({
  entry: ['src/index.ts', 'src/helper.ts', 'src/server.ts'],
  shims: true,
  sourcemap: false,
  dts: true,
  define: {
    __PACKAGE_NAME__: JSON.stringify(name),
    __PACKAGE_VERSION__: JSON.stringify(version),
  },
  format: ['esm', 'cjs'],
})

export default tsdownConfig
