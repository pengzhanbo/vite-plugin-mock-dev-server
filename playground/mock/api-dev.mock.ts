import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api-dev/list/get',
  body: {
    message: 'api-dev list get',
  },
})
