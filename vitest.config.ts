import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['vite-plugin-mock-dev-server/__tests__/**/*.spec.ts'],
  },
})
