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

- **Node.js**: 版本 `^20 || >=22`
- **pnpm**: 版本 `>=10.30.1`（本项目使用 pnpm 工作区）
- **Git**: 用于版本控制

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
   # 运行代码检查
   pnpm lint

   # 运行测试
   pnpm test
   ```

## 开发工作流

### 项目结构

这是一个使用 pnpm 工作区管理的 monorepo 项目：

```txt
vite-plugin-mock-dev-server/
├── vite-plugin-mock-dev-server/    # 核心插件包
│   ├── src/                        # 源代码
│   │   ├── build/                  # 独立 mock 服务器构建
│   │   ├── compiler/               # Mock 文件编译器（esbuild/rolldown）
│   │   ├── cookies/                # Cookie 处理
│   │   ├── core/                   # 核心插件逻辑
│   │   ├── helpers/                # 辅助函数
│   │   ├── mockHttp/               # HTTP mock 中间件
│   │   ├── mockWebsocket/          # WebSocket mock 支持
│   │   ├── types/                  # TypeScript 类型定义
│   │   └── utils/                  # 工具函数
│   ├── __tests__/                  # 单元测试
│   └── package.json
├── docs/                           # VitePress 文档站点
├── example/                        # 用于测试的示例项目
├── package.json                    # 根 package.json
└── pnpm-workspace.yaml             # pnpm 工作区配置
```

### 开发命令

```bash
# 构建插件
pnpm build

# 使用示例项目启动开发模式
pnpm dev

# 构建示例项目
pnpm example:build

# 以开发模式运行文档站点
pnpm docs:dev

# 构建文档站点
pnpm docs:build

# 运行代码检查
pnpm lint

# 运行测试
pnpm test

# 以监视模式运行测试
pnpm test --watch
```

### 运行测试

本项目使用 [Vitest](https://vitest.dev/) 进行测试。

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test --coverage

# 以监视模式运行测试（开发时很有用）
pnpm test --watch

# 运行特定测试文件
pnpm test src/__tests__/compiler.spec.ts
```

### 调试

要在开发期间调试插件：

1. **使用示例项目**

   `example/` 目录包含一个使用插件的测试项目：

   ```bash
   pnpm dev
   ```

   这将启动加载了插件的示例 Vite 项目。

2. **添加调试日志**

   项目使用 `debug` 包。启用调试日志：

   ```bash
   DEBUG=vite-plugin-mock-dev-server pnpm dev
   ```

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

本项目使用 ESLint 配合 `@pengzhanbo/eslint-config` 进行代码检查。

```bash
# 检查代码风格
pnpm lint

# 自动修复代码风格问题
pnpm lint -- --fix
```

主要风格规则：

- 字符串使用单引号
- 不使用尾随分号
- 2 个空格缩进
- 最大行长度：120 个字符

### TypeScript 规范

- **启用严格模式**：所有代码必须是类型安全的
- **显式返回类型**：公共 API 应该有显式的返回类型注解
- **不使用 `any`**：避免使用 `any` 类型；必要时使用 `unknown` 配合类型守卫

### JSDoc 文档规范

所有公共 API 必须包含 JSDoc 注释，格式如下：

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

示例：

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

示例：

```txt
feat(compiler): add support for json5 files
fix(http): resolve cookie parsing issue
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
   - 为新功能添加测试
   - 如有需要，更新文档
   - 确保所有测试通过

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
   - 填写 PR 模板：
     - 清晰描述更改内容
     - 相关 issue 编号（如果有）

6. **PR 审核**

   - 维护者将审核您的 PR
   - 处理任何请求的更改
   - 审核通过后，您的 PR 将被合并

## 发布流程

> **注意**：只有维护者可以执行发布。

项目使用 [bumpp](https://github.com/antfu/bumpp) 进行版本管理，使用 [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) 生成变更日志。

```bash
# 升级版本、生成变更日志、提交、打标签并推送
pnpm release

# 发布到 npm
pnpm release:publish
```

---

## 有问题？

如果您有任何问题或需要帮助，请随时：

- 提交 [issue](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues)
- 发起 [discussion](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/discussions)

感谢您的贡献！🎉
