---
layout: home
title: Vite-Plugin-Mock-Dev-Server

hero:
  name: Mock-Dev-Server
  text: Vite-plugin-mock-dev-server
  tagline: Injects Mock Server into the Vite development environment, intercepts proxied API requests, and returns mock data.
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/introduce
    - theme: alt
      text: Github
      link: https://github.com/pengzhanbo/vite-plugin-mock-dev-server
  image:
    src: /hero.webp
    alt: Mock-Dev-Server

features:
  - title: Lightweight, Flexible, Fast
    icon: ⚡️
    details: Works out of the box, no configuration required after importing the plugin, reads server.proxy configuration for request interception.
  - title: Multiple File Format Support
    icon: 📦
    details: Supports JavaScript/Typescript/JSON/JSON5 files, supports CJS/ESM module types.
  - title: Non-intrusive to Client Code
    icon: 💡
    details: Intercepts requests and returns response data in the node http server, without injecting any code into the source code.
  - title: Auto Import & Hot Reload
    icon: 🔥
    details: Automatically imports mock files and monitors files and their dependencies for hot reload.
  - title: Path Rule Matching
    icon: 🦾
    details: Uses <b>path-to-regexp</b> to match request paths and supports parameter matching.
  - title: Enable/Disable Any Mock Config
    icon: ⚙️
    details: Supports enabling/disabling any single or multiple mock configurations individually without restarting the service.
  - title: Independently Deployable Mock Service
    icon: 🗂
    details: Supports building a standalone deployable mock service.
---
