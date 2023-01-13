import Mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/mockjs',
  body: Mock.mock({
    'list|1-10': [
      {
        'id|+1': 1,
      },
    ],
  }),
})
