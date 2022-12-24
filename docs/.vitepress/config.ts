import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Mock-Dev-Server',
  description:
    'Mock-dev-server is injected into the Vite development environment to simulate API request and response data.',
  lastUpdated: true,
  cleanUrls: 'with-subfolders',
  head: [['meta', { name: 'theme-color', content: '#FF9900' }]],
  markdown: {
    theme: 'material-palenight',
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
      message: 'Released under the GPL-3.0 License.',
      copyright: 'Copyright © 2022-present pengzhanbo',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    nav: [
      { text: '使用指南', link: '/guide/introduce', activeMatch: '/guide/' },
      { text: '使用示例', link: '/examples/easy', activeMatch: '/example/' },
      { text: `version ${version}`, link: '/', activeMatch: '!' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '快速开始',
          collapsible: true,
          items: [
            { text: '介绍', link: '/guide/introduce' },
            { text: '安装', link: '/guide/install' },
            { text: '使用', link: '/guide/usage' },
          ],
        },
        {
          text: 'API',
          collapsed: true,
          items: [
            { text: 'mockDevServerPlugin', link: '/guide/mock-plugin' },
            { text: 'defineMock', link: '/guide/define-mock' },
          ],
        },
        {
          text: '配置',
          collapsible: true,
          items: [
            { text: 'pluginConfig', link: '/guide/plugin-config' },
            { text: 'mockConfig', link: '/guide/mock-config' },
          ],
        },
        {
          text: '实践建议',
          collapsible: true,
          items: [
            { text: '目录文件管理', link: '/guide/file-management' },
            { text: '不建议的文件管理', link: '/guide/no-recommend' },
            { text: '共享内容', link: '/guide/shared' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '类型格式',
          collapsible: true,
          items: [
            { text: 'Commonjs', link: '/examples/cjs' },
            { text: 'ESModule', link: '/examples/esm' },
            { text: 'JSON/JSON5', link: '/examples/json' },
          ],
        },
        {
          text: '基础示例',
          collapsible: true,
          items: [
            { text: '简单例子', link: '/examples/easy' },
            { text: '自定义响应体', link: '/examples/body' },
            { text: '自定义响应头', link: '/examples/header' },
            { text: '自定义状态码', link: '/examples/status' },
            { text: '自定义请求方法', link: '/examples/method' },
            { text: '延迟响应', link: '/examples/delay' },
            { text: '开启/关闭Mock', link: '/examples/enable' },
          ],
        },
        {
          text: '进阶示例',
          collapsible: true,
          items: [
            { text: '使用mockjs库', link: '/examples/mockjs' },
            { text: '相同URL返回不同响应内容', link: '/examples/validator' },
          ],
        },
      ],
    },
  },
})
