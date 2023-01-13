import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock([
  {
    url: '/api/login/:id',
    body: ({ query, params, body }) => {
      return {
        query,
        params,
        body,
        isLogin: true,
        development: __IS_DEVELOPMENT__,
      }
    },
  },
])
