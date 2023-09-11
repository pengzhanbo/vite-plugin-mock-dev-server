import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/(.*)',
  body: {
    message: 'This request fallback',
  },
})
