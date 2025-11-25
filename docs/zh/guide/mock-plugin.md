# mockDevServerPlugin(options)

Vite Plugin Function

## 使用

``` ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ]
})
```

## `options`

`type: MockServerPluginOptions`

查看 [pluginConfig](./plugin-config)
