# mockDevServerPlugin

创建 Mock Dev Server 插件，这是插件的入口函数。

## 函数签名

```ts
function mockDevServerPlugin(
  options?: MockServerPluginOptions
): Plugin[]
```

## 参数

### options

- **类型**: [`MockServerPluginOptions`](./mock-server-plugin-options)
- **描述**: 插件配置选项
- **默认值**: `{}`

## 返回值

- **类型**: `Plugin[]`
- **描述**: Vite 插件对象数组

## 示例

### 基础用法

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin()
  ]
})
```

### 完整配置

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // 路径前缀匹配
      prefix: ['/api', '/mock'],
      // WebSocket 前缀
      wsPrefix: ['/ws'],
      // Mock 文件目录
      dir: 'mock',
      // 包含的文件模式
      include: ['**/*.mock.{js,ts}'],
      // 排除的文件模式
      exclude: ['**/node_modules/**'],
      // 日志级别
      log: 'info',
      // 热更新时刷新页面
      reload: false,
      // CORS 配置
      cors: true
    })
  ]
})
```

### 与 Vite 代理配合使用

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api']
    })
  ],
  server: {
    proxy: {
      // 未匹配到 mock 的请求将代理到目标服务器
      '^/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

## 注意事项

1. **插件顺序**: 插件默认使用 `enforce: 'pre'`，确保在其他插件之前执行
2. **构建模式**: 仅在开发服务器 (`serve`) 和预览服务器 (`preview`) 模式下生效
3. **代理冲突**: `wsPrefix` 中的规则不应同时配置在 `server.proxy` 中，以避免 WebSocket 冲突
