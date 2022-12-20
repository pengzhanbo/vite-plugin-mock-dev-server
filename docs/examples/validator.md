# 多个相同URL返回不同响应内容

有时候，对于相同的URL，我们需要根据不同的请求参数，返回不同的内容，但又不想通过 函数形式的 `body` 在函数内部处理。
在这种情况下可以通过 `validator` 配置，根据不同的 请求参数，返回不同的响应内容


## GET请求校验query是否匹配

链接参数中包含该参数即可，无需全匹配。

```ts
export default defineMock([
  // Match /api/post/list?page=1
  {
    url: '/api/post/list',
    method: 'GET',
    validator: {
      query: {
        page: 1
      }
    },
    body: {
      totalPage: 10,
      page: 1,
      postList: [
        { title: 'post 1' },
        { title: 'post 2' }
      ]
    }
  },
  // Match /api/post/list?page=2
  {
    url: '/api/post/list',
    method: 'GET',
    validator: {
      query: {
        page: 2
      }
    },
    body: {
      totalPage: 10,
      page: 2,
      postList: [
        { title: 'post 3' },
        { title: 'post 4' }
      ]
    }
  },
])
```

## POST请求校验body是否匹配

请求body中包含该参数即可，无需全匹配。

```ts
export default defineMock([
  // Match /api/post/list?page=1
  {
    url: '/api/post/list',
    method: 'POST',
    validator: {
      body: {
        page: 1
      }
    },
    body: {
      totalPage: 10,
      page: 1,
      postList: [
        { title: 'post 1' },
        { title: 'post 2' }
      ]
    }
  },
  // Match /api/post/list?page=2
  {
    url: '/api/post/list',
    method: 'POST',
    validator: {
      body: {
        page: 2
      }
    },
    body: {
      totalPage: 10,
      page: 2,
      postList: [
        { title: 'post 3' },
        { title: 'post 4' }
      ]
    }
  },
])
```
