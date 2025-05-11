import type { DefaultTheme } from 'vitepress'
import { defineAdditionalConfig } from 'vitepress'
import { version } from '../package.json'

export default defineAdditionalConfig({
  lang: 'zh-CN',
  description: '在vite 开发环境中注入 mock-dev-server, 模拟请求和数据响应。',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/zh/guide/': { base: '/zh/guide/', items: sidebarGuide() },
      '/zh/examples/': { base: '/zh/examples/', items: sidebarExamples() },
    },

    search: {
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '键入',
              navigateText: '导航',
              navigateUpKeyAriaLabel: '向上',
              navigateDownKeyAriaLabel: '向下',
              closeText: '关闭',
              closeKeyAriaLabel: '退出',
            },
          },
        },
      } as DefaultTheme.LocalSearchOptions,
    },

    editLink: {
      pattern: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/edit/main/docs/:path',
      text: '在Github编辑此页',
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: `版权所有 © 2022-${new Date().getFullYear()} pengzhanbo`,
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    notFound: {
      title: '页面未找到',
      quote:
        '但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。',
      linkLabel: '前往首页',
      linkText: '带我回首页',
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容',
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '使用指南',
      link: '/zh/guide/introduce',
      activeMatch: '/zh/guide/',
    },
    {
      text: '使用示例',
      link: '/zh/examples/basic',
      activeMatch: '/zh/examples/',
    },
    {
      text: `v${version}`,
      items: [
        { text: '更新日志', link: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/blob/main/CHANGELOG.md' },
      ],
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '快速开始',
      items: [
        { text: '介绍', link: 'introduce' },
        { text: '安装', link: 'install' },
        { text: '使用', link: 'usage' },
      ],
    },
    {
      text: 'API',
      items: [
        { text: 'mockDevServerPlugin', link: 'mock-plugin' },
        { text: 'defineMock', link: 'define-mock' },
        { text: 'createDefineMock', link: 'create-define-mock' },
        { text: 'defineMockData', link: 'define-mock-data' },
        { text: 'createSSEStream', link: 'create-sse-stream' },
      ],
    },
    {
      text: '配置',
      items: [
        { text: 'pluginConfig', link: 'plugin-config' },
        { text: 'mockConfig', link: 'mock-config' },
      ],
    },
    {
      text: '实践建议',
      items: [
        { text: '目录文件管理', link: 'file-management' },
        { text: '共享内容', link: 'shared' },
        { text: '共享可变数据', link: 'shared-data' },
        { text: '文件上传', link: 'upload' },
        { text: '团队协作', link: 'teamwork' },
        { text: 'mock服务部署', link: 'mock-service' },
      ],
    },
  ]
}

function sidebarExamples(): DefaultTheme.SidebarItem[] {
  return [
    { text: '基础示例', link: 'basic' },
    { text: '类型格式', link: 'format-extension' },
    { text: '自定义响应头', link: 'header' },
    { text: 'cookies', link: 'cookies' },
    { text: '自定义响应体', link: 'body' },
    { text: '自定义响应内容', link: 'response' },
    { text: '文件上传/下载', link: 'file' },
    { text: '静态资源服务', link: 'static' },
    { text: '请求验证器', link: 'validator' },
    { text: '使用mockjs库', link: 'mockjs' },
    { text: '使用faker-js库', link: 'faker' },
    { text: 'Graphql', link: 'graphql' },
    { text: 'Websocket', link: 'websocket' },
    { text: 'EventSource', link: 'event-source' },
  ]
}
