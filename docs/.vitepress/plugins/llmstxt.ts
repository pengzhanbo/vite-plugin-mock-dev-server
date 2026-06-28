import type { VitepressPlugin } from 'vitepress-tuck'
import process from 'node:process'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'
import { definePlugin } from 'vitepress-tuck'

const isProd = process.env.NODE_ENV === 'production'

export default definePlugin(() => ({
  name: 'vitepress-plugin-llms',
  markdown: {
    config(md) {
      isProd && md.use(copyOrDownloadAsMarkdownButtons)
    },
  },
  vite: {
    plugins: [
      isProd && llmstxt(),
    ],
    ssr: {
      noExternal: [
        'vitepress-plugin-llms',
      ],
    },
  },
})) as () => VitepressPlugin
