import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import {
  createExampleDefine,
  exampleAlias,
  exampleProxy,
  exampleRoot,
  mockServerOptions,
  RECORD_UPSTREAM_PORT,
} from './plugin-options.js'
import { apiNotFound } from './plugins/api-404.js'
import { openInEditor } from './plugins/open-in-editor.js'
import { recordUpstream } from './plugins/record-upstream.js'
import { requestProxy } from './plugins/request-proxy.js'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // 为录制 / 回放场景提供一个真实的上游服务
    // A real upstream for the record / replay scenario
    recordUpstream(RECORD_UPSTREAM_PORT),
    mockDevServerPlugin(mockServerOptions),
    // 未命中 mock 的路径返回 404，而不是被 SPA fallback 变成 200
    // Unmatched mock paths return 404 instead of becoming 200 through the SPA fallback
    apiNotFound(),
    // 服务端重放场景请求，支持 Cookie / Referer 等浏览器禁止设置的请求头
    // Replay scenario requests server-side so Cookie / Referer are supported
    requestProxy(),
    // 通过 X-File-Path 在本地编辑器中打开 mock 文件
    // Open mock files in the local editor through X-File-Path
    openInEditor(),
  ],
  // define 注入的变量，在 mock 文件中也可以使用
  // Variables injected by `define` are available in mock files too
  define: createExampleDefine(mode === 'development'),
  resolve: {
    alias: {
      ...exampleAlias,
      '@': path.join(exampleRoot, 'src'),
    },
  },
  server: {
    // 代理前缀会被 mock-dev-server 读取并拦截
    // The proxy prefixes are read and intercepted by mock-dev-server
    proxy: exampleProxy,
  },
}))
