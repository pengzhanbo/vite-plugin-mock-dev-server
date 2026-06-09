# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`vite-plugin-mock-dev-server` is a Vite plugin for mocking API endpoints during development. It intercepts HTTP requests matching configured proxy patterns and returns mocked responses defined in `.mock.ts` files. The repo is a pnpm monorepo with three packages: the plugin itself, an example app, and VitePress docs.

## Commands

```bash
# Build the plugin (tsdown)
pnpm build

# Run tests (vitest)
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run a single test file
pnpm test -- src/__tests__/validator.spec.ts

# Lint (ESLint via @pengzhanbo/eslint-config)
pnpm lint

# Run example dev server
pnpm dev

# Build example
pnpm example:build

# Documentation
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

## Architecture

### Plugin System

`mockDevServerPlugin()` in `src/core/plugin.ts` returns up to two Vite plugins:

- **serverPlugin** (`enforce: 'pre'`, `apply: 'serve'`) — intercepts dev server requests and WebSocket upgrades. Also handles `configurePreviewServer` for `vite preview` mode.
- **buildPlugin** (`enforce: 'post'`, `apply: 'build'`) — generates standalone mock server. Only included when `options.build` is truthy.

### Request Flow

1. `serverPlugin.configureServer()` calls `initMockMiddlewares()`
2. `initMockMiddlewares()` creates a `Compiler` instance, wires up `mockWebSocket()`, and returns the mock middleware
3. `Compiler.run()` globs and compiles all mock files, then watches for changes
4. On each request, `createMockMiddleware()`: filters by proxy prefix → ranks matching URL patterns by priority → finds the first matching `MockHttpItem` → parses body/cookies → evaluates validator → runs response or error simulation → sends response

### Mock Data Structure

After compilation, mock data is stored as `Record<string, MockOptions>` where each key is a URL pattern (e.g., `/api/users/:id`). `MockOptions` is `(MockHttpItem | MockWebsocketItem)[]` — an array of mock definitions for that URL pattern.

`MockHttpItem` has a `ws: false` discriminator, `MockWebsocketItem` has `ws: true`. Matcher (`src/mockHttp/matcher.ts`) filters by method, scene, and optional validator before selecting the first match.

### Path Matching Priority

`matchingWeight.ts` implements a priority algorithm using `path-to-regexp` token analysis. Static rules (no parameters) have highest priority. Dynamic rules are ranked by parameter count and position. Users can customize priority via the `priority` option (global ordering and special-case overrides).

### Scene System

Mock items can have a `scene` field. Only mocks whose scene intersects with `options.activeScene` (or have no scene) are considered. The `X-Mock-Scene` request header can override active scenes per-request.

### Validator System

Multiple mocks can share the same URL pattern. Each can have a `validator` — either a function receiving the parsed request, or an object for subset matching against query/body/params/headers. This allows different responses for the same URL based on request parameters.

### Recorder / Replay

The `Recorder` class hooks into Vite's `server.proxy` configuration, capturing `proxyRes` events to record real backend responses to disk (JSON files in `.recordings/`). When replay is enabled and no mock matches, the middleware tries to replay a recorded response. This is useful for capturing real API traffic for offline development.

### WebSocket Mock

`mockWebSocket()` in `src/mockWebsocket/server.ts` listens for `upgrade` events on the HTTP server. Each unique URL pattern + pathname gets its own `WebSocketServer` instance. On HMR, the WSS is restarted: cleanup functions run, listeners are removed, and `setup()` re-executes. On `server.close()`, all WSS instances are cleaned up.

### Cookie Handling

The `cookies` npm package (pillarjs/cookies) is used for cookie parsing/setting. `MockRequest` exposes `getCookie()` and `MockResponse` exposes `setCookie()`. Configurable via `cookiesOptions` (keys for signed cookies, secure flag).

### Build Output (tsdown)

Configured in `tsdown.config.ts` with 4 entry points, ESM format, minification, and declaration generation:

| Entry    | Source                 | Export path                          |
| -------- | ---------------------- | ------------------------------------ |
| `index`  | `src/index.ts`         | `vite-plugin-mock-dev-server`        |
| `helper` | `src/helpers/index.ts` | `vite-plugin-mock-dev-server/helper` |
| `server` | `src/server.ts`        | `vite-plugin-mock-dev-server/server` |
| `types`  | `src/types/index.ts`   | `vite-plugin-mock-dev-server/types`  |

### Key Dependencies

- **`cookies`** (pillarjs/cookies) — cookie get/set with signed cookie support
- **`ws`** — WebSocket server implementation
- **`path-to-regexp`** — URL pattern parsing and matching (e.g., `/api/:id`)
- **`formidable`** — multipart/form-data parsing (file uploads)
- **`co-body`** — JSON/URL-encoded/text body parsing
- **`chokidar`** — file watching for HMR
- **`tinyglobby`** — fast glob matching for discovering mock files
- **`mime-types`** — MIME type lookup for response content-type

### Vite Version Compatibility

The plugin's compiler auto-selects `esbuild` or `rolldown` based on Vite version. Both are optional peer dependencies, but at least one is required. `zstd-codec` is an optional peer dependency for compression support.

## Testing

Tests use vitest, configured in `vitest.config.ts` to include `vite-plugin-mock-dev-server/__tests__/**/*.spec.ts`. There are no test setup files or `__mocks__` directories — each test creates mock objects manually (see `mockMiddleware.spec.ts` for patterns: `createMockCompiler()`, `createMockRequest()`, `createMockResponse()`).

## Project Structure

```txt
vite-plugin-mock-server/
├── pnpm-workspace.yaml      # Monorepo (packages: docs, example, plugin)
├── vitest.config.ts
├── eslint.config.js         # @pengzhanbo/eslint-config, erasableOnly TS
├── tsconfig.json
├── vite-plugin-mock-dev-server/
│   ├── src/
│   │   ├── index.ts         # Plugin entry + public re-exports
│   │   ├── core/            # plugin.ts, options.ts (resolution), init.ts
│   │   ├── compiler/        # Compiler (load, compile, watch), processData
│   │   ├── mockHttp/        # Middleware, matcher, matchingWeight, request/response
│   │   ├── mockWebsocket/   # WSS creation, HMR restart, cleanup
│   │   ├── helpers/         # defineMock, defineMockData, createSSEStream
│   │   ├── recorder/        # Request recording (proxy hooks) and replay
│   │   ├── build/           # Standalone mock server code generation
│   │   ├── utils/           # URL parsing, path matching, scene matching, etc.
│   │   └── types/           # TS types for config, HTTP, WS, cookies, record
│   ├── __tests__/           # *.spec.ts files (no setup/mocks dirs)
│   └── tsdown.config.ts     # 4-entry build config
├── example/                  # Example Vite app
└── docs/                     # VitePress documentation
```
