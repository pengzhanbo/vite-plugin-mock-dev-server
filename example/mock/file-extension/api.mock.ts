import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock([
  {
    url: '/api/typescript',
    body: {
      message: 'Write mock configuration using a typescript file.',
    },
  },
])
