# mockDevServerPlugin(options)

Vite Plugin Function

## Usage

::: code-group

``` ts [vite.config.ts]
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ]
})
```

:::

## `options`

`type: MockServerPluginOptions`

See [pluginConfig](/en/guide/plugin-config)
