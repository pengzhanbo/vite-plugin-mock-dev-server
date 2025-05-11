import type { DefaultTheme, UserConfig } from 'vitepress'
import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

const vitepressConfig: UserConfig<DefaultTheme.Config> = defineConfig({
  lang: 'zh-CN',
  title: 'Mock-Dev-Server',
  description: 'Mock-dev-server is injected into the Vite development environment to simulate API request and response data.',
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    headers: { level: [2, 3] },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg', href: '/logo.svg' }],
  ],
  sitemap: {
    hostname: 'https://vite-plugin-mock-dev-server.netlify.app',
  },
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server',
      },
    ],
    search: { provider: 'local' },
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        editLink: {
          pattern: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/edit/main/docs/:path',
          text: '在Github编辑此页',
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2022-present pengzhanbo',
        },
        docFooter: {
          prev: '上一页',
          next: '下一页',
        },
        nav: [
          {
            text: '使用指南',
            link: '/guide/introduce',
            activeMatch: '/guide/',
          },
          {
            text: '使用示例',
            link: '/examples/basic',
            activeMatch: '/examples/',
          },
          { text: `version ${version}`, link: '/', activeMatch: '!' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: '快速开始',
              items: [
                { text: '介绍', link: '/guide/introduce' },
                { text: '安装', link: '/guide/install' },
                { text: '使用', link: '/guide/usage' },
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'mockDevServerPlugin', link: '/guide/mock-plugin' },
                { text: 'defineMock', link: '/guide/define-mock' },
                { text: 'createDefineMock', link: '/guide/create-define-mock' },
                { text: 'defineMockData', link: '/guide/define-mock-data' },
                { text: 'createSSEStream', link: '/guide/create-sse-stream' },
              ],
            },
            {
              text: '配置',
              items: [
                { text: 'pluginConfig', link: '/guide/plugin-config' },
                { text: 'mockConfig', link: '/guide/mock-config' },
              ],
            },
            {
              text: '实践建议',
              items: [
                { text: '目录文件管理', link: '/guide/file-management' },
                { text: '共享内容', link: '/guide/shared' },
                { text: '共享可变数据', link: '/guide/shared-data' },
                { text: '文件上传', link: '/guide/upload' },
                { text: '团队协作', link: '/guide/teamwork' },
                { text: 'mock服务部署', link: '/guide/mock-service' },
              ],
            },
          ],
          '/examples/': [
            { text: '基础示例', link: '/examples/basic' },
            { text: '类型格式', link: '/examples/format-extension' },
            { text: '自定义响应头', link: '/examples/header' },
            { text: 'cookies', link: '/examples/cookies' },
            { text: '自定义响应体', link: '/examples/body' },
            { text: '自定义响应内容', link: '/examples/response' },
            { text: '文件上传/下载', link: '/examples/file' },
            { text: '静态资源服务', link: '/examples/static' },
            { text: '请求验证器', link: '/examples/validator' },
            { text: '使用mockjs库', link: '/examples/mockjs' },
            { text: '使用faker-js库', link: '/examples/faker' },
            { text: 'Graphql', link: '/examples/graphql' },
            { text: 'Websocket', link: '/examples/websocket' },
            { text: 'EventSource', link: '/examples/event-source' },
          ],
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        editLink: {
          pattern: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/edit/main/docs/:path',
          text: 'Edit this page on Github',
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2022-present pengzhanbo',
        },
        docFooter: {
          prev: 'Prev Page',
          next: 'Next Page',
        },
        nav: [
          {
            text: 'Guide',
            link: '/en/guide/introduce',
            activeMatch: '/en/guide/',
          },
          {
            text: 'Examples',
            link: '/en/examples/basic',
            activeMatch: '/en/examples/',
          },
          { text: `version ${version}`, link: '/en/', activeMatch: '!' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Quick Start',
              items: [
                { text: 'Introduce', link: '/en/guide/introduce' },
                { text: 'Install', link: '/en/guide/install' },
                { text: 'Usage', link: '/en/guide/usage' },
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'mockDevServerPlugin', link: '/en/guide/mock-plugin' },
                { text: 'defineMock', link: '/en/guide/define-mock' },
                { text: 'createDefineMock', link: '/en/guide/create-define-mock' },
                { text: 'defineMockData', link: '/en/guide/define-mock-data' },
                { text: 'createSSEStream', link: '/en/guide/create-sse-stream' },
              ],
            },
            {
              text: 'Configuration',
              items: [
                { text: 'pluginConfig', link: '/en/guide/plugin-config' },
                { text: 'mockConfig', link: '/en/guide/mock-config' },
              ],
            },
            {
              text: 'Practical suggestion',
              items: [
                {
                  text: 'Directory file management',
                  link: '/en/guide/file-management',
                },
                { text: 'Share Content', link: '/en/guide/shared' },
                { text: 'Shared', link: '/en/guide/shared-data' },
                { text: 'File Upload', link: '/en/guide/upload' },
                { text: 'Teamwork', link: '/en/guide/teamwork' },
                {
                  text: 'Mock Service Deployment',
                  link: '/en/guide/mock-service',
                },
              ],
            },
          ],
          '/en/examples/': [
            { text: 'Basic example', link: '/en/examples/basic' },
            { text: 'Format extension', link: '/en/examples/format-extension' },
            { text: 'Custom header', link: '/en/examples/header' },
            { text: 'cookies', link: '/en/examples/cookies' },
            { text: 'Custom body', link: '/en/examples/body' },
            { text: 'Custom response', link: '/en/examples/response' },
            { text: 'File upload/download', link: '/en/examples/file' },
            { text: 'Static resources', link: '/en/examples/static' },
            { text: 'Request validator', link: '/en/examples/validator' },
            { text: 'Use mockjs', link: '/en/examples/mockjs' },
            { text: 'Use faker-js', link: '/en/examples/faker' },
            { text: 'Graphql', link: '/en/examples/graphql' },
            { text: 'Websocket', link: '/en/examples/websocket' },
            { text: 'EventSource', link: '/en/examples/event-source' },
          ],
        },
      },
    },
  },
})
export default vitepressConfig
