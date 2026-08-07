import { defineMock } from 'vite-plugin-mock-dev-server'
import user from './data/user.js'

export default defineMock([
  {
    url: '/api/user/list',
    body: () => user.value,
  },
  {
    url: '/api/user/:userId',
    body({ params }) {
      const userId: string = params.userId
      return user.value[userId]
    },
  },
])
