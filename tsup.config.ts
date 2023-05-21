import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  sourcemap: false,
  dts: true,
  splitting: false,
  clean: true,
  minify: true,
  format: ['esm', 'cjs'],
})
