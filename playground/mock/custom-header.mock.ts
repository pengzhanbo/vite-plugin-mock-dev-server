import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock([
  {
    url: '/api/custom-header',
    headers: {
      'X-Custom-Header': 'Your header value',
    },
  },
  {
    url: '/api/custom-header-fn',
    headers({ headers }) {
      return {
        'content-type': headers['content-type'] || 'application/json',
      }
    },
  },
])
