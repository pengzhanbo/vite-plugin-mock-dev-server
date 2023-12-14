import { defineConfig } from 'tsup'
import { name, version } from './package.json'

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  sourcemap: false,
  dts: true,
  splitting: false,
  clean: true,
  define: {
    __PACKAGE_NAME__: JSON.stringify(name),
    __PACKAGE_VERSION__: JSON.stringify(version),
  },
  format: ['esm', 'cjs'],
})
