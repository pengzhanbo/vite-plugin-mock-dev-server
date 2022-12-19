import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Mock-Dev-Server',
  description:
    'Mock-dev-server is injected into the Vite development environment to simulate API request and response data.',
  lastUpdated: true,
  cleanUrls: 'with-subfolders',
  head: [['meta', { name: 'theme-color', content: '#3c8772' }]],
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
      { text: `version ${version}`, link: '/' },
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
          items: [{ text: '目录文件管理', link: '/guide/file-management' }],
        },
      ],
      '/examples/': [
        {
          text: '使用示例',
          collapsible: true,
          items: [
            { text: 'Commonjs', link: '/examples/cjs' },
            { text: 'ESModule', link: '/examples/esm' },
            { text: 'JSON/JSON5', link: '/examples/json' },
            { text: '简单例子', link: '/examples/easy' },
            { text: '自定义响应体', link: '/examples/body' },
            { text: '延迟响应', link: '/examples/delay' },
          ],
        },
      ],
    },
  },
})
