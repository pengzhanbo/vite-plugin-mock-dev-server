import { defineMock } from 'vite-plugin-mock-dev-server'
import post from './data/post'

/**
 * 定义单个接口
 */
export const fetchPostList = defineMock({
  url: '/api/post/list',
  method: 'POST',
  body({ body }) {
    return {
      code: 200,
      msg: 'success',
      result: {
        page: body.page,
        total: 10,
        list: [...post],
      },
    }
  },
})
