# mockDevServerPlugin

Create the Mock Dev Server plugin, this is the plugin's entry function.

## Function Signature

```ts
function mockDevServerPlugin(
  options?: MockServerPluginOptions
): Plugin[]
```

## Parameters

### options

- **Type**: [`MockServerPluginOptions`](./mock-server-plugin-options)
- **Description**: Plugin configuration options
- **Default**: `{}`

## Return Value

- **Type**: `Plugin[]`
- **Description**: Vite plugin object array

## Examples

### Basic Usage

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin()
  ]
})
```

### Full Configuration

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // Path prefix matching
      prefix: ['/api', '/mock'],
      // WebSocket prefix
      wsPrefix: ['/ws'],
      // Mock file directory
      dir: 'mock',
      // Included file patterns
      include: ['**/*.mock.{js,ts}'],
      // Excluded file patterns
      exclude: ['**/node_modules/**'],
      // Log level
      log: 'info',
      // Refresh page during hot reload
      reload: false,
      // CORS configuration
      cors: true
    })
  ]
})
```

### Working with Vite Proxy

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
      // Unmatched mock requests will be proxied to the target server
      '^/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

## Important Notes

1. **Plugin Order**: The plugin uses `enforce: 'pre'` by default, ensuring execution before other plugins
2. **Build Mode**: Only effective in development server (`serve`) and preview server (`preview`) modes
3. **Proxy Conflict**: Rules in `wsPrefix` should not be configured in `server.proxy` at the same time to avoid WebSocket conflicts
