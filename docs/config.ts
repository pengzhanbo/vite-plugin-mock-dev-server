import type { DefaultTheme } from 'vitepress'
import { defineAdditionalConfig } from 'vitepress'
import { version } from './package.json'

export default defineAdditionalConfig({
  lang: 'en-US',
  description: 'Mock-dev-server is injected into the Vite development environment to simulate API request and response data.',

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/edit/main/docs/:path',
      text: 'Edit this page on Github',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2022-${new Date().getFullYear()} pengzhanbo`,
    },
    docFooter: {
      prev: 'Prev Page',
      next: 'Next Page',
    },
    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/examples/': { base: '/examples/', items: sidebarExamples() },
    },
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: '/guide/introduce',
      activeMatch: '/guide/',
    },
    {
      text: 'Examples',
      link: '/examples/basic',
      activeMatch: '/examples/',
    },
    {
      text: `v${version}`,
      items: [
        { text: 'Changelog', link: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/blob/main/CHANGELOG.md' },
      ],
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Quick Start',
      items: [
        { text: 'Introduce', link: 'introduce' },
        { text: 'Install', link: 'install' },
        { text: 'Usage', link: 'usage' },
        { text: 'Migrate from v1.0', link: 'migrate-v2' },
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
      text: 'Configuration',
      items: [
        { text: 'pluginConfig', link: 'plugin-config' },
        { text: 'mockConfig', link: 'mock-config' },
      ],
    },
    {
      text: 'Practical suggestion',
      items: [
        {
          text: 'Directory file management',
          link: 'file-management',
        },
        { text: 'Share Content', link: 'shared' },
        { text: 'Shared', link: 'shared-data' },
        { text: 'File Upload', link: 'upload' },
        { text: 'Teamwork', link: 'teamwork' },
        {
          text: 'Mock Service Deployment',
          link: 'mock-service',
        },
      ],
    },
  ]
}

function sidebarExamples(): DefaultTheme.SidebarItem[] {
  return [
    { text: 'Basic example', link: 'basic' },
    { text: 'Format extension', link: 'format-extension' },
    { text: 'Custom header', link: 'header' },
    { text: 'cookies', link: 'cookies' },
    { text: 'Custom body', link: 'body' },
    { text: 'Custom response', link: 'response' },
    { text: 'File upload/download', link: 'file' },
    { text: 'Static resources', link: 'static' },
    { text: 'Request validator', link: 'validator' },
    { text: 'Use mockjs', link: 'mockjs' },
    { text: 'Use faker-js', link: 'faker' },
    { text: 'Graphql', link: 'graphql' },
    { text: 'Websocket', link: 'websocket' },
    { text: 'EventSource', link: 'event-source' },
  ]
}
