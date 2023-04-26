import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Mock-Dev-Server',
  description:
    'Mock-dev-server is injected into the Vite development environment to simulate API request and response data.',
  lastUpdated: true,
  cleanUrls: true,
  head: [['meta', { name: 'theme-color', content: '#FF9900' }]],
  markdown: {
    theme: 'material-theme-palenight',
    headers: {
      level: [0, 0],
    },
    lineNumbers: true,
  },
  themeConfig: {
    editLink: {
      pattern:
        'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/edit/main/docs/:path',
      text: '在Github编辑此页',
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present pengzhanbo',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    nav: [
      { text: '使用指南', link: '/guide/introduce', activeMatch: '/guide/' },
      { text: '使用示例', link: '/examples/basic', activeMatch: '/example/' },
      {
        text: 'playground',
        link: 'https://stackblitz.com/github/pengzhanbo/vite-plugin-mock-dev-server/tree/main/playground',
        activeMatch: '!',
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
            { text: '不建议的文件管理', link: '/guide/no-recommend' },
            { text: '共享内容', link: '/guide/shared' },
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
        { text: '请求验证器', link: '/examples/validator' },
        { text: '使用mockjs库', link: '/examples/mockjs' },
      ],
    },
  },
})
