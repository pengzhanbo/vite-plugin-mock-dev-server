# Repository Guidelines

## Project Overview

`vite-plugin-mock-dev-server` — a Vite plugin providing an API mock dev server: it intercepts HTTP/WS requests that match user-configured proxy prefixes, matches them against mock files, and responds with mock data. Features include mock-file hot reload, validators, scenes, error simulation, cookies, SSE, WebSocket mocks, request record/replay, CORS, and a build-time generator that emits a standalone mock server.

Monorepo (pnpm workspaces): the plugin package `vite-plugin-mock-dev-server/` (only published artifact), an `example/` Vite app, and `docs/` (VitePress). All package manifests, `pnpm-workspace.yaml`, and configs live at the repo root.

## Architecture & Data Flow

Request pipeline: **configure → compile → match → respond**

1. **Configure**: `mockDevServerPlugin(options)` (`vite-plugin-mock-dev-server/src/core/plugin.ts`) returns `[serverPlugin, buildPlugin?]`. `config()` strips `wsPrefix` entries from `server.proxy`, wires request-body recovery, sets up the recorder; `configResolved` merges user options with `server.proxy` keys via `resolvePluginOptions` (`core/options.ts`).
2. **Compile**: `configureServer` → `initMockMiddlewares` (`core/init.ts`) → `Compiler` (`compiler/compiler.ts`), an `EventEmitter` that globs `include` patterns (default `**/*.mock.{js,ts,cjs,mjs,json,json5}` under `dir` default `mock/`), bundles each mock file (`compile.ts` picks **rolldown if installed, else esbuild**; Vite `define`/alias injection; `vite-plugin-mock-dev-server` imports renamed to the `/helper` subpath), loads via temp-file dynamic `import()`, then normalizes exports through `processRawData` (stamps `__filepath__`) and `processMockData` (groups by pathname, embeds URL query into validators, sorts by validator weight). Chokidar watches mock files + their deps; updates emit `mock:update-end` → optional Vite full-reload and WS mock restart.
3. **Match**: `createMockMiddleware` (`mockHttp/middleware.ts`) per request: `urlParse` → proxy-prefix gate (`doesProxyContextMatchUrl`) → `matchingWeight` sorts candidate URL rules (static < dynamic < wildcard priority; `priority.global`/`priority.special` overrides) → body parse (`co-body`/formidable, raw body cached for proxy recovery) → `findMockData` (`mockHttp/matcher.ts`): method filter (default `['GET','POST']`), scene match (`activeScene` option or `X-Mock-Scene` header), `isPathMatch`, then validator (function or object-subset). First hit wins. Miss → replay from recordings, else record + `next()`.
4. **Respond**: CORS (matched requests only) → attach request extras (`query`, `params`, `body`, `getCookie`, …) → optional error simulation (`error.probability`) → status/headers/cookies → body: value, sync/async `body` fn, or `response(req, res, next)` middleware; `delay` number or `[min, max]`. Failures → `logger.error` + 500.
5. **WebSocket**: `mockWebsocket/server.ts` listens `upgrade`; per-URL `WebSocketServer({ noServer: true })`; mock `setup(wss, { onCleanup })`; HMR restarts affected sockets.
6. **Record/Replay**: `recorder/` hooks `proxyRes` on non-ws proxies; recordings stored as pretty-printed JSON (`kebabCase(pathname).json`), replayed as synthetic mock items with decompression (gzip/br/zstd).
7. **Build**: `buildPlugin.buildEnd` → `build/generate.ts` emits `mockServer/` (standalone connect server + bundled mock data + package.json).

## Key Directories

| Path                                             | Purpose                                                                                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plugin-mock-dev-server/src/`               | Plugin source (ESM, `.js` import suffixes, per-dir `index.ts` barrels)                                                                  |
| `vite-plugin-mock-dev-server/src/core/`          | Plugin lifecycle: `plugin.ts`, `options.ts`, `init.ts`, `define.ts` (Vite define fork), `logger.ts`                                     |
| `vite-plugin-mock-dev-server/src/compiler/`      | Mock-file bundling/loading/watch: `compiler.ts`, `esbuild.ts`, `rolldown.ts`, `compile.ts`, `processData.ts`                            |
| `vite-plugin-mock-dev-server/src/mockHttp/`      | HTTP request pipeline: `middleware.ts`, `request.ts`, `response.ts`, `matcher.ts`, `matchingWeight.ts`, `cors.ts`, `requestRecovery.ts` |
| `vite-plugin-mock-dev-server/src/mockWebsocket/` | WS mock server (`server.ts`)                                                                                                            |
| `vite-plugin-mock-dev-server/src/helpers/`       | Public helpers: `defineMock.ts`, `defineMockData.ts`, `createSSEStream.ts`                                                              |
| `vite-plugin-mock-dev-server/src/recorder/`      | Record/replay: `Recorder.ts`, `replay.ts`, `storage.ts`, `decompress.ts`, `helper.ts`                                                   |
| `vite-plugin-mock-dev-server/src/build/`         | Standalone server generation (`generate.ts`, `serverEntryCode.ts`, `mockEntryCode.ts`)                                                  |
| `vite-plugin-mock-dev-server/src/types/`         | Public types: `options.ts`, `httpConfig.ts`, `wsConfig.ts`, `record.ts`, `cookies.ts`, `http.ts`                                        |
| `vite-plugin-mock-dev-server/src/utils/`         | Shared: `urlParse.ts`, `isPathMatch.ts`, `isObjectSubset.ts`, `createMatcher.ts`, `matchScene.ts`, `matchingWeight` helpers             |
| `vite-plugin-mock-dev-server/__tests__/`         | Vitest specs (`*.spec.ts`)                                                                                                              |
| `example/`                                       | Demo Vite app exercising every feature; `mock/` holds 27+ `*.mock.ts` files                                                             |
| `docs/`                                          | VitePress site (root = English, `zh/` = Chinese)                                                                                        |
| `.github/workflows/`                             | CI: `lint.yaml`, `test.yaml`, `release.yaml`                                                                                            |

## Development Commands

```bash
pnpm i                 # install (pnpm ^11.20, node ^20.19+)
pnpm dev               # run example app (vite dev)
pnpm build             # build plugin: pnpm -F vite-plugin-mock-dev-server build (tsdown)
pnpm test              # vitest (watch mode)
pnpm vitest run        # single CI-style run
pnpm run lint          # oxlint . --type-check --type-aware
pnpm format            # oxfmt .  (repo-wide formatting)
pnpm docs:dev          # VitePress dev server
pnpm docs:build        # VitePress build
pnpm example:build     # vite build the example
pnpm release           # maintainer-only: bumpp + conventional-changelog + tag/push
```

## Code Conventions & Common Patterns

- **ESM only** (`"type": "module"`). Relative imports in TS source use explicit `.js` suffixes: `import { createMockMiddleware } from '../mockHttp/middleware.js'`. Never import without the extension.
- **Barrel files**: every `src/` subdirectory has an `index.ts` re-exporting its public symbols; `src/index.ts` is the public entry (plugin + helpers + 6 public types).
- **Naming**: camelCase files/functions (`loadFromCode.ts`, `createSSEStream`); PascalCase for class files (`Recorder.ts`, `Compiler`). Prefix-free, descriptive names.
- **Public API docs**: JSDoc on all exported symbols, bilingual English + Chinese (`/** ... */`); oxlint enforces `@type` tag preference. File-level spec comments are also bilingual.
- **Types**: `strict`, `noUnusedLocals`, `isolatedDeclarations: true` (every exported symbol needs an explicit type annotation). Public option types in `src/types/`; `MockHttpItem`/`MockWebsocketItem` extend `MockBaseItem`.
- **Mock item shape**: `{ url (path-to-regexp), method, status, statusText, headers, cookies, delay, body | body(request) | response(req,res,next), validator, error, scene }`. Mock files default-export an array (or object) of items; `defineMock()` is an identity helper for type inference, `createDefineMock(transformer)` builds a customized one. **Never change the exported mock shape without updating `processRawData`/`processMockData` and `example/mock/`.**
- **Async**: `async/await` throughout; Connect middleware is `async (req, res, next)` and must catch its own errors (→ `logger.error` + 500). Body functions may return `Promise<ResponseBody>`.
- **Error handling**: explicit try/catch with contextual `logger.error` messages; validator failures logged and treated as non-matches (`attempt()` in `matcher.ts`); catch variables typed `any` (`useUnknownInCatchVariables: false`).
- **Matching**: URLs use `path-to-regexp`; include/exclude use picomatch (`createMatcher`); rule ordering via `matchingWeight` (static < dynamic < wildcard, then `priority` config) — keep `matchingWeight.spec.ts` in sync when touching it.
- **Logging**: `createLogger(prefix, level)` (ansis-colored), `debug` from `obug` (`DEBUG=vite:mock`) for internal tracing.
- **State**: no global mutable state; options resolved once into `ResolvedMockServerPluginOptions`; compiler caches (moduleCache/moduleDeps) live on the `Compiler` instance; per-request state passed explicitly.
- **Formatting/lint**: oxlint (type-aware) + oxfmt via `@pengzhanbo/oxc-config` — no ESLint/Prettier. Don't hand-format or manually organize imports; run `pnpm format` / `pnpm run lint`. VSCode: `oxc.oxc-vscode` extension with format-on-save.

## Important Files

- `vite-plugin-mock-dev-server/src/index.ts` — public entry (also `./helper`, `./server`, `./types` subpath exports)
- `vite-plugin-mock-dev-server/src/core/plugin.ts` — plugin definition; `core/options.ts` — option resolution/defaults
- `vite-plugin-mock-dev-server/src/mockHttp/middleware.ts` — the request pipeline (most-read file)
- `vite-plugin-mock-dev-server/src/compiler/compiler.ts` — mock-file loading/watch lifecycle
- `vite-plugin-mock-dev-server/src/mockWebsocket/server.ts` — WS handling + HMR restart
- `vite-plugin-mock-dev-server/src/helpers/defineMock.ts`, `defineMockData.ts`, `createSSEStream.ts` — public helper APIs
- `vite-plugin-mock-dev-server/tsdown.config.ts` — build (4 entries, ESM, dts, strips output comments)
- `vitest.config.ts`, `oxlint.config.ts`, `oxfmt.config.ts`, `tsconfig.json`, `pnpm-workspace.yaml` — tooling
- `example/vite.config.ts`, `example/mock/` — canonical plugin usage + mock-file examples
- `CONTRIBUTING.md`, `.github/commit-convention.md` — contribution/commit rules

## Runtime/Tooling Preferences

- **Runtime**: Node `^20.19.0 || ^22.11.0 || ^24.11.0 || >=26` (root devEngines; plugin engines `^20.19.0 || >=22`), ESM only. CI runs Node 24.
- **Package manager**: pnpm `^11.20.0`. All deps come from `pnpm-workspace.yaml` catalogs — reference them as `catalog:dev` / `catalog:prod`, never hardcode versions in package.json.
- **Lint/format**: oxlint + oxfmt (from `@pengzhanbo/oxc-config`); lint is type-aware (`--type-check --type-aware`). `.editorconfig`: 2-space indent, LF, UTF-8, final newline.
- **Tooling constraints**: no Jest/Mocha/ESLint/Prettier; do not add them. tsdown is the only build tool; vitest the only test runner.
- **CI**: lint and test workflows run on push/PR to `main`; release is tag-triggered (`v*`), maintainer-only, publishes with provenance.
- **Docs**: VitePress 2; root locale is English, `docs/zh/` Chinese; content mirrored in both.

## Testing & QA

- **Framework**: Vitest 4 (root `vitest.config.ts` sets only `include: ['vite-plugin-mock-dev-server/__tests__/**/*.spec.ts']`). Node environment, no setup files, no snapshots, no coverage thresholds.
- **Run**: `pnpm test` (watch) or `pnpm vitest run`; CI runs `pnpm vitest run`.
- **Conventions**: specs colocated in `vite-plugin-mock-dev-server/__tests__/` as `<module>.spec.ts`, importing source via `../src/<module>.js`. Pure unit tests — mock files are inline typed object literals, and the middleware spec drives `createMockMiddleware` with hand-rolled fake `req`/`res` (event-emitter request, recording response) plus a fake compiler (`{ mockData, on: vi.fn(), emit: vi.fn() }`); no real Vite server is booted.
- **Per-feature specs**: `mockMiddleware.spec.ts` (pipeline), `matchingWeight.spec.ts` + `integration.spec.ts` (rule ordering), `compiler.spec.ts` (data processing), `request*.spec.ts` (params/validation/logging), `sse.spec.ts`, `cors.spec.ts`, `helper.spec.ts`, `response.spec.ts`, `options.spec.ts`, `utils.spec.ts`, `findMockData.spec.ts`.
- **Expectations**: changes to matching/validation/response logic must carry/update specs (e.g. `matchingWeight.spec.ts` is a fixed 22-rule corpus). `defineMockData` is currently untested — new tests welcome. Manual end-to-end verification goes through the example app (`pnpm dev`, then exercise `example/src/main.ts` flows) or a built mock server (`build: true`).
