# 贡献指南

感谢您有兴趣为 `vite-plugin-mock-dev-server` 做出贡献！本文档提供了帮助您入门的指南和说明。

[English](./CONTRIBUTING.md) | 简体中文

## 目录

- [行为准则](#行为准则)
- [开始之前](#开始之前)
  - [环境要求](#环境要求)
  - [仓库设置](#仓库设置)
- [开发工作流](#开发工作流)
  - [项目结构](#项目结构)
  - [开发命令](#开发命令)
  - [运行测试](#运行测试)
  - [调试](#调试)
- [编码规范](#编码规范)
  - [代码风格](#代码风格)
  - [TypeScript 规范](#typescript-规范)
  - [JSDoc 文档规范](#jsdoc-文档规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [发布流程](#发布流程)

## 行为准则

本项目遵守 [贡献者公约行为准则](./CODE_OF_CONDUCT.md)。参与本项目即表示您同意遵守此准则。

## 开始之前

### 环境要求

- **Node.js**：`^20.19.0 || >=22`（CI 使用 Node 24）
- **pnpm**：`12.x` —— 仓库通过 `packageManager` 固定为 `pnpm@12.15.0`。建议执行 `corepack enable`（或 `corepack use pnpm@12`），以使用固定版本而不是全局安装的 pnpm
- **Git**：用于版本控制

### 仓库设置

1. **Fork 仓库**

   点击 GitHub 仓库页面的 "Fork" 按钮，创建您自己的 Fork。

2. **克隆您的 Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/vite-plugin-mock-dev-server.git
   cd vite-plugin-mock-dev-server
   ```

3. **安装依赖**

   ```bash
   pnpm install
   ```

4. **验证设置**

   ```bash
   # 先构建一次：类型感知检查与示例应用都通过 `dist` 解析本包
   pnpm build

   # 类型感知的代码检查 + 格式检查
   pnpm lint

   # 单次运行测试（`pnpm test` 默认为监视模式）
   pnpm test:run
   ```

## 开发工作流

### 项目结构

这是一个使用 pnpm 工作区管理的 monorepo 项目：

```txt
vite-plugin-mock-dev-server/
├── vite-plugin-mock-dev-server/    # 核心插件包（唯一发布产物）
│   ├── src/                        # 源代码
│   │   ├── build/                  # 独立 mock 服务生成
│   │   ├── compiler/               # mock 文件打包、加载与监听
│   │   ├── core/                   # 插件生命周期、选项、define、日志
│   │   ├── helpers/                # 公共 helper（defineMock、defineMockData、createSSEStream）
│   │   ├── mockHttp/               # HTTP mock 管线（匹配、请求/响应处理）
│   │   ├── mockWebsocket/          # WebSocket mock 服务
│   │   ├── recorder/               # 请求录制与回放
│   │   ├── types/                  # 公共 TypeScript 类型
│   │   ├── utils/                  # 共享工具
│   │   ├── index.ts                # 公共入口
│   │   └── server.ts               # 独立服务入口
│   ├── __tests__/                  # Vitest 测试（包含 `e2e/`）
│   ├── tsdown.config.ts            # 包构建配置
│   └── package.json
├── docs/                           # VitePress 站点（`en/` 英文，`zh/` 中文）
├── example/                        # 演示插件能力的 Vite 应用（`mock/`）
├── .github/workflows/              # lint / test / release CI
├── oxlint.config.ts                # 类型感知的 lint 配置
├── oxfmt.config.ts                 # 格式化配置
├── vitest.config.ts                # 测试运行配置
├── tsconfig.json                   # 共享 TypeScript 配置
├── pnpm-workspace.yaml             # 工作区 + 依赖 catalog
└── package.json                    # 根脚本与开发依赖
```

第三方依赖都通过 `pnpm-workspace.yaml` 中的 pnpm catalog 声明。在 package.json 中使用 `catalog:dev` / `catalog:prod` 引用，不要硬编码版本号；工作区内的包通过 `workspace:*` 关联。

### 开发命令

```bash
# 安装依赖
pnpm install

# 使用 tsdown 构建插件
pnpm build

# 以 `vite dev` 启动示例应用
pnpm dev

# 构建示例应用
pnpm example:build

# 运行示例的端到端测试
pnpm example:test

# 文档站点（VitePress）
pnpm docs:dev
pnpm docs:build
pnpm docs:preview

# 代码检查：类型感知 oxlint + oxfmt 检查
pnpm lint

# 自动修复 lint 问题并格式化整个仓库
pnpm format

# 测试（默认为监视模式）
pnpm test

# CI 风格的单次测试
pnpm test:run
```

克隆仓库后请至少执行一次 `pnpm build`；修改插件源码后也需要重新构建：示例应用（包括运行它的端到端测试）以及类型感知检查都通过 `dist` 产物解析 `vite-plugin-mock-dev-server`。

文档站点包含两种语言：`docs/en/`（英文）与 `docs/zh/`（中文），修改文档时请保持同步。`example/mock/` 是 mock 文件示例的权威集合，当导出的 mock 结构发生变化时请一并更新。

### 运行测试

本项目使用 [Vitest](https://vitest.dev/) 进行测试。测试文件位于 `vite-plugin-mock-dev-server/__tests__/`（端到端测试在 `__tests__/e2e/`）；`vitest.config.ts` 仅匹配 `vite-plugin-mock-dev-server/__tests__/**/*.spec.ts`，使用 Node 环境，超时时间为 20 秒，且未配置覆盖率提供器。

```bash
# 监视模式（开发时很有用）
pnpm test

# 单次运行全部测试
pnpm test:run

# 运行特定测试文件
pnpm test:run vite-plugin-mock-dev-server/__tests__/compiler.spec.ts

# 按测试名称过滤
pnpm test:run -t "matching weight"

# 仅运行示例的端到端测试
pnpm example:test
```

每次向 `main` 推送或提交 Pull Request 时，CI 都会在 Node 24 上执行 `pnpm vitest run --retry=1`。

### 调试

要在开发期间调试插件：

1. **使用示例项目**

   `example/` 目录包含一个使用插件的测试项目：

   ```bash
   pnpm dev
   ```

   这将启动加载了插件的示例 Vite 项目。

2. **添加调试日志**

   插件内部使用 [`obug`](https://github.com/unjs/obug)，命名空间为 `vite:mock`：

   ```bash
   DEBUG=vite:mock pnpm dev
   ```

   常规插件日志由插件的 [`log`](./README.zh-CN.md#log) 配置控制（默认 `'info'`）。如果不希望开启 `DEBUG`，可将 `log` 设为 `'debug'` 查看请求级日志。

3. **VS Code 调试**

   创建 `.vscode/launch.json` 文件：

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

## 编码规范

### 代码风格

本项目使用 [oxlint](https://oxc.rs/docs/guide/usage/linter.html)（类型感知）与 [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) 进行代码检查和格式化，配置来自 `@pengzhanbo/oxc-config`。项目有意不使用 ESLint、Prettier、Jest 和 Mocha，请不要引入它们。

```bash
# 检查 lint 与格式（CI 执行的内容）
pnpm lint

# 自动修复 lint 问题并格式化仓库
pnpm format
```

请不要手动格式化代码或手动调整 import 顺序：`.vscode/settings.json` 已将 `oxc.oxc-vscode` 配置为默认格式化器并开启保存时格式化；`source.organizeImports` 被关闭，因为 import 排序由 oxfmt 负责。

主要约定：

- 仅使用 ESM（`"type": "module"`）；TypeScript 源码中的相对导入必须带 `.js` 后缀
- 字符串使用单引号，不使用分号，2 个空格缩进，LF 换行，尾随逗号
- 每个 `src/` 子目录都有 `index.ts` 汇总导出；`src/index.ts` 是公共入口
- 文件名和函数使用 camelCase，类文件使用 PascalCase（如 `Recorder.ts`）

### TypeScript 规范

- **启用严格模式**，同时开启 `noUnusedLocals`
- **`isolatedDeclarations: true`**：每个导出符号都需要显式类型注解，包括导出的常量和推导出的返回类型
- **优先使用 `unknown` 而不是 `any`**，并通过类型守卫收窄；catch 变量是例外 —— `useUnknownInCatchVariables` 已关闭，因此 `catch (error)` 的类型为 `any`
- 公共选项/数据类型放在 `src/types/`，内部辅助代码留在对应功能目录

### JSDoc 文档规范

所有公共 API 必须包含中英双语的 JSDoc 注释，格式如下（`oxlint` 已配置优先使用 `@type` 而不是 `@typedef`）：

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

示例：

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

## 提交规范

我们遵循 [Angular 提交规范](./.github/commit-convention.md)。每个提交消息应遵循以下格式：

```txt
<type>(<scope>): <subject>
```

类型：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更改
- `style`: 代码风格更改（格式化、分号等）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 添加或更新测试
- `build`: 构建系统更改
- `ci`: CI/CD 更改
- `chore`: 其他更改
- `revert`: 回滚之前的提交

在 type 或 scope 后添加 `!` 表示破坏性变更，subject 请控制在 50 个字符以内。

示例：

```txt
feat(compiler): add support for json5 files
fix(http): resolve cookie parsing issue
perf(build)!: remove 'foo' option
revert: feat(compiler): add 'comments' option
docs: update API documentation
```

## Pull Request 流程

1. **创建分支**

   ```bash
   git checkout -b feat/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

2. **进行更改**

   - 编写清晰、简洁的代码
   - 为新功能和缺陷修复添加测试
   - 保持中英文文档同步；当 mock 文件结构发生变化时更新 `example/mock/`
   - 在本地执行 `pnpm build`、`pnpm lint` 和 `pnpm test:run`

3. **提交更改**

   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

4. **推送到您的 Fork**

   ```bash
   git push origin feat/your-feature-name
   ```

5. **创建 Pull Request**

   - 前往 GitHub 上的原始仓库
   - 点击 "New Pull Request"
   - 选择您的 Fork 和分支
   - 清晰描述更改内容，并附上相关 issue 编号；涉及 UI 的改动请提供截图

   针对 `main` 的每个 Pull Request 都会触发 `Lint` 与 `Test` 工作流（Node 24），二者都需通过后才能合并。

6. **PR 审核**

   - 维护者将审核您的 PR
   - 处理任何请求的更改
   - 审核通过后，您的 PR 将被合并

## 发布流程

> **注意**：只有维护者可以执行发布。

项目使用 [bumpp](https://github.com/antfu/bumpp) 进行版本管理，使用 [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) 生成变更日志。

```bash
# 升级版本（根目录、插件、docs、example），生成 CHANGELOG.md，
# 提交、创建 `v*` 标签并推送
pnpm release

# 仅重新生成 CHANGELOG.md
pnpm release:changelog

# 发布工作区包（通常由 CI 执行，而非本地）
pnpm release:publish
```

发布是自动化的：推送 `v*` 标签会触发 `.github/workflows/release.yaml`，它会重新运行测试工作流、构建插件、以 npm provenance 发布，并生成 GitHub Release 说明。`pnpm release:publish` 对应 `pnpm -r publish`，仅在需要人工补救时使用。

---

## 有问题？

如果您有任何问题或需要帮助，请随时：

- 提交 [issue](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues)
- 发起 [discussion](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/discussions)

感谢您的贡献！🎉
