import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/maybe-error',
  body: {
    msg: 'maybe error',
    code: 0,
    result: [],
  },
  error: {
    probability: 0.5,
    status: 500,
    statusText: 'Internal Server Error',
    body: { code: 500, msg: 'Internal Server Error', result: null },
  },
})
