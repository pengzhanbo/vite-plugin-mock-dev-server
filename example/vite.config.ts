import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig(({ mode }) => ({
  plugins: [
    mockDevServerPlugin({
      prefix: '^/api-dev/',
      wsPrefix: ['/socket.io'],
      log: 'debug',
      formidableOptions: {
        // 配置上传资源存放目录
        uploadDir: path.join(process.cwd(), '/uploads'),
      },
      build: true,
    }),
  ],
  // define 注入的变量， 在 mock文件中也可以使用
  define: {
    __IS_DEVELOPMENT__: JSON.stringify(mode === 'development'),
  },
  server: {
    cors: false,
    // 在 proxy 中配置的 代理前缀， mock-dev-server 才会拦截并mock
    proxy: {
      '^/api': {
        target: '',
      },
    },
  },
}))
