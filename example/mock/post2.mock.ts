import post, { initialPosts } from './data/post.js'
import { defineAPIMock } from './shared.js'

/**
 * 定义单个接口
 */
export const fetchPostList = defineAPIMock({
  url: '/post/delete/:index',
  method: 'POST',
  body({ params }) {
    // const data = post.splice(params.index, 1)
    const [getPost, setPost] = post
    setPost((item) => {
      item.splice(params.index, 1)
    })
    return {
      code: 200,
      message: 'success',
      result: {
        list: getPost(),
      },
    }
  },
})

/**
 * 重置共享数据，便于反复演示删除 / 列表联动
 *
 * Reset the shared data so the delete / list demo can be replayed.
 */
export const resetPostList = defineAPIMock({
  url: '/post/reset',
  method: 'POST',
  body() {
    const [, setPost] = post
    setPost([...initialPosts])
    return {
      code: 200,
      message: 'success',
      result: {
        list: post.value,
      },
    }
  },
})
