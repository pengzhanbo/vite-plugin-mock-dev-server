# Usage

This section will guide you through the process of using this plugin in your project.

If you haven't installed this plugin in your project yet, please refer to [Install](/en/guide/install).

## Step1: Import plugin

In your project's `vite.config.{ts,js}` file, import and configure the plugin:

``` ts [vite.config.{ts,js}]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server' // [!code ++]

export default defineConfig({
  plugins: [
    mockDevServerPlugin(), // [!code ++]
  ],
})
```

## Step2: Configure `server.proxy`

The plugin directly reads the request path prefix configured in `server.proxy` as the matching path for request interception.

In general scenarios, when configuring the `server.proxy` proxy forwarding configuration in the development environment, it directly forwards to the development environment address of the backend service. When the backend service has not completed the interface development but has provided the interface documentation, we only need to mock this part of the interface to enable parallel development of the frontend interface integration process. Therefore, this plugin directly reads the `server.proxy` configuration to reduce the complexity of plugin configuration.

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
      '^/api': 'http://example.com/',
    },
  },
})
```

## Step3: Add `/mock` directory

Add a `/mock` directory at the root of your project, and the `mock` directory will be used to save and manage all **mock configuration files** in a centralized location.

```sh
.
├── mock # [!code ++]
├── src
└── package.json
```

## Step4: Edit mock files

Add `**/*.mock.{js,ts,cjs,cts,mjs,mts,json,json5}` format files in the `/mock` directory.

This plugin uses the `fast-glob` module for file matching, automatically loads files, and listens to files and dependency files for hot updates.

It also supports using file formats such as `javascript/typescript/json/json5`, and supports writing code in `ESModule/Commonjs` module specification.

The plugin determines the project's default module type based on the `type` field in the project's `package.json`, and determines the module type based on the file extension format.

``` json
{
  "esm": [".mjs", ".mts"],
  "cjs": [".cjs", ".cts"]
}
```

**`.js/.ts` files are determined based on the `type` field value in the `package.json`, which is `cjs` by default.**

Add `*.mock.ts` files:

```sh {3}
.
├── mock
│   └── api.mock.ts  # [!code ++]
├── src
└── package.json
```

The plugin provides the `defineMock()` function to help write mock configurations.

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: {}
})
```

## Step5: Start Vite Development Server

Start your `Vite` development server, and you can use the plugin in your project!

For requests that are proxied through `server.proxy` and matched by your mock configuration, mock data will be returned.
