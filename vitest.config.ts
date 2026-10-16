import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['vite-plugin-mock-dev-server/__tests__/**/*.spec.ts'],
    // The bundler-dependent specs (rolldown/esbuild) take ~2s in isolation but
    // may exceed the 5s default when all spec files run in parallel and compete
    // for CPU, which used to break the release gate with a false failure.
    //
    // 打包器相关的用例（rolldown/esbuild）单独运行约 2s，但在全部规格文件并行
    // 争抢 CPU 时可能超过 vitest 默认的 5s，曾导致发布门禁出现假失败。
    testTimeout: 20_000,
  },
})
