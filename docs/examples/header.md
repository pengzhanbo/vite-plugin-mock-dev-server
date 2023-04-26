# 自定义响应头

自定义响应头

示例，模拟添加 JWT， Authorization Header

## 对象类型
```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  headers: {
    Authorization: 'Basic YWRtaW46YWRtaW4='
  },
})
```

## 函数形式

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  headers({ query, params, body, headers, getCookie }) {
    // query 是 请求链接上的 queryString, 并经过了解析为对象
    // params 请求链接中 动态匹配参数
    // body  POST 请求体
    // headers 请求头
    // getCookie(name, option) 可以通过此方法获取请求头中携带的 cookie 信息
    return {
      Authorization: 'Basic YWRtaW46YWRtaW4='
    }
  },
})
```
