# Introduce

`vite-plugin-mock-dev-server` is a plugin dedicated to providing mock services in the development environment of `Vite`.

It uses the built-in `http` and `http-proxy` services of Vite to intercept the proxy paths configured by `server.proxy` in a second level. When the rules are hit, it returns the mock data configured.

You can use any third-party module in the mock configuration file with `node`. This means that you can use libraries like `mockjs` / `faker-js` to help generate mock data.

The plugin supports responding with multiple data types including `text` / `json` / `Buffer` / `ReadStream`, and also supports setting headers and cookies.

The plugin also supports simulating `WebSocket`, making it easy to debug `WebSocket` services in local development environment.

## Features

- ⚡️ Lightweight, Flexible, Fast.
- 🧲 Not injection-based, non-intrusive to client code.
- 💡 ESModule/commonjs.
- 🦾 Typescript.
- 🔥 HMR
- 🏷 Support `json` / `json5`.
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
