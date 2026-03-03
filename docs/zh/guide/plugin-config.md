# 插件配置

插件配置用于控制 Mock Dev Server 的整体行为。

## 基本结构

```ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      dir: 'mock',
      log: 'info'
    })
  ]
})
```

## 配置项概览

| 配置项 | 类型 | 默认值 | 说明 |
| ------ | ---- | ------ | ---- |
| [prefix](../api/mock-server-plugin-options#prefix) | `string \| string[]` | `[]` | HTTP Mock 路径前缀 |
| [wsPrefix](../api/mock-server-plugin-options#wsprefix) | `string \| string[]` | `[]` | WebSocket 路径前缀 |
| [cwd](../api/mock-server-plugin-options#cwd) | `string` | `process.cwd()` | 工作目录 |
| [dir](../api/mock-server-plugin-options#dir) | `string` | `'mock'` | Mock 文件目录 |
| [include](../api/mock-server-plugin-options#include) | `string \| string[]` | `['**/*.mock.{js,ts,cjs,mjs,json,json5}']` | 包含的文件模式 |
| [exclude](../api/mock-server-plugin-options#exclude) | `string \| string[]` | `['**/node_modules/**']` | 排除的文件模式 |
| [reload](../api/mock-server-plugin-options#reload) | `boolean` | `false` | 热更新时刷新页面 |
| [log](../api/mock-server-plugin-options#log) | `boolean \| LogLevel` | `'info'` | 日志级别 |
| [cors](../api/mock-server-plugin-options#cors) | `boolean \| CorsOptions` | `true` | CORS 配置 |
| [formidableOptions](../api/mock-server-plugin-options#formidableoptions) | `formidable.Options` | - | 文件上传配置 |
| [cookiesOptions](../api/mock-server-plugin-options#cookiesoptions) | `Cookies.Option` | - | Cookie 配置 |
| [bodyParserOptions](../api/mock-server-plugin-options#bodyparseroptions) | `BodyParserOptions` | - | 请求体解析配置 |
| [build](../api/mock-server-plugin-options#build) | `boolean \| ServerBuildOption` | `false` | 构建独立服务 |
| [record](../api/mock-server-plugin-options#record) | `boolean \| RecordOption` | `false` | 请求录制配置 |
| [replay](../api/mock-server-plugin-options#replay) | `boolean \| ReplayOption` | `false` | 请求回放配置 |
| [priority](../api/mock-server-plugin-options#priority) | `MockMatchPriority` | - | 匹配优先级配置 |

## 详细文档

查看 [API 参考 - MockServerPluginOptions](../api/mock-server-plugin-options) 获取完整的配置项说明和示例。
