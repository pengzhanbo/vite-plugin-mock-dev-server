# Commonjs

使用 Commonjs 格式编写 mock 配置文件

``` js
module.exports = {
  url: 'api/test',
  body: {}
}
```

``` js
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
