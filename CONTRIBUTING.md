# Contributing Guide

Thank you for your interest in contributing to `vite-plugin-mock-dev-server`! This document provides guidelines and instructions to help you get started.

English | [简体中文](./CONTRIBUTING.zh-CN.md)

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Repository Setup](#repository-setup)
- [Development Workflow](#development-workflow)
  - [Project Structure](#project-structure)
  - [Development Commands](#development-commands)
  - [Running Tests](#running-tests)
  - [Debugging](#debugging)
- [Coding Guidelines](#coding-guidelines)
  - [Code Style](#code-style)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [JSDoc Documentation](#jsdoc-documentation)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- **Node.js**: `^20.19.0 || >=22` (CI runs Node 24)
- **pnpm**: Version `12.x` — the repository pins `pnpm@12.15.0` via `packageManager`. Run `corepack enable` (or `corepack use pnpm@12`) so the pinned version is used instead of a globally installed one
- **Git**: For version control

### Repository Setup

1. **Fork the repository**

   Click the "Fork" button on the GitHub repository page to create your own fork.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/vite-plugin-mock-dev-server.git
   cd vite-plugin-mock-dev-server
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Verify setup**

   ```bash
   # Build once: type-aware lint and the example app resolve the package through `dist`
   pnpm build

   # Type-aware lint + format check
   pnpm lint

   # Single test run (the default `pnpm test` is watch mode)
   pnpm test:run
   ```

## Development Workflow

### Project Structure

This is a monorepo managed by pnpm workspaces:

```txt
vite-plugin-mock-dev-server/
├── vite-plugin-mock-dev-server/    # Core plugin package (the only published artifact)
│   ├── src/                        # Source code
│   │   ├── build/                  # Standalone mock server generation
│   │   ├── compiler/               # Mock file bundling, loading and watching
│   │   ├── core/                   # Plugin lifecycle, options, define, logger
│   │   ├── helpers/                # Public helpers (defineMock, defineMockData, createSSEStream)
│   │   ├── mockHttp/               # HTTP mock pipeline (matching, request/response handling)
│   │   ├── mockWebsocket/          # WebSocket mock server
│   │   ├── recorder/               # Request recording and replay
│   │   ├── types/                  # Public TypeScript types
│   │   ├── utils/                  # Shared utilities
│   │   ├── index.ts                # Public entry
│   │   └── server.ts               # Standalone server entry
│   ├── __tests__/                  # Vitest specs, including `e2e/`
│   ├── tsdown.config.ts            # Package build config
│   └── package.json
├── docs/                           # VitePress site (`en/` English, `zh/` Chinese)
├── example/                        # Demo Vite app exercising the plugin (`mock/`)
├── .github/workflows/              # lint / test / release CI
├── oxlint.config.ts                # Type-aware lint config
├── oxfmt.config.ts                 # Formatting config
├── vitest.config.ts                # Test runner config
├── tsconfig.json                   # Shared TypeScript config
├── pnpm-workspace.yaml             # Workspace + dependency catalogs
└── package.json                    # Root scripts and dev dependencies
```

Third-party dependencies are declared through pnpm catalogs in `pnpm-workspace.yaml`. Reference them as `catalog:dev` / `catalog:prod` in package manifests instead of hardcoding versions; workspace packages are linked with `workspace:*`.

### Development Commands

```bash
# Install dependencies
pnpm install

# Build the plugin with tsdown
pnpm build

# Run the example app with `vite dev`
pnpm dev

# Build the example app
pnpm example:build

# Run the example end-to-end spec
pnpm example:test

# Documentation site (VitePress)
pnpm docs:dev
pnpm docs:build
pnpm docs:preview

# Lint: type-aware oxlint + oxfmt check
pnpm lint

# Auto-fix lint issues and format the whole repository
pnpm format

# Tests (watch mode by default)
pnpm test

# Single CI-style test run
pnpm test:run
```

Run `pnpm build` at least once after cloning, and again after changing plugin source: the example app (including the end-to-end specs that run it) and type-aware lint resolve `vite-plugin-mock-dev-server` through its `dist` output.

The docs site has two locales: `docs/en/` (English) and `docs/zh/` (Chinese). Keep both in sync when changing documentation. `example/mock/` is the canonical set of mock-file examples, so update it whenever the exported mock shape changes.

### Running Tests

The project uses [Vitest](https://vitest.dev/) for testing. Specs live in `vite-plugin-mock-dev-server/__tests__/` (end-to-end specs in `__tests__/e2e/`); `vitest.config.ts` only includes `vite-plugin-mock-dev-server/__tests__/**/*.spec.ts`, uses the Node environment and a 20s timeout. No coverage provider is configured.

```bash
# Watch mode (useful during development)
pnpm test

# Run all tests once
pnpm test:run

# Run a specific spec
pnpm test:run vite-plugin-mock-dev-server/__tests__/compiler.spec.ts

# Filter by test name
pnpm test:run -t "matching weight"

# Run the example end-to-end spec only
pnpm example:test
```

CI runs `pnpm vitest run --retry=1` on Node 24 for every push and pull request to `main`.

### Debugging

To debug the plugin during development:

1. **Using the example project**

   The `example/` directory contains a test project that uses the plugin:

   ```bash
   pnpm dev
   ```

   This starts the example Vite project with the plugin loaded.

2. **Adding debug logs**

   The plugin uses [`obug`](https://github.com/unjs/obug) with the `vite:mock` namespace for internal tracing:

   ```bash
   DEBUG=vite:mock pnpm dev
   ```

   Normal plugin output is controlled by the plugin's [`log`](./README.md#log) option (default `'info'`). Use the `debug` level (`log: 'debug'`) when you need the request-level logs without enabling `DEBUG`.

3. **VS Code debugging**

   Create a `.vscode/launch.json` file:

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Example",
         "runtimeExecutable": "pnpm",
         "runtimeArgs": ["dev"],
         "cwd": "${workspaceFolder}",
         "console": "integratedTerminal"
       }
     ]
   }
   ```

## Coding Guidelines

### Code Style

The project is linted and formatted with [oxlint](https://oxc.rs/docs/guide/usage/linter.html) (type-aware) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html), configured through `@pengzhanbo/oxc-config`. ESLint, Prettier, Jest and Mocha are intentionally not used — do not add them.

```bash
# Check lint + formatting (what CI runs)
pnpm lint

# Auto-fix lint issues and format the repository
pnpm format
```

Do not hand-format code or manually reorder imports: `.vscode/settings.json` configures the `oxc.oxc-vscode` extension as the default formatter with format-on-save, and `source.organizeImports` is disabled because oxfmt handles import sorting.

Key conventions:

- ESM only (`"type": "module"`); relative imports in TypeScript source need an explicit `.js` suffix
- Single quotes, no semicolons, 2-space indentation, LF line endings, trailing commas
- Every `src/` subdirectory has an `index.ts` barrel; `src/index.ts` is the public entry
- camelCase for files and functions, PascalCase for class files (such as `Recorder.ts`)

### TypeScript Guidelines

- **Strict mode enabled**, together with `noUnusedLocals`
- **`isolatedDeclarations: true`**: every exported symbol needs an explicit type annotation, including exported constants and inferred return types
- **Prefer `unknown` over `any`** and narrow it with type guards; catch variables are the exception — `useUnknownInCatchVariables` is disabled, so `catch (error)` is typed `any`
- Public option/data types belong in `src/types/`; internal helpers stay in their feature directory

### JSDoc Documentation

All public APIs must include bilingual JSDoc comments in the following format (`oxlint` is configured to prefer `@type` over `@typedef`):

````typescript
/**
 * English description
 *
 * 中文描述
 *
 * @param paramName - English description / 中文描述
 * @returns English description / 中文描述
 * @example
 * ```ts
 * example()
 * ```
 */
````

Example:

````typescript
/**
 * Define mock data with memory-based sharing mechanism
 *
 * 定义带有基于内存的共享机制的 Mock 数据
 *
 * @param key - Unique key for mock data / Mock 数据的唯一键
 * @param initialData - Initial data value / 初始数据值
 * @param options - Options / 选项
 * @returns MockData object with getter, setter, and value property / 带有 getter、setter 和 value 属性的 MockData 对象
 * @example
 * ```ts
 * export default defineMockData('posts', [])
 * ```
 */
export function defineMockData<T = any>(
  key: string,
  initialData: T,
  options?: DefineMockDataOptions,
): MockData<T>
````

## Commit Convention

We follow the [Angular Commit Convention](./.github/commit-convention.md). Each commit message should follow this format:

```txt
<type>(<scope>): <subject>
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes
- `revert`: Revert a previous commit

Add `!` after the type or scope to mark a breaking change, and keep the subject within 50 characters.

Examples:

```txt
feat(compiler): add support for json5 files
fix(http): resolve cookie parsing issue
perf(build)!: remove 'foo' option
revert: feat(compiler): add 'comments' option
docs: update API documentation
```

## Pull Request Process

1. **Create a branch**

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**

   - Write clear, concise code
   - Add tests for new features and bug fixes
   - Keep the English and Chinese docs in sync, and update `example/mock/` when the mock-file shape changes
   - Run `pnpm build`, `pnpm lint` and `pnpm test:run` locally

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

4. **Push to your fork**

   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create a Pull Request**

   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe the change clearly, and include related issue numbers and screenshots for UI changes

   CI runs the `Lint` and `Test` workflows (Node 24) on every pull request targeting `main`; both must pass before merging.

6. **PR Review**

   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

## Release Process

> **Note**: Only maintainers can perform releases.

The project uses [bumpp](https://github.com/antfu/bumpp) for version management and [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) for changelog generation.

```bash
# Bump versions (root, plugin, docs, example), generate CHANGELOG.md,
# commit, create the `v*` tag and push it
pnpm release

# Regenerate CHANGELOG.md only
pnpm release:changelog

# Publish workspace packages (normally executed by CI, not locally)
pnpm release:publish
```

Publishing is automated: pushing a `v*` tag triggers `.github/workflows/release.yaml`, which re-runs the test workflow, builds the plugin, publishes with npm provenance, and creates the GitHub release notes. `pnpm release:publish` maps to `pnpm -r publish` and is only needed for a manual recovery.

---

## Questions?

If you have any questions or need help, feel free to:

- Open an [issue](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues)
- Start a [discussion](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/discussions)

Thank you for contributing! 🎉
