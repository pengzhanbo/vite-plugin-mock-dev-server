import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/es-module-js',
  body: {
    message: 'Write mock configuration using a ESModule js file.',
  },
})
