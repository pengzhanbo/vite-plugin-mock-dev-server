import path from 'node:path'
import { defineConfig } from 'vite'
import mockServer from 'vite-plugin-mock-dev-server'

export default defineConfig(({ mode }) => ({
  plugins: [
    mockServer({
      include: 'example/mock/**/*.mock.{ts,js,cjs,mjs,json,json5}',
      formidableOptions: {
        // 配置上传资源存放目录
        uploadDir: path.join(process.cwd(), 'example/uploads'),
        // 可修改上传资源名称
        filename: (name, ext, part) => {
          return part.originalFilename!
        },
      },
    }),
  ],
  // define 注入的变量， 在 mock文件中也可以使用
  define: {
    __IS_DEVELOPMENT__: JSON.stringify(mode === 'development'),
  },
  server: {
    // 仅在 proxy 中配置的 代理前缀， mock-dev-server 才会拦截并mock
    proxy: {
      '^/api': {
        target: '',
      },
    },
  },
}))
