import config from '@pengzhanbo/oxc-config/oxlint'

export default config({
  env: { node: true, browser: true },
  settings: {
    jsdoc: { tagNamePreference: { type: 'type' } },
  },
  options: { typeAware: undefined, typeCheck: undefined },
  globals: { __IS_DEVELOPMENT__: 'readonly' },
  ignores: ['dist', 'mock/.recordings'],
  node: ['vite.config.ts', 'plugin-options.ts', 'mock', 'plugins'],
})
