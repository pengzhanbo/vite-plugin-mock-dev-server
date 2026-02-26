# Usage

This section will guide you through the process of using this plugin in your project.

## Step1: Install Plugin

<div class="tip custom-block" style="padding-top: 8px">

It is recommended to use [pnpm](https://pnpm.io/) as the package manager

</div>

::: code-group

``` sh [pnpm]
pnpm add -D vite-plugin-mock-dev-server
```

``` sh [npm]
npm i -D vite-plugin-mock-dev-server
```

``` sh [yarn]
yarn add -D vite-plugin-mock-dev-server
```

``` sh [deno]
deno add -D vite-plugin-mock-dev-server
```

``` sh [bun]
bun add -D vite-plugin-mock-dev-server
```

:::

## Step2: Import Plugin

Open your project's `vite.config.{ts,js}` file, import and configure the plugin:

``` ts [vite.config.{ts,js}]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server' // [!code ++]

export default defineConfig({
  plugins: [
    mockDevServerPlugin(), // [!code ++]
  ],
})
```

## Step3: Configure Proxy Rules

The plugin automatically reads the path prefix configured in `server.proxy` in `vite.config.js` as the matching condition for request interception.
This design stems from common development scenarios:

Usually, we configure proxies in the development environment to forward requests to the backend service address.
However, when the backend interface is not yet completed but the documentation is provided, we can mock only these interfaces to achieve parallel development of frontend and backend.
The plugin directly reuses the `server.proxy` configuration, eliminating the need for additional parameter configuration and simplifying the process:

``` ts [vite.config.{ts,js}]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
  ],
  // [!code ++:5]
  server: {
    proxy: {
      '^/api': 'http://example.com/'
    },
  },
})
```

## Step4: Add `mock` Directory

Add a `/mock` directory in your project root. The `mock` directory will be used to centrally save and manage all **mock configuration files**.

```sh
.
├── mock  # [!code ++]
├── src
└── package.json
```

## Step5: Write Mock Configuration Files

Create files in the format `**/*.mock.{js,ts,cjs,cts,mjs,mts,json,json5}` in the `mock` directory. The plugin will automatically complete the following work:

- Use tinyglobby for file matching and automatic loading
- Listen to file and dependency changes for hot updates
- Support multiple file formats such as JavaScript/TypeScript/JSON/JSON5
- Compatible with ESModule and CommonJS module specifications

The plugin determines the project's default module type based on the `type` field in `package.json`, and determines the specific module format based on the file extension:

``` json
{
  "esm": [".mjs", ".mts"],
  "cjs": [".cjs", ".cts"],
  "json": [".json", ".json5"]
}
```

::: warning
`.js/.ts` files default to cjs (CommonJS) format unless the `type` field in `package.json` is specified as `"module"`.
:::

Now, let's create a mock configuration file:

```sh {3}
.
├── mock
│   └── api.mock.ts # mock configuration file  # [!code ++]
├── src
└── package.json
```

Use the [`defineMock()`](./define-mock) helper function provided by the plugin to write the configuration:

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

## Step6: Start Vite Development Server

After completing the above configuration, start the Vite development server to use the plugin. All requests meeting the following conditions will return mock data:

- The request path matches the proxy prefix configured in `server.proxy`
- The request path matches the `url` rule of a mock configuration
