# Custom Response

If you need to set complex response content, you can use the `response` method. This method is a middleware where you can access the `req` and `res` information of the HTTP request, and then return the response data using `res.write()` or `res.end()`. Otherwise, you need to execute the `next()` method. In the `req` object, you can also access parsed request information such as `query`, `params`, `body`, and `refererQuery`.

<<< @/../example/mock/custom-response.mock.ts
