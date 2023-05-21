# 请求验证器

有时候，对于相同的URL，我们需要根据不同的请求参数，返回不同的内容，但又不想通过 函数形式的 `body` 在函数内部处理。
在这种情况下可以通过 `validator` 配置，根据不同的 请求参数，返回不同的响应内容


## GET请求校验query是否匹配

链接参数中包含该参数即可，无需全匹配。

<<< @/../example/mock/validator-query.mock.ts

## POST请求校验body是否匹配

请求body中包含该参数即可，无需全匹配。

<<< @/../example/mock/validator-body.mock.ts

## 动态路径校验params是否匹配

校验 动态路径 中的 params 参数是否匹配

<<< @/../example/mock/validator-params.mock.ts

## 校验请求来源地址参数是否匹配

请求来源地址，指的是，发起 mock api 请求的来源地址，
可以是指一个在浏览器中打开的页面发起的mock 请求，那么打开的页面即是来源地址。
可以是指在一个server请求中发起的 mock api 请求，server请求即是来源地址。

通过 来源地址中的 `query` 参数，来匹配返回的 mock 数据内容

<<< @/../example/mock/validator-refererQuery.mock.ts

## 函数形式的校验器

有时候仅适用严格匹配的方式校验参数并不能满足需要，那么可以使用 函数形式来定义 校验器，并返回 boolean 值。

可以更加灵活的校验请求中的 各种信息

<<< @/../example/mock/validator-request.mock.ts

## 深度校验 body 是否匹配

对于请求体 body，其数据结构可能相对复杂，需要深度校验。
插件支持判断 验证器配置的 body 是否 属于 请求体 body 的 子集。

::: code-group
``` ts [api.mock.ts]
export default defineMock({
  url: '/mock/validator-body',
  validator: {
    body: {
      a: [1, 2], // 数组的项 必须都在 请求体 的 a 中
      b: { c: 1 }
    }
  },
  body: ''
})
```
``` ts [fetch.ts]
await fetch('/mock/validator-body', {
  method: 'POST',
  body: JSON.stringify({
    a: [1, 2, 3, 4],
    b: { c: 1, d: 2 },
    c: 1,
  })
})
```
:::

::: info
不仅 验证器中的 body 支持 深度校验，query、refererQuery 等也均支持。
:::
