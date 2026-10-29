import config from '@pengzhanbo/oxc-config/oxlint'

export default config({
  env: { browser: true },
  react: true,
  settings: {
    jsdoc: { tagNamePreference: { type: 'type' } },
  },
  options: { typeAware: undefined, typeCheck: undefined },
  globals: { __IS_DEVELOPMENT__: 'readonly' },
  ignores: ['dist', 'mock/.recordings'],
  node: ['vite.config.ts', 'plugin-options.ts', '{mock,plugins}/**/*.{cjs,mjs,js,ts}'],
  rules: {
    'react/only-export-components': 'off',
    'react/jsx-no-constructed-context-values': 'off',
  },
})
