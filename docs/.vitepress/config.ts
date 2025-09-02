import type { DefaultTheme, UserConfig } from 'vitepress'
import process from 'node:process'
import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'

const prod = !!process.env.NETLIFY

const vitepressConfig: UserConfig<DefaultTheme.Config> = defineConfig({
  title: 'Mock-Dev-Server',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  rewrites: {
    'en/:rest*': ':rest*',
  },

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    headers: { level: [2, 3] },
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code')
        },
      },
    ],
    config(md) {
      md.use(groupIconMdPlugin)
    },
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
  vite: {
    plugins: [
      groupIconVitePlugin() as any,
      prod && llmstxt({
        workDir: 'en',
        ignoreFiles: ['index.md'],
      }),
    ],
  },
  locales: {
    root: { label: 'English' },
    zh: { label: '简体中文' },
  },
})
export default vitepressConfig
