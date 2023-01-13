import { defineMock } from 'vite-plugin-mock-dev-server'
import user from './data/user'

export default defineMock([
  {
    url: '/api/user/list',
    body: user,
  },
  {
    url: '/api/user/:userId',
    body({ params }) {
      const userId: string = params.userId
      return user[userId]
    },
  },
])
