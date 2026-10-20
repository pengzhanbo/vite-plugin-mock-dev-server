import { defineMock } from 'vite-plugin-mock-dev-server'
import postList from './data/post.js'

// Different pages send the same interface and can get different
// data through the query parameter of the source page
// 不同页面请求同一个接口，通过来源页面的 query 参数返回不同数据
export default defineMock([
  // localhost/post.html?from=post-page
  // send request /api/post/list
  {
    url: '/api/post/list',
    method: 'GET',
    validator: {
      refererQuery: { from: 'post-page' },
    },
    body: () => ({
      list: postList.value,
    }),
  },
  // localhost/recommend.html?from=recommend-page
  // send request /api/post/list
  {
    url: '/api/post/list',
    method: 'GET',
    validator: {
      refererQuery: { from: 'recommend-page' },
    },
    body: () => ({
      list: postList.value.slice(0, 4),
    }),
  },
  {
    url: '/api/post/list',
    method: 'GET',
    body: () => ({
      list: postList.value,
      fallback: true,
    }),
  },
])
