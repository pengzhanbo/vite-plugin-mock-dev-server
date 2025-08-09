import config from '@pengzhanbo/eslint-config'

export default config({
  pnpm: true,
  vue: false,
  globals: {
    __PACKAGE_NAME__: 'readonly',
    __PACKAGE_VERSION__: 'readonly',
  },
}, {
  files: ['**/*.md/*.ts'],
  rules: {
    'node/prefer-global/buffer': 'off',
    'antfu/no-top-level-await': 'off',
  },
})
