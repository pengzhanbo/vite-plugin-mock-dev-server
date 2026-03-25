# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`vite-plugin-mock-dev-server` is a Vite plugin for mocking API endpoints during development. It intercepts HTTP requests matching configured proxy patterns and returns mocked responses defined in `.mock.ts` files.

## Architecture

### Plugin Entry Point

The main plugin is created in `vite-plugin-mock-dev-server/src/core/plugin.ts` via `mockDevServerPlugin()`. This returns an array of two Vite plugins:

- **serverPlugin** (`enforce: 'pre'`) - Handles dev server mock interception
- **buildPlugin** (`enforce: 'post'`) - Generates standalone mock server during production build

### Request Flow

1. `serverPlugin` configures the Vite dev server via `configureServer` hook
2. `initMockMiddlewares()` in `src/core/init.ts` creates the middleware chain
3. `Compiler` class (`src/compiler/compiler.ts`) loads and watches mock files
4. `createMockMiddleware()` (`src/mockHttp/middleware.ts`) intercepts requests and returns mocked responses

### Key Source Directories

- `src/core/` - Plugin lifecycle, option resolution, logger
- `src/compiler/` - Mock file compilation using esbuild/rolldown, hot reload
- `src/mockHttp/` - HTTP mock request matching, parsing, response handling, CORS
- `src/mockWebsocket/` - WebSocket mock support
- `src/helpers/` - User-facing helpers (`defineMock`, `defineMockData`, `createSSEStream`)
- `src/recorder/` - Request recording and replay for proxy responses
- `src/build/` - Standalone mock server generation for production builds
- `src/cookies/` - Cookie handling via `cookies` package
- `src/types/` - TypeScript type definitions

### Build Output

Uses `tsdown` (configured in `tsdown.config.ts`) to produce:

- `dist/index.js` - Main plugin export
- `dist/helper.js` - Helper utilities for mock files
- `dist/server.js` - Standalone server
- `dist/types.d.ts` - Combined type definitions

## Commands

```bash
# Build the plugin
pnpm build

# Run tests (vitest)
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run a single test file
pnpm test -- src/__tests__/validator.spec.ts

# Lint
pnpm lint

# Run example dev server
pnpm dev

# Build example
pnpm example:build

# Build documentation
pnpm docs:build
```

## Project Structure

```
vite-plugin-mock-server/
├── pnpm-workspace.yaml      # Monorepo workspace config
├── vitest.config.ts         # Test configuration (runs spec.ts in __tests__)
├── eslint.config.js         # ESLint using @pengzhanbo/eslint-config
├── vite-plugin-mock-dev-server/
│   ├── src/
│   │   ├── index.ts         # Public exports
│   │   ├── core/            # Plugin core (plugin.ts, options.ts, init.ts)
│   │   ├── compiler/        # Mock file compilation
│   │   ├── mockHttp/        # HTTP mock handling
│   │   ├── mockWebsocket/   # WebSocket mock handling
│   │   ├── helpers/         # defineMock, createSSEStream, etc.
│   │   ├── recorder/        # Request recording/replay
│   │   ├── build/           # Standalone server generation
│   │   ├── cookies/         # Cookie handling
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── __tests__/           # Test files
│   └── dist/                 # Build output
├── example/                  # Example usage
└── docs/                     # VitePress documentation
```

## Mock File Compilation

Mock files (`.mock.ts`, `.mock.js`, `.mock.json`, etc.) are compiled by the `Compiler` class using esbuild (with rolldown as fallback for Vite 7+). The compilation:

- Runs in parallel with concurrency limiting (64 files)
- Injects `viteDefine` (from `config.define`) and `alias` resolution
- Supports HMR when mock files or their dependencies change

## Note on Vite Version Compatibility

The plugin automatically selects `esbuild` or `rolldown` for compilation based on the Vite version. Peer dependencies `esbuild` and `rolldown` are optional but one is required for mock file compilation.
