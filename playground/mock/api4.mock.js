import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/js/config',
  body: {
    message: 'js file',
  },
})
