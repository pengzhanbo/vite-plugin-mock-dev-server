import post from './data/post.js'
import { defineAPIMock } from './shared.js'

/**
 * 定义单个接口
 */
export const fetchPostList = defineAPIMock({
  url: '/post/list',
  method: 'POST',
  body({ body }) {
    return {
      code: 200,
      message: 'success',
      result: {
        page: body.page,
        total: post.value.length - 1,
        list: [...post.value],
      },
    }
  },
})
