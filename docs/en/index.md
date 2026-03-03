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
  - title: Server-Side Request Interception
    icon: ⚡️
    details: Based on Vite dev server middleware mechanism, intercepts HTTP requests at the server side and returns mock responses. Completely zero-intrusive to client code, enabling integration without modifying any business code.
  - title: Multi-Format & Module Support
    icon: 📦
    details: Native support for TypeScript, JavaScript, JSON, JSON5 and other file formats, compatible with both ESM and CommonJS module specifications. Automatically detects project configuration and selects the appropriate compiler (Rolldown/esbuild).
  - title: Intelligent Hot Reload
    icon: 🔥
    details: Based on chokidar for file watching and dependency tracking, changes to mock files take effect immediately. Supports both data hot reload (default) and page reload modes, with WebSocket connections automatically maintained during hot updates.
  - title: Flexible Path Matching
    icon: 🦾
    details: Uses path-to-regexp for Express/Koa-style path matching, supporting named parameters, optional parameters, wildcards, and regular expressions. Built-in intelligent priority algorithm automatically resolves rule conflicts.
  - title: WebSocket Real-Time Communication
    icon: 🔌
    details: Supports WebSocket protocol mocking for scenarios like chat applications and real-time notifications. Independent WebSocket server implementation avoids conflicts with Vite proxy, providing lifecycle management hooks and hot reload support.
  - title: Server-Sent Events
    icon: 📡
    details: Provides createSSEStream utility function for Server-Sent Events protocol simulation. Automatically configures SSE response headers and stream transmission optimization, easily implementing server push scenarios (stock quotes, log streams, etc.).
  - title: Request Record & Replay
    icon: 📝
    details: Automatically records real API responses with persistent storage, supporting multi-dimensional filtering by path, status code, and expiration time. Subsequent requests prioritize matching recorded data, achieving "record once, reuse multiple times" to solve backend instability or unavailability issues.
  - title: Standalone Service Build
    icon: 🗂
    details: Supports building mock configurations into independently deployable Node.js services, with output including compiled data, service entry points, and dependency configurations. Can be used for team sharing, CI/CD integration, or deployment as a pure backend service.
  - title: Request Validation & Dynamic Response
    icon: ⚙️
    details: Supports validator configuration based on request parameters (query, body, headers), enabling the same interface to return different data based on different parameters. Supports response delay and error probability simulation to replicate real network environments.
  - title: Cookie & Session Management
    icon: 🍪
    details: Based on the cookies library, provides complete cookie read/write support with cookie signature verification. Response cookies can be directly set in mock configurations, easily simulating login state and session management scenarios.
  - title: File Upload & Download
    icon: 📤
    details: Integrates formidable for multipart/form-data parsing, supporting file upload scenarios. Supports multiple response formats including Buffer and Stream, enabling simulation of file downloads and stream data transmission.
  - title: Cross-File Data Sharing
    icon: 🔗
    details: Provides defineMockData for cross-mock-file data sharing, maintaining global state based on in-memory caching. Supports data persistence for CRUD operations, with intelligent merging during hot reload to avoid data inconsistency.
  - title: Complete TypeScript Support
    icon: 📘
    details: Full type definitions covering all configuration items and APIs, providing defineMock type helper functions and createDefineMock custom transformers. Mock request objects are extended with query, params, body types for IDE intelligent suggestions.
  - title: Deep Vite Ecosystem Integration
    icon: 🌈
    details: Automatically inherits Vite's define and resolve.alias configurations for mock file compilation. Supports vite preview mode, coexists with server.proxy configuration. CORS enabled by default with support for custom cross-origin configuration.
---
