import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/esm/config',
  body: {
    message: 'esm file',
  },
})
