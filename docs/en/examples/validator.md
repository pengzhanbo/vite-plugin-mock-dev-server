# Request Validator

Sometimes, for the same URL, we need to return different content based on different request parameters, but we don't want to handle it internally in the `body` function form. In this case, you can use the `validator` configuration to return different response content based on different request parameters.

## Validate if GET request query matches

The link parameters only need to contain this parameter, no need for exact match.

<<< @/../example/mock/validator-query.mock.ts

## Validate if POST request body matches

The parameter needs to be included in the request body, exact match is not required.

<<< @/../example/mock/validator-body.mock.ts

## Validate if params in dynamic path match

Validate if the params in the dynamic path match.

<<< @/../example/mock/validator-params.mock.ts

## Validate if the request refererQuery parameters match

The source page address refers to the source address that initiates the mock API request.
It can be a page opened in a browser that initiates a mock request, in which case the opened page is the source address.
It can also be a mock API request initiated in a server request, in which case the server request is the source address.

The mock data content returned can be matched based on the `query` parameter in the source address.

<<< @/../example/mock/validator-refererQuery.mock.ts

## Validator as a Function

Sometimes, strict parameter matching may not be sufficient for validation. In such cases, you can define a validator as a function and return a boolean value.

This allows you to perform more flexible validation on various information in the request.

<<< @/../example/mock/validator-request.mock.ts

## Deeply validate if the body matches

For the request body, which may have a relatively complex data structure, deep validation is required.
The plugin supports checking if the body configured in the validator is a subset of the request body.

::: code-group
``` ts [api.mock.ts]
export default defineMock({
  url: '/mock/validator-body',
  validator: {
    body: {
      a: [1, 2], // The items in the array must all be in the 'a' of the request body
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
Not only does the body in the validator support deep validation, but query, refererQuery, and others also support it.
:::
