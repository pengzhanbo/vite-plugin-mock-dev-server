import config from '@pengzhanbo/eslint-config-svelte'

export default config({
  pnpm: true,
  vue: false,
  typescript: {
    erasableOnly: true,
  },
}, {
  files: ['**/*.md/*.ts'],
  rules: {
    'node/prefer-global/buffer': 'off',
    'antfu/no-top-level-await': 'off',
  },
}, {
  files: ['README.md', 'README.zh-CN.md'],
  rules: {
    'markdown/no-missing-link-fragments': 'off',
  },
})
