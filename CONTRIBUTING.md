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

- **Node.js**: Version `^20 || >=22`
- **pnpm**: Version `>=10.30.1` (this project uses pnpm workspaces)
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
   # Run linting
   pnpm lint

   # Run tests
   pnpm test
   ```

## Development Workflow

### Project Structure

This is a monorepo managed by pnpm workspaces:

```txt
vite-plugin-mock-dev-server/
├── vite-plugin-mock-dev-server/    # Core plugin package
│   ├── src/                        # Source code
│   │   ├── build/                  # Standalone mock server build
│   │   ├── compiler/               # Mock file compiler (esbuild/rolldown)
│   │   ├── cookies/                # Cookie handling
│   │   ├── core/                   # Core plugin logic
│   │   ├── helpers/                # Helper functions
│   │   ├── mockHttp/               # HTTP mock middleware
│   │   ├── mockWebsocket/          # WebSocket mock support
│   │   ├── types/                  # TypeScript type definitions
│   │   └── utils/                  # Utility functions
│   ├── __tests__/                  # Unit tests
│   └── package.json
├── docs/                           # VitePress documentation site
├── example/                        # Example project for testing
├── package.json                    # Root package.json
└── pnpm-workspace.yaml             # pnpm workspace configuration
```

### Development Commands

```bash
# Build the plugin
pnpm build

# Start development mode with example project
pnpm dev

# Build example project
pnpm example:build

# Run documentation site in development mode
pnpm docs:dev

# Build documentation site
pnpm docs:build

# Run linting
pnpm lint

# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

### Running Tests

The project uses [Vitest](https://vitest.dev/) for testing.

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode (useful during development)
pnpm test --watch

# Run specific test file
pnpm test src/__tests__/compiler.spec.ts
```

### Debugging

To debug the plugin during development:

1. **Using the example project**

   The `example/` directory contains a test project that uses the plugin:

   ```bash
   pnpm dev
   ```

   This starts the example Vite project with the plugin loaded.

2. **Adding debug logs**

   The project uses the `debug` package. Enable debug logs:

   ```bash
   DEBUG=vite-plugin-mock-dev-server pnpm dev
   ```

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

This project uses ESLint with `@pengzhanbo/eslint-config` for code linting.

```bash
# Check code style
pnpm lint

# Auto-fix linting issues
pnpm lint -- --fix
```

Key style rules:

- Use single quotes for strings
- No trailing semicolons
- 2 spaces indentation
- Maximum line length: 120 characters

### TypeScript Guidelines

- **Strict mode enabled**: All code must be type-safe
- **Explicit return types**: Public APIs should have explicit return type annotations
- **No `any`**: Avoid using `any` type; use `unknown` with type guards when necessary

### JSDoc Documentation

All public APIs must include JSDoc comments in the following format:

```typescript
/**
 * English description
 *
 * 中文描述
 *
 * @param paramName - English description / 中文描述
 * @returns English description / 中文描述
 * @example
 */
```

Example:

```typescript
/**
 * Define mock data that can be shared across multiple mock files
 *
 * 定义可在多个 mock 文件间共享的 mock 数据
 *
 * @param key - Unique identifier for the data / 数据的唯一标识符
 * @param initialData - Initial value of the data / 数据的初始值
 * @returns A mock data object with getter, setter, and value properties / 包含 getter、setter 和 value 属性的 mock 数据对象
 * @example
 * ```ts
 * export default defineMockData('posts', [])
 * ```
 */
export function defineMockData<T>(key: string, initialData: T): MockData<T>
```

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

Examples:

```txt
feat(compiler): add support for json5 files
fix(http): resolve cookie parsing issue
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
   - Add tests for new features
   - Update documentation if needed
   - Ensure all tests pass

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
   - Fill in the PR template with:
     - Clear description of changes
     - Related issue numbers (if any)
     - Screenshots (if UI changes)

6. **PR Review**

   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

## Release Process

> **Note**: Only maintainers can perform releases.

The project uses [bumpp](https://github.com/antfu/bumpp) for version management and [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) for changelog generation.

```bash
# Bump version, generate changelog, commit, tag, and push
pnpm release

# Publish to npm
pnpm release:publish
```

---

## Questions?

If you have any questions or need help, feel free to:

- Open an [issue](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues)
- Start a [discussion](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/discussions)

Thank you for contributing! 🎉
