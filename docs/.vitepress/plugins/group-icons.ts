import type { VitepressPlugin } from 'vitepress-tuck'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { definePlugin } from 'vitepress-tuck'

export const groupIconsPlugin: () => VitepressPlugin = definePlugin(() => ({
  name: 'vitepress-plugin-group-icons',
  client: {
    imports: ["import 'virtual:group-icons.css'"],
  },
  markdown: {
    config: (md) => {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
    ssr: {
      noExternal: ['vitepress-plugin-group-icons'],
    },
  },
}))

export default groupIconsPlugin
