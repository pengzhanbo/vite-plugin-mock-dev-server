---
layout: home
title: Vite-Plugin-Mock-Dev-Server

hero:
  name: Mock-Dev-Server
  text: Vite-plugin-mock-dev-server
  tagline: 在 Vite 开发环境中注入 Mock Server，拦截代理 API 请求，并返回 mock 数据。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/introduce
    - theme: alt
      text: Github
      link: https://github.com/pengzhanbo/vite-plugin-mock-dev-server
  image:
    src: /hero.webp
    alt: Mock-Dev-Server

features:
  - title: 服务端请求拦截
    icon: ⚡️
    details: 基于 Vite 开发服务器中间件机制，在服务端拦截 HTTP 请求并返回 Mock 响应，对客户端代码完全零侵入，无需修改任何业务代码即可接入。
  - title: 多格式与模块支持
    icon: 📦
    details: 原生支持 TypeScript、JavaScript、JSON、JSON5 等多种文件格式，兼容 ESM 与 CommonJS 模块规范，自动识别项目配置并选择合适的编译器（Rolldown/esbuild）。
  - title: 智能热更新机制
    icon: 🔥
    details: 基于 chokidar 实现文件监听与依赖追踪，修改 Mock 文件后即时生效；支持数据热更新（默认）与页面重载两种模式，WebSocket 连接在热更新时自动保持。
  - title: 灵活的路径匹配
    icon: 🦾
    details: 采用 path-to-regexp 实现 Express/Koa 风格的路径匹配，支持命名参数、可选参数、通配符及正则表达式；内置智能优先级算法，自动解决规则冲突。
  - title: WebSocket 实时通信
    icon: 🔌
    details: 支持 WebSocket 协议 Mock，可模拟聊天应用、实时通知等场景；独立 WebSocket 服务器实现避免与 Vite 代理冲突，提供生命周期管理钩子与热更新支持。
  - title: Server-Sent Events
    icon: 📡
    details: 提供 createSSEStream 工具函数，支持 Server-Sent Events 协议模拟；自动配置 SSE 响应头与流式传输优化，轻松实现服务器推送场景（股票行情、日志流等）。
  - title: 请求录制与回放
    icon: 📝
    details: 自动录制真实 API 响应并持久化存储，支持按路径、状态码、过期时间等多维度过滤；后续请求优先匹配录制数据，实现"一次录制，多次复用"，解决后端不稳定或未就绪问题。
  - title: 独立服务构建
    icon: 🗂
    details: 支持将 Mock 配置构建为独立部署的 Node.js 服务，输出包含编译后的数据、服务入口及依赖配置；可用于团队共享、CI/CD 集成或作为纯后端服务部署。
  - title: 请求验证与动态响应
    icon: ⚙️
    details: 支持基于请求参数（query、body、headers）的验证器配置，实现同一接口根据不同参数返回不同数据；支持响应延迟、错误概率模拟，还原真实网络环境。
  - title: Cookie 与会话管理
    icon: 🍪
    details: 基于 cookies 库提供完整的 Cookie 读写支持，支持 Cookie 签名验证；Mock 配置中可直接设置响应 Cookie，轻松模拟登录态与会话管理场景。
  - title: 文件上传与下载
    icon: 📤
    details: 集成 formidable 实现 multipart/form-data 解析，支持文件上传场景；支持 Buffer、Stream 等多种响应格式，可模拟文件下载与流式数据传输。
  - title: 跨文件数据共享
    icon: 🔗
    details: 提供 defineMockData 实现跨 Mock 文件的数据共享，基于内存缓存维护全局状态；支持 CRUD 操作的数据持久化，热更新时智能合并避免数据不一致。
  - title: 完整的 TypeScript 支持
    icon: 📘
    details: 全量类型定义覆盖所有配置项与 API，提供 defineMock 类型辅助函数与 createDefineMock 自定义转换器；Mock 请求对象扩展 query、params、body 等类型，享受 IDE 智能提示。
  - title: 与 Vite 生态深度集成
    icon: 🌈
    details: 自动继承 Vite 的 define、resolve.alias 配置用于 Mock 文件编译；支持 vite preview 模式，与 server.proxy 配置共存；默认启用 CORS 并支持自定义跨域配置。
---
