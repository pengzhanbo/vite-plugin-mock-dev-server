import type { DefaultTheme } from 'vitepress'
import { defineAdditionalConfig } from 'vitepress'
import { version } from '../package.json'

export default defineAdditionalConfig({
  lang: 'en-US',
  description: 'Inject mock-dev-server into the Vite development environment, simulating requests and data responses.',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/examples/': { base: '/examples/', items: sidebarExamples() },
      '/api/': { base: '/api/', items: sidebarApi() },
    },

    search: {
      options: {
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search',
          },
          modal: {
            displayDetails: 'Display detailed list',
            resetButtonTitle: 'Clear query',
            backButtonTitle: 'Back',
            noResultsText: 'No results found',
            footer: {
              selectText: 'Select',
              selectKeyAriaLabel: 'Enter',
              navigateText: 'Navigate',
              navigateUpKeyAriaLabel: 'Up',
              navigateDownKeyAriaLabel: 'Down',
              closeText: 'Close',
              closeKeyAriaLabel: 'Exit',
            },
          },
        },
      } as DefaultTheme.LocalSearchOptions,
    },

    editLink: {
      pattern: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License',
      copyright: `Copyright © 2022-${new Date().getFullYear()} pengzhanbo`,
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },

    outline: {
      label: 'Page navigation',
    },

    lastUpdated: {
      text: 'Last updated',
    },

    notFound: {
      title: 'Page not found',
      quote:
        'But if you do not change direction, and continue to seek, you may end up where you are headed.',
      linkLabel: 'Go to home',
      linkText: 'Take me home',
    },

    langMenuLabel: 'Languages',
    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Theme',
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
    skipToContentLabel: 'Skip to content',
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
      text: 'API Reference',
      link: '/api/',
      activeMatch: '/api/',
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
      text: 'Getting Started',
      items: [
        { text: 'Introduction', link: 'introduce' },
        { text: 'Usage', link: 'usage' },
        { text: 'Migrate from v1.x', link: 'migrate-v2' },
      ],
    },
    {
      text: 'Core Concepts',
      items: [
        { text: 'Request Lifecycle', link: 'request-lifecycle' },
        { text: 'Path Matching Rules', link: 'path-matching' },
        { text: 'Directory File Management', link: 'file-management' },
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
        { text: 'Plugin Configuration', link: 'plugin-config' },
        { text: 'Mock Configuration', link: 'mock-config' },
        { text: 'WebSocket Configuration', link: 'websocket-config' },
      ],
    },
    {
      text: 'Best Practices',
      items: [
        { text: 'Shared Content', link: 'shared' },
        { text: 'Shared Mutable Data', link: 'shared-data' },
        { text: 'File Upload', link: 'upload' },
        { text: 'Team Collaboration', link: 'teamwork' },
        { text: 'Mock Service Deployment', link: 'mock-service' },
      ],
    },
    {
      text: 'Troubleshooting',
      items: [
        { text: 'FAQ', link: 'troubleshooting/' },
      ],
    },
  ]
}

function sidebarExamples(): DefaultTheme.SidebarItem[] {
  return [
    { text: 'Basic Example', link: 'basic' },
    { text: 'Type Format', link: 'format-extension' },
    { text: 'Custom Response Headers', link: 'header' },
    { text: 'Cookies', link: 'cookies' },
    { text: 'Custom Response Body', link: 'body' },
    { text: 'Custom Response Content', link: 'response' },
    { text: 'File Upload/Download', link: 'file' },
    { text: 'Static Resource Service', link: 'static' },
    { text: 'Request Validator', link: 'validator' },
    { text: 'Using mockjs Library', link: 'mockjs' },
    { text: 'Using faker-js Library', link: 'faker' },
    { text: 'Graphql', link: 'graphql' },
    { text: 'Websocket', link: 'websocket' },
    { text: 'EventSource', link: 'event-source' },
    { text: 'Request Error Simulation', link: 'error-simulation' },
    { text: 'CRUD Complete Example', link: 'crud' },
    { text: 'Authentication Example', link: 'auth' },
    { text: 'Real-world Example', link: 'real-world' },
  ]
}

function sidebarApi(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Overview',
      items: [
        { text: 'API Reference', link: 'index' },
      ],
    },
    {
      text: 'Helper Functions',
      items: [
        { text: 'mockDevServerPlugin', link: 'mock-dev-server-plugin' },
        { text: 'defineMock', link: 'define-mock' },
        { text: 'createDefineMock', link: 'create-define-mock' },
        { text: 'defineMockData', link: 'define-mock-data' },
        { text: 'createSSEStream', link: 'create-sse-stream' },
      ],
    },
    {
      text: 'Type Definitions',
      items: [
        { text: 'MockServerPluginOptions', link: 'mock-server-plugin-options' },
        { text: 'MockHttpItem', link: 'mock-http-item' },
        { text: 'MockRequest', link: 'mock-request' },
        { text: 'MockResponse', link: 'mock-response' },
      ],
    },
  ]
}
