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

## 校验请求来源地址参数是否匹配

请求来源地址，指的是，发起 mock api 请求的来源地址，
可以是指一个在浏览器中打开的页面发起的mock 请求，那么打开的页面即是来源地址。
可以是指在一个server请求中发起的 mock api 请求，server请求即是来源地址。

通过 来源地址中的 `query` 参数，来匹配返回的 mock 数据内容

```ts
export default defineMock([
  // 在 http://localhost/?page=1 页面发起的 `/api/post/list` 才会匹配这个mock数据内容
  {
    url: '/api/post/list',
    method: 'POST',
    validator: {
      refererQuery: {
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
  // // 在 http://localhost/?page=2 页面发起的 `/api/post/list` 才会匹配这个mock数据内容
  {
    url: '/api/post/list',
    method: 'POST',
    refererQuery: {
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
