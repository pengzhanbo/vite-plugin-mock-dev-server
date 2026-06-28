import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { definePlugin, type VitepressPlugin } from 'vitepress-tuck'

export default definePlugin(() => ({
  name: 'vitepress-plugin-group-icons',
  client: {
    imports: ['import \'virtual:group-icons.css\''],
  },
  markdown: {
    config: (md) => {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin(),
    ],
    ssr: {
      noExternal: [
        'vitepress-plugin-group-icons',
      ],
    },
  },
})) as () => VitepressPlugin
