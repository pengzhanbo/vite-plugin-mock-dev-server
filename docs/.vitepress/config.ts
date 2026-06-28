import type { DefaultTheme, UserConfig } from 'vitepress'
import fileTree from 'vitepress-plugin-file-tree'
import npmTo from 'vitepress-plugin-npm-to'
import { defineConfig } from 'vitepress-tuck'
import groupIcons from './plugins/group-icons'
import llmstxt from './plugins/llmstxt'

const vitepressConfig: UserConfig<DefaultTheme.Config> = defineConfig({
  plugins: [
    npmTo(['npm', 'pnpm', 'yarn', 'deno', 'bun']),
    fileTree(),
    groupIcons(),
    llmstxt(),
  ],
  title: 'Mock-Dev-Server',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  rewrites: { 'en/:rest*': ':rest*' },

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    headers: { level: [2, 3] },
    codeTransformers: [{ postprocess: code => code.replace(/\[!!code/g, '[!code') }],
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg', href: '/logo.png' }],
  ],
  sitemap: {
    hostname: 'https://vite-plugin-mock-dev-server.netlify.app',
  },
  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server' },
    ],
    search: { provider: 'local' },
    outline: [2, 3],
  },
  locales: {
    root: { label: 'English' },
    zh: { label: '简体中文' },
  },
})
export default vitepressConfig
