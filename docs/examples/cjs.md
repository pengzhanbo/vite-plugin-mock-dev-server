# Commonjs

使用 Commonjs 格式编写 mock 配置文件

``` js
/**
 * @type {import('vite-plugin-mock-dev-server').MockOptionsItem}
 */
module.exports = {
  url: 'api/test',
  body: {}
}
```

``` js
/**
 * @type {import('vite-plugin-mock-dev-server').MockOptions}
 */
module.exports = [
  {
    url: 'api/post/1',
    body: {}
  },
  {
    url: 'api/post/2',
    body: {}
  }
]
```
