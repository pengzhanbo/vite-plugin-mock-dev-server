import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // match /api/post?id=1000
  {
    url: '/api/post',
    validator: {
      query: { id: '1000' },
    },
    body: {
      code: 200,
      message: 'success',
      result: {
        id: '1000',
        title: 'post-1000',
        content: 'post-1000 content',
        author: 'Mark',
      },
    },
  },
  {
    url: '/api/post',
    validator: {
      query: { id: '1001' },
    },
    body: {
      code: 200,
      message: 'success',
      result: {
        id: '1001',
        title: 'post-1001',
        content: 'post-1001 content',
        author: 'John',
      },
    },
  },
  {
    // match query include field `id` and value is 1003
    // like {url: '/api/post', validator: { query: { id: '1003' } }}
    url: '/api/post?id=1003',
    body: {
      code: 200,
      message: 'success',
      result: {
        id: '1003',
        title: 'post-1003',
        content: 'post-1003 content',
        author: 'Joy',
      },
    },
  },
  // Fallback, when the validator does not have a matching result, will use the configuration without validators as the response.
  {
    url: '/api/post',
    body: {
      code: 200,
      message: 'success',
      result: {
        id: 1000 + Math.floor(Math.random() * 1000),
        title: 'random post title',
      },
    },
  },
])
