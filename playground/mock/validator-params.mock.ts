import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // match /api/post/1001
  {
    url: '/api/post/:postId',
    validator: {
      params: { postId: '1001' },
    },
    body: {
      code: 200,
      message: 'success',
      result: {
        id: '1001',
        title: 'post-1001',
        content: 'post-1001 content',
      },
    },
  },
  // match /api/post/1002
  {
    url: '/api/post/:postId',
    validator: {
      params: { postId: '1002' },
    },
    body: {
      code: 200,
      message: 'success',
      result: {
        id: '1002',
        title: 'post-1002',
        content: 'post-1002 content',
      },
    },
  },
])
