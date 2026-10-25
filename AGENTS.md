# Repository Guidelines

`vite-plugin-mock-dev-server` is a pnpm monorepo for a Vite plugin that serves HTTP and WebSocket mocks from `*.mock.*` files during development, records/replays proxied responses, and can emit a standalone Node mock server at build time. Only the plugin package is published; `example/` and `docs/` are private.

- There is no root `src/` and no `packages/` directory. Library source is `vite-plugin-mock-dev-server/src/`.
- The published package is ESM-only and has no `bin` or CLI. Entry points are `.`, `./helper`, `./server`, and `./types`.
- Primary API: `mockDevServerPlugin(options?: MockServerPluginOptions): Plugin[]`.

## Project Overview

The plugin exists to make a Vite dev server behave like a mock backend:

- HTTP mock handlers with path parameters, method/query/body/header validators, scenes, delays, cookies, CORS, streaming, and SSE.
- WebSocket mocks via Vite's HTTP `upgrade` path, with a pooled `WebSocketServer` per matched path.
- Record/replay of real proxy responses into JSON files.
- Optional `build` output: a self-contained Connect server plus bundled mock data and `package.json`.

The plugin is consumed by `example/` through `workspace:*`; the example resolves the built `dist`, so build before running it.

## Architecture & Data Flow

### Plugin lifecycle

```text
mockDevServerPlugin(options)
├─ serverPlugin   apply: 'serve', enforce: 'pre'
│  ├─ config()                    ignore temp mock files; strip wsPrefix from server.proxy; install proxy hooks
│  ├─ configResolved()            resolve options once per Vite config
│  └─ configureServer() /         initMockMiddlewares() -> Compiler + HTTP middleware + WS upgrade handler
│     configurePreviewServer()
└─ buildPlugin    apply: 'build', enforce: 'post'   (only when options.build is truthy)
   └─ buildEnd()                  generateMockServer() -> dist/mockServer by default
```

`enabled: false` returns `[]`. The two plugins share a `WeakMap`-backed option resolution holder keyed by `ResolvedConfig`; do not replace it with a module-level singleton.

### Mock compilation

1. `Compiler` discovers files under `cwd/dir` with tinyglobby, filtered by `include`/`exclude` (picomatch).
2. Each mock file is bundled independently with rolldown (preferred) or esbuild, then written next to the source as `.vite-mock-tmp-<md5>.mjs|cjs` and dynamically imported.
3. `processRawData()` normalizes one file's export (array, single item, or URL map) and stamps `__filepath__`.
4. `processMockData()` groups rules by decoded pathname into `Record<string, MockOptions>` and sorts each group.

Each mock file is its own bundle, so imported module state is **not** shared between mocks. Shared state must use `defineMockData()`; both bundlers keep `vite-plugin-mock-dev-server` external and rewrite it to `/helper` for this reason.

### Request flow

- **HTTP:** Connect middleware created by `createMockMiddleware()`. It filters by `prefix`/proxy keys, sorts matching URLs by `matchingWeight`, resolves the active scene (`X-Mock-Scene` overrides `activeScene`), handles CORS preflight, buffers and parses the request body, then finds the first rule matching pathname + method + scene + validator.
- Unmatched requests pass to the next middleware (normally Vite's proxy). The raw request body is cached and replayed by `requestRecoverySetup` because the middleware consumed the original stream.
- **Response precedence:** a non-nil `body` wins; otherwise `response(req, res, next)` runs; otherwise the middleware ends with an empty response. A `response` function is responsible for ending the response itself.
- **WebSocket:** the Node HTTP server's `upgrade` event is intercepted. Vite HMR protocols (`vite-hmr`, `vite-ping`) bypass mock handling. Matching uses scene + path only; validators do not distinguish WS rules. Servers are pooled per `mockUrl + pathname` and recycled 60 s after the last disconnect.
- **Record/replay:** `Recorder` hooks HTTP proxy `proxyRes`; only fall-through requests cached by `handleMissingMock` are recorded. Replay runs when no mock rule matches and is enabled by default when recording is enabled.
- **Build:** `generateMockServer()` writes bundled `mock-data.js`, standalone `index.js`, and `package.json`. An absolute `build.dist` writes directly to disk; a relative one is emitted under Vite's `outDir`.

### Module map

| Module                                                    | Responsibility                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/core/plugin.ts`                                      | Plugin factory, Vite hooks, build plugin                              |
| `src/core/options.ts`                                     | Defaults, option resolution, CORS/record/proxy normalization          |
| `src/core/init.ts`                                        | Compiler + middleware + WS wiring and initial-load readiness          |
| `src/core/matchingWeight.ts`                              | URL priority sorting and cached sorter                                |
| `src/compiler/compiler.ts`                                | Discovery, module cache, dependency watch, HMR events                 |
| `src/compiler/{compile,esbuild,rolldown,loadFromCode}.ts` | Per-file bundling and temporary module loading                        |
| `src/compiler/processData.ts`                             | Normalize, group, and sort mock rules                                 |
| `src/mockHttp/*`                                          | HTTP request parsing, matching, CORS, response construction           |
| `src/mockWebsocket/*`                                     | Upgrade interception, rule matching, pool, HMR cleanup                |
| `src/recorder/*`                                          | Proxy recording, JSON storage, replay, decompression                  |
| `src/build/*`                                             | Standalone server generation and generated package metadata           |
| `src/helpers/*`                                           | `defineMock`, `createDefineMock`, `defineMockData`, `createSSEStream` |
| `src/types/*`                                             | Public option, HTTP, WebSocket, record, and cookie types              |
| `src/utils/*`                                             | Path normalization, matchers, URL parsing, proxy hooks                |

### Invariants to preserve

- **Cache keys:** compiler keys are `dir`-prefixed, `cwd`-relative, POSIX paths such as `mock/a.mock.ts`. Watcher paths already include `dir`; re-prefixing produces `mock/mock/...` and breaks deletion.
- **Immutable mock data:** `Compiler.updateMockData()` replaces `_mockData` with a new object. URL and sorter caches are keyed by that object/path; clear them on `mock:update-end` instead of mutating data in place.
- **Compile failures keep the last good rules.** `load()` returns `false` and records the error; falling through to a real backend silently is worse than serving stale rules.
- **Cancelled loads:** every load stores a `Symbol` token. Success and failure paths must discard their result if the token is stale, and `unlink` must delete the token.
- **Temp-file cleanup:** the temp filename mark/pattern must stay consistent across `loadFromCode.ts`, the Vite watcher ignore list, and chokidar ignores.
- **CORS stays inside the mock middleware.** The plugin is `enforce: 'pre'`, so Vite's CORS middleware runs too late for mock responses; preflight must complete before body parsing.
- **Do not consume the request stream twice.** The body is read raw, cached, then replayed through a `PassThrough`; proxy forwarding depends on the cached raw buffer.
- **WS proxy isolation:** `wsPrefix` keys are removed from `server.proxy` during `config` to avoid double upgrade handling. A non-HMR upgrade under `wsPrefix` must explicitly reject (404 no rule, 500 sorter failure).
- **Option resolution is once per `ResolvedConfig`,** not once per process.
- **`path-to-regexp` v9:** mock URLs are matched against decoded pathnames. A query string embedded in a mock `url` is moved into `validator.query`, not matched literally.
- **Error convention:** expected client conditions become 400/413/500 responses; invalid mocks are logged and dropped at compile time; unexpected middleware errors log then call `next(error)`. Only build generation throws to fail the Vite build.

## Key Directories

| Path                                         | Purpose                                                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plugin-mock-dev-server/src/`           | Plugin source. `core/`, `compiler/`, `mockHttp/`, `mockWebsocket/`, `recorder/`, and `build/` are the main subsystems.                                            |
| `vite-plugin-mock-dev-server/__tests__/`     | Unit and integration specs, flat by feature.                                                                                                                      |
| `vite-plugin-mock-dev-server/__tests__/e2e/` | Real-server tests with shared helpers in `helpers.ts`.                                                                                                            |
| `example/`                                   | React + Tailwind playground and live fixture. `mock/` contains real mock files; `src/scenarios.ts` is the shared scenario manifest used by the dashboard and e2e. |
| `docs/`                                      | VitePress site: English in `docs/en/` rewritten to root URLs, Chinese in `docs/zh/`, shared config split across `docs/config.ts` and `docs/zh/config.ts`.         |
| `README.md`, `README.zh-CN.md`               | Full API manuals; cross-check against source and keep both languages aligned with the docs site.                                                                  |
| `.github/workflows/`                         | `test.yaml`, `lint.yaml`, `release.yaml`.                                                                                                                         |
| `vite-plugin-mock-dev-server/dist/`          | Generated by tsdown; never edit.                                                                                                                                  |

## Development Commands

| Purpose                     | Command                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| Install                     | `pnpm install`                                                           |
| Build plugin                | `pnpm build`                                                             |
| Run example                 | `pnpm dev` (build first; example resolves `dist`)                        |
| Run all tests once          | `pnpm test:run`                                                          |
| Run all tests in watch mode | `pnpm test`                                                              |
| Run one spec                | `pnpm vitest run vite-plugin-mock-dev-server/__tests__/compiler.spec.ts` |
| Run one test by name        | `pnpm vitest run <spec> -t "should ..."`                                 |
| Run example e2e only        | `pnpm example:test`                                                      |
| Lint + format check         | `pnpm lint`                                                              |
| Auto-fix + format           | `pnpm format`                                                            |
| Docs dev/build/preview      | `pnpm docs:dev`, `pnpm docs:build`, `pnpm docs:preview`                  |
| Release                     | `pnpm release` (bumpp + changelog + commit/tag/push)                     |

`pnpm lint` expands to `oxlint . --type-check --type-aware && oxfmt . --check`. There is no standalone `tsc`/typecheck script; type-aware oxlint is the type gate. The lint CI job builds the plugin first.

## Code Conventions & Common Patterns

### Formatting and imports

- Single quotes, no semicolons, 2-space indentation, print width 100, trailing commas `all`.
- Imports are sorted with type-only imports first, then builtins, externals, and relatives; no blank lines between groups, then one blank line after the import block.
- Use `import type { … }` as a separate statement; do not use inline type imports.
- `pnpm format` applies the authoritative rules. Do not hand-tune import order.

### TypeScript

- `strict`, `noUnusedLocals`, and `isolatedDeclarations` are enabled. Exported functions and objects need explicit boundary types, especially return types.
- Prefer `interface` for object shapes; use type aliases for unions, tuples, and function types.
- Source imports use `.js` suffixes even from `.ts` files (`./core/index.js`). This matches ESM output and `moduleResolution: "Bundler"`.
- Use `node:` prefixes for builtins. `no-floating-promises` and `require-await` are lint errors.
- `typescript/no-explicit-any` is disabled, but public APIs should still avoid leaking `any`.

### Naming and documentation

- Source filenames mix camelCase and kebab-case. No filename lint rule exists; follow the surrounding directory.
- Test files are `<feature>.spec.ts` under `__tests__/`; use `describe` + `it`, and import hooks/assertions explicitly from `vitest`.
- Public APIs carry bilingual English/Chinese JSDoc with `@param`, `@returns`, and examples where useful. Preserve this convention and do not auto-reformat JSDoc.
- Test files usually open with a bilingual comment explaining the regression they guard.

### Error handling and async patterns

- Compile and middleware failures should degrade safely and log; preserve the last good mock rules.
- Mock `response` functions own the response lifecycle. The middleware only ends with `''` when neither `body` nor `response` is present.
- Request bodies are buffered and replayed; response streams register error/close handlers before applying delays.
- Options are resolved once and passed explicitly as `ResolvedMockServerPluginOptions`. There is no DI container; standalone serving uses a structural `{ mockData }` provider.

### Where changes go

| Change                     | Primary locations                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| New plugin option          | `src/types/options.ts`, `src/core/options.ts`, `src/core/plugin.ts` if hook-related, README and both docs locales |
| HTTP mock behavior         | `src/mockHttp/`, `src/types/httpConfig.ts`, `__tests__/mockMiddleware.spec.ts`, `response.spec.ts`                |
| Compilation/watch behavior | `src/compiler/`, `__tests__/compiler*.spec.ts`, `transform*.spec.ts`                                              |
| Record/replay              | `src/recorder/`, `__tests__/recorder*.spec.ts`, `docs/*/guide/record-and-replay.md`                               |
| Generated server           | `src/build/`, `__tests__/generate.spec.ts`, example e2e build case                                                |
| Public export              | `src/index.ts`, `src/server.ts`, `src/helpers/index.ts`, `src/types/index.ts`; update root/type exports together  |

Public API changes are incomplete until the plugin entry, type exports, tests, README, and English + Chinese docs are updated.

## Important Files

| Path                                                       | Role                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `vite-plugin-mock-dev-server/src/index.ts`                 | Root public entry; re-exports helpers, server API, and selected types.                 |
| `vite-plugin-mock-dev-server/src/server.ts`                | Public `/server` entry: `processData`, logger, middleware, WebSocket, matching-weight. |
| `vite-plugin-mock-dev-server/src/core/plugin.ts`           | `mockDevServerPlugin`, `serverPlugin`, `buildPlugin`; Vite hook wiring.                |
| `vite-plugin-mock-dev-server/src/core/options.ts`          | Defaults and resolution for all plugin, CORS, record, and build options.               |
| `vite-plugin-mock-dev-server/src/core/init.ts`             | Creates the compiler, middlewares, and readiness promise.                              |
| `vite-plugin-mock-dev-server/src/compiler/compiler.ts`     | File discovery, per-file cache, dependency watching, HMR events.                       |
| `vite-plugin-mock-dev-server/src/mockHttp/middleware.ts`   | Main HTTP request/response pipeline.                                                   |
| `vite-plugin-mock-dev-server/src/mockWebsocket/upgrade.ts` | WebSocket upgrade interception and rule selection.                                     |
| `vite-plugin-mock-dev-server/src/recorder/Recorder.ts`     | Proxy response recording and storage coordination.                                     |
| `vite-plugin-mock-dev-server/src/build/generate.ts`        | Standalone server generation.                                                          |
| `vite-plugin-mock-dev-server/package.json`                 | Exports, engines, peer dependencies. `exports` is regenerated by tsdown.               |
| `vite-plugin-mock-dev-server/tsdown.config.ts`             | Four build entries, ESM output, declaration generation, comment stripping.             |
| `vitest.config.ts`                                         | Test include glob, 20 s timeout, watch ignores.                                        |
| `package.json`, `pnpm-workspace.yaml`                      | Root scripts, pnpm catalogs, workspace packages.                                       |
| `tsconfig.json`                                            | Strict TS config for plugin and docs VitePress.                                        |
| `example/plugin-options.ts`                                | Shared real plugin options for the example and e2e.                                    |
| `example/src/scenarios.ts`                                 | Shared HTTP scenario manifest for the dashboard and example e2e.                       |
| `docs/en/api/mock-server-plugin-options.md`                | User-facing option reference; mirror changes in `docs/zh/`.                            |
| `README.md`, `README.zh-CN.md`                             | Full manuals and API reference.                                                        |

## Runtime/Tooling Preferences

- **Published runtime:** Node `^20.19.0 || >=22`. **Dev tooling:** tsdown/vitest declare stricter engines; use Node 24 as CI does.
- **Package manager:** `pnpm@12.15.0` exactly, with `pnpm-lock.yaml` and workspace catalogs (`catalog:dev`, `catalog:prod`). Do not use npm or yarn.
- **Build:** tsdown, ESM only, `.d.ts` emitted, JS comments stripped, `dist` cleaned on every build, `package.json#exports` regenerated from the tsdown entry map. Edit entries, not individual exports.
- **Vite:** dev uses Vite 8; peer range is `vite >=5`. `rolldown` is preferred, `esbuild` is the fallback; both and `zstd-codec` are optional peers.
- **Lint/format:** oxlint + oxfmt only. There is no ESLint, Prettier, Biome, husky, lint-staged, commitlint, or changesets.
- **Docs:** VitePress 2 with snippet includes from `example/mock/**`; Netlify publishes `docs/.vitepress/dist`. Keep English and Chinese pages in sync.
- **Release:** `bumpp` + `conventional-changelog` locally, tag push triggers CI test, build, and `pnpm -r publish` with provenance. Commit convention is Angular (`feat(scope): …`, `fix: …`); it is documented but not hook-enforced.
- **Generated/ignored:** do not edit `dist/`, `example/dist/`, `docs/.vitepress/{dist,cache}/`, `example/mock/.recordings/`, or `CHANGELOG.md`. Runtime mock temp files are `.vite-mock-tmp-<hash>.{mjs,cjs}` next to their source; never commit or edit them.
- **Drift warning:** `CONTRIBUTING.md` is stale on tooling and tests. It mentions ESLint, line width 120, `src/__tests__`, and `pnpm test --coverage`; trust the configs and this file.

## Testing & QA

- **Framework:** Vitest 5, configured only by root `vitest.config.ts`.
- **Layout:** 38 specs under `vite-plugin-mock-dev-server/__tests__/`: 34 unit/integration at the top level plus 4 e2e specs in `__tests__/e2e/`.
- **Discovery:** `include: ['vite-plugin-mock-dev-server/__tests__/**/*.spec.ts']`, 20 s default timeout. A spec placed elsewhere will not run.
- **Style:** Node environment, no globals, explicit `describe`/`it`/`expect` imports. Case names start with `should ...`; use `it.each` for tables. Tests are isolated per file with local factories rather than shared fixtures, except `e2e/helpers.ts`.
- **Unit patterns:** hand-written req/res doubles for middleware; real chokidar and temp mock directories for compiler/watch tests; real `ws` for WebSocket; real HTTP servers for replay. Temp dirs use `mkdtemp` + `realpath`, then recursive `rm` in cleanup.
- **E2E patterns:** `createProject()`, `startMockServer()`, and `waitForMock()` boot a real Vite server with `configFile: false`, random port, and HMR disabled. Poll with `waitForMock`, do not add fixed sleeps. The example e2e runs the real `example/` project, shares `example/src/scenarios.ts`, and auto-builds `dist/helper.js` when stale.
- **Coverage:** no provider, no thresholds, no snapshots. `CONTRIBUTING.md`'s `--coverage` command does not work as written. CI gates on test exit status only.
- **CI:** `.github/workflows/test.yaml` runs `pnpm vitest run --retry=1` on Ubuntu + Node 24. `.github/workflows/lint.yaml` runs `pnpm build` then `pnpm lint`. There is no cross-OS or Node-version matrix.
- **Verification:** run the narrowest affected spec first, then the relevant e2e path when touching middleware, compiler, WebSocket, recorder, or build output. For example, HTTP pipeline changes should exercise `__tests__/mockMiddleware.spec.ts` and `__tests__/e2e/http.spec.ts`.
- **Known gaps:** the example React dashboard, the full brotli/deflate/zstd recorder matrix, and several small internal modules are only covered indirectly.
