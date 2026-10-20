import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    watch: {
      // 示例用例会生成录制、上传、临时 mock 模块和构建产物；watch 模式若把这些
      // 文件当成源码变化，会触发无意义的整轮重跑。
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/example/mock/.recordings/**',
        '**/example/mock/*.vite-mock-tmp-*',
        '**/example/uploads/**',
        '**/example/dist/**',
        '**/vite-plugin-mock-dev-server/dist/**',
      ],
    },
  },
  test: {
    include: ['vite-plugin-mock-dev-server/__tests__/**/*.spec.ts'],
    testTimeout: 20_000,
  },
})
