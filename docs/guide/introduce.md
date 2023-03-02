
# 介绍

`vite-plugin-mock-dev-server` 专注于在 `Vite` 开发环境下 提供 Mock 服务。
通过 vite 内置的 `http` 和 `http-proxy` 服务，以 `middleware` 的方式，对 `server.proxy` 配置的代理路径
进行二次拦截，命中规则后，返回配置的 `mock data` 。

你可以使用在 mock配置文件中使用`node` 任意第三方模块。 这表示，你可以使用如 `mockjs` 等库帮助生成 `mock data`。

## 特性

- ⚡️ 轻量，灵活，快速
- 🧲 非注入式，对客户端代码无侵入
- 💡 ESModule/commonjs
- 🦾 Typescript
- 🏷 支持 json / json5 编写 mock 数据
- 📦 自动加载 mock 文件
- 🎨 可选择你喜欢的任意用于生成mock数据库，如 `mockjs`，或者不使用其他库
- 📥 路径规则匹配，请求参数匹配
- ⚙️ 随意开启或关闭对某个接口的 mock配置
- 🔥 热更新
- ⚖️ 使用 `server.proxy` 配置
- 🍕 支持在 mock文件中使用 `viteConfig.define`配置字段
- 📤 支持 multipart 类型，模拟文件上传
- 🌈 支持 `vite preview` 模式
- 🗂 支持构建可独立部署的小型mock服务

