# 场景模拟

场景模拟允许你为同一 URL 定义多个 mock 响应，并通过场景配置在不同响应间切换，无需修改 mock 文件。

## 基础用法

为同一接口定义不同场景的 mock。未配置 `scene` 的 mock 为通用 mock，始终生效。

<<< @/../example/mock/scene.mock.ts

## 插件配置

在 `vite.config.ts` 中配置激活的场景：

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      activeScene: 'test', // 激活 'test' 场景
    }),
  ],
})
```

当 `activeScene` 设置为 `'test'` 时：
- `GET /api/scene` 无匹配场景 → 返回 `{ scene: 'default scene' }`（通用 mock，无 scene 限制）
- `GET /api/scene` 场景 `'test'` 匹配 → 返回 `{ scene: 'test scene' }`（scene 匹配）

当未配置 `activeScene`（或为空）时：
- `GET /api/scene` → 返回 `{ scene: 'default scene' }`（仅通用 mock 匹配）

## 按请求覆盖

使用 `X-Mock-Scene` 请求头按请求动态切换场景：

```ts
// 为本次请求激活 'test' 场景
fetch('/api/scene', {
  headers: { 'X-Mock-Scene': 'test' }
})
// 响应: { scene: 'test scene' }
```

`X-Mock-Scene` 请求头支持多个逗号分隔的场景：

```ts
fetch('/api/scene', {
  headers: { 'X-Mock-Scene': 'test,dev' }
})
```
