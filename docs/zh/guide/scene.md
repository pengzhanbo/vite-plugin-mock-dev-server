# 场景模拟

## 功能概述

场景模拟允许你为同一 API 端点定义多组 mock 响应，并通过场景配置在不同响应间切换。当你需要在不同开发上下文中使用不同的 mock 行为时（如测试、调试或演示环境），这个功能就很有用。

### 核心价值

- **上下文切换**: 无需修改 mock 文件即可在不同 mock 数据集之间切换
- **按请求覆盖**: 使用 `X-Mock-Scene` 请求头按请求动态切换场景
- **非侵入性**: 未配置 `scene` 的 mock 保持通用，始终生效
- **优先级感知**: 带场景的 mock 比通用 mock 具有更高的匹配优先级

## 插件配置

首先，通过插件配置中的 `activeScene` 选项定义激活的场景：

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      activeScene: 'dev', // 仅激活 scene 为 'dev' 的 mock
    }),
  ],
})
```

你也可以配置多个激活场景：

```ts
mockDevServerPlugin({
  activeScene: ['dev', 'test'],
})
```

## Mock 配置

为 mock 配置添加 `scene` 标识。未配置 `scene` 的 mock 为通用 mock，始终生效。

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // 通用 mock — 始终生效
  {
    url: '/api/user',
    body: { name: '默认用户' },
  },
  // 仅在场景 'admin' 匹配时生效
  {
    url: '/api/user',
    scene: 'admin',
    body: { name: '管理员', role: 'admin' },
  },
  // 仅在场景 'demo' 匹配时生效
  {
    url: '/api/user',
    scene: 'demo',
    body: { name: '演示用户', role: 'guest' },
  },
])
```

## 按请求覆盖场景

可以通过 `X-Mock-Scene` HTTP 请求头按请求覆盖场景。这会优先于插件的 `activeScene` 配置。

```ts
// 为此请求激活 'admin' 场景
fetch('/api/user', {
  headers: { 'X-Mock-Scene': 'admin' }
})

// 激活多个场景
fetch('/api/user', {
  headers: { 'X-Mock-Scene': 'admin,demo' }
})
```

## 匹配规则

1. **未配置 `scene`** 的 mock 为通用 mock，不受场景限制，始终参与匹配。
2. **配置了 `scene`** 的 mock，只有当其 scene 中任意一项与激活场景中任意一项匹配时才参与匹配。
3. 如果**未配置 `activeScene`** 且没有 `X-Mock-Scene` 请求头，带 scene 的 mock **不会匹配**。
4. `X-Mock-Scene` 请求头**覆盖**插件的 `activeScene` 配置，仅对该请求生效。
5. 带 scene 的 mock 比通用 mock 具有**更高的匹配优先级**。

## 使用场景

### 场景1：多环境开发

在空数据、分页数据、错误状态等不同后端状态间切换，无需修改 mock 文件。

### 场景2：演示模式

创建专用的演示场景，返回精心设计的数据，通过配置 `activeScene: 'demo'` 快速切换。

### 场景3：自动化测试

在测试请求中使用 `X-Mock-Scene` 请求头验证不同的 API 响应场景，无需修改全局配置。
