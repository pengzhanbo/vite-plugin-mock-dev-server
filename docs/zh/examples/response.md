# 自定义请求响应内容

如果需要设置复杂的响应内容，可以使用 response 方法，
该方法是一个 middleware，你可以在这里拿到 http 请求的 req、res等信息，
然后通过 res.write() | res.end() 返回响应数据， 否则需要执行 next() 方法。
在 `req` 中，还可以拿到 query、params、body, refererQuery 等已解析的请求信息。

<<< @/../example/mock/custom-response.mock.ts
