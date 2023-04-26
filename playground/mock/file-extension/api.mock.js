import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/javascript',
  body: {
    message: 'Write mock configuration using a js file.',
  },
})
