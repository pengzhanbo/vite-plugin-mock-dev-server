import config from '@pengzhanbo/oxc-config/oxlint'

export default config({
  env: { node: true },
  node: true,
  settings: {
    jsdoc: {
      tagNamePreference: {
        type: 'type',
      },
    },
  },
  rules: {
    'vitest/no-standalone-expect': 'off',
  },
})
