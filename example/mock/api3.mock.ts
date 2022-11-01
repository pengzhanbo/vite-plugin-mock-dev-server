import { defineMock } from 'vite-plugin-mock-dev-server'
import post from './post'

/**
 * 可以通过这种方式，将 变量名与 项目源代码中的请求封装函数的名称相对应，
 * 方便查找对应的mock数据
 */
export const fetchLogin = defineMock({
  url: '/api/login/id/:id',
  headers: {
    token: 'custom-token:123',
  },
  body: {
    login: true,
    token: 'aaaaaaaaaaaa',
  },
})

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
        list: [
          { title: 'post1' },
          { title: 'post2' },
          { title: 'post3' },
          ...post,
        ],
      },
    }
  },
})
