# vite-plugin-mock-dev-server

Vite Plugin for API mock dev server.

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-mock-dev-server"><img alt="npm" src="https://img.shields.io/npm/v/vite-plugin-mock-dev-server?style=flat-square"></a>
  <img alt="node-current" src="https://img.shields.io/node/v/vite-plugin-mock-dev-server?style=flat-square">
  <img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/vite-plugin-mock-dev-server/peer/vite?style=flat-square">
  <img alt="npm" src="https://img.shields.io/npm/dm/vite-plugin-mock-dev-server?style=flat-square">
  <br>
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/pengzhanbo/vite-plugin-mock-dev-server/lint.yml?style=flat-square">
  <a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_shield"><img alt="fossa status" src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=shield"></a>
</p>

## Features

- ⚡️ Lightweight, Flexible, Fast.
- 🧲 Not injection-based, non-intrusive to client code.
- 💡 ESModule/commonjs.
- 🦾 Typescript.
- 🔥 HMR
- 🏷 Support `.[cm]?js` / `.ts` / `.json` / `.json5`.
- 📦 Auto import mock file.
- 🎨 Support any lib, like `mockjs`, or do not use it.
- 📥 Path rule matching, request parameter matching.
- ⚙️ Support Enabled/Disabled any one of the API mock.
- 📀 Supports response body content type such as `text/json/buffer/stream`.
- ⚖️ Use `server.proxy`
- 🍕 Support `viteConfig.define` and `env` in the mock file.
- ⚓️ Support `viteConfig.resolve.alias` in the mock file.
- 🌈 Support `vite preview` mode.
- 📤 Support `multipart` content-type, mock upload file.
- 📥 Support mock download file.
- ⚜️ Support `WebSocket Mock`
- 🗂 Support building small independent deployable mock services.

## Documentation

See the [documentation](https://vite-plugin-mock-dev-server.netlify.app/en/) for more details.

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ccda610-2c6a-4cd0-aeaa-a8932f2b477c/deploy-status)](https://app.netlify.com/sites/vite-plugin-mock-dev-server/deploys)

## Install

``` sh
# npm
npm i -D vite-plugin-mock-dev-server
# yarn
yarn add vite-plugin-mock-dev-server
# pnpm
pnpm add -D vite-plugin-mock-dev-server
```

## Usage

`vite.config.ts`

``` ts
import { defineConfig } from 'vite'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin(/* plugin options */),
  ],
  // The fields defined here can also be used in mock.
  define: {},
  server: {
    // plugin will read `server.proxy`
    proxy: {
      '^/api': { target: 'http://example.com' }
    }
  }
})
```

The plugin will read the configuration of `server.proxy` or `options.prefix`, and enable mock matching for matched URLs.

The plugin will also read the `define` configuration, which supports direct use in mock files.

## Edit Mock File

By default, write mock data in the `mock` directory of your project's root directory:

`mock/**/*.mock.ts` :

``` ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/test',
  body: { a: 1, b: 2 }
})
```

## Links

- [vite](https://vitejs.dev/)
- [awesome-vite](https://github.com/vitejs/awesome-vite#helpers)
- [rspack-plugin-mock](https://github.com/pengzhanbo/rspack-plugin-mock) - **Rspack** and **Rsbuild** plugin for API mock server

## LICENSE

The plugin is licensed under the [MIT License](./LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpengzhanbo%2Fvite-plugin-mock-dev-server?ref=badge_large)
