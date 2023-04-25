import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/delay',
    delay: 6000,
    body: {
      message: 'delay 6 seconds.',
    },
  },
  {
    // delay 6 seconds. but request fail
    url: '/api/delay-and-fail',
    status: 504,
    delay: 6000,
  },
])
