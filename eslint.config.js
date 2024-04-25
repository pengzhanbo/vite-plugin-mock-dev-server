import config from '@pengzhanbo/eslint-config'

export default config({
  vue: false,
}, {
  files: ['**/*.md/*.ts'],
  rules: {
    'node/prefer-global/buffer': 'off',
  },
})
