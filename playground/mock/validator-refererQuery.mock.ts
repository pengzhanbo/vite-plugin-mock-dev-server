import { defineMock } from 'vite-plugin-mock-dev-server'
import postList from './data/post'

// Different pages send the same interface and can get different
// data through the query parameter of the source page
export default defineMock([
  // localhost/post.html?from=post-page
  // send request /api/post/list
  {
    url: '/api/post/list',
    validator: {
      refererQuery: { from: 'post-page' },
    },
    body: {
      list: postList,
    },
  },
  // localhost/recommend.html?from=recommend-page
  // send request /api/post/list
  {
    url: '/api/post/list',
    validator: {
      refererQuery: { from: 'recommend-page' },
      body: {
        list: postList.slice(0, 4),
      },
    },
  },
])
