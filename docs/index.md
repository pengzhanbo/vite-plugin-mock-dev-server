---
layout: home
title: Vite-Plugin-Mock-Dev-Server

hero:
  name: Mock-Dev-Server
  text: Vite-plugin-mock-dev-server
  tagline: 在Vite开发环境中注入Mock-Server，拦截代理API请求，并返回 mock 数据。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/introduce
    - theme: alt
      text: Github
      link: https://github.com/pengzhanbo/vite-plugin-mock-dev-server

features:
  - title: 轻量，灵活，快速
    icon: ⚡️
    details: 开箱即用，引入插件后无需配置即可使用，读取 server.proxy 配置进行请求拦截。
  - title: 支持多种文件格式
    icon: 📦
    details: 支持 JavaScript/Typescript/JSON/JSON5文件，支持使用 CJS/ESM 模块类型。
  - title: 对客户端代码无侵入
    icon: 💡
    details: 在node http server 中拦截请求和返回响应数据，不注入任何代码到源码中。
  - title: 自动导入 & 热更新
    icon: 🔥
    details: 自动导入mock文件，并监听文件及其依赖，实现热更新。
  - title: 路径规则匹配
    icon: 🦾
    details: 使用 `path-to-regexp` 匹配请求路径，并支持参数匹配。
  - title: 开启/关闭任意mock配置
    icon: ⚙️
    details: 支持对任意一个或多个mock配置进行单独的开启/关闭，无需重启服务。
---
