# Plugin Configuration

Plugin configuration is used to control the overall behavior of Mock Dev Server.

## Basic Structure

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

## Configuration Overview

| Configuration | Type | Default | Description |
| ------------- | ---- | ------- | ----------- |
| [enabled](../api/mock-server-plugin-options#enabled) | `boolean` | `true` | Whether to enable Mock server |
| [prefix](../api/mock-server-plugin-options#prefix) | `string \| string[]` | `[]` | HTTP Mock path prefix |
| [wsPrefix](../api/mock-server-plugin-options#wsprefix) | `string \| string[]` | `[]` | WebSocket path prefix |
| [cwd](../api/mock-server-plugin-options#cwd) | `string` | `process.cwd()` | Working directory |
| [dir](../api/mock-server-plugin-options#dir) | `string` | `'mock'` | Mock file directory |
| [include](../api/mock-server-plugin-options#include) | `string \| string[]` | `['**/*.mock.{js,ts,cjs,mjs,json,json5}']` | Included file patterns |
| [exclude](../api/mock-server-plugin-options#exclude) | `string \| string[]` | `['**/node_modules/**']` | Excluded file patterns |
| [reload](../api/mock-server-plugin-options#reload) | `boolean` | `false` | Refresh page on hot update |
| [log](../api/mock-server-plugin-options#log) | `boolean \| LogLevel` | `'info'` | Log level |
| [cors](../api/mock-server-plugin-options#cors) | `boolean \| CorsOptions` | `true` | CORS configuration |
| [formidableOptions](../api/mock-server-plugin-options#formidableoptions) | `formidable.Options` | - | File upload configuration |
| [cookiesOptions](../api/mock-server-plugin-options#cookiesoptions) | `Cookies.Option` | - | Cookie configuration |
| [bodyParserOptions](../api/mock-server-plugin-options#bodyparseroptions) | `BodyParserOptions` | - | Request body parsing configuration |
| [build](../api/mock-server-plugin-options#build) | `boolean \| ServerBuildOption` | `false` | Build standalone service |
| [record](../api/mock-server-plugin-options#record) | `boolean \| RecordOption` | `false` | Request recording configuration |
| [replay](../api/mock-server-plugin-options#replay) | `boolean \| ReplayOption` | `false` | Request playback configuration |
| [activeScene](../api/mock-server-plugin-options#activescene) | `string \| string[]` | `[]` | Active scene for filtering mocks |
| [priority](../api/mock-server-plugin-options#priority) | `MockMatchPriority` | - | Matching priority configuration |

## Detailed Documentation

View [API Reference - MockServerPluginOptions](../api/mock-server-plugin-options) for complete configuration item descriptions and examples.
