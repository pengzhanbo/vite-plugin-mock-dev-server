import config from '@pengzhanbo/eslint-config'

export default config({
  pnpm: true,
}, {
  files: ['**/*.md/*.ts'],
  rules: {
    'node/prefer-global/buffer': 'off',
    'antfu/no-top-level-await': 'off',
  },
})
