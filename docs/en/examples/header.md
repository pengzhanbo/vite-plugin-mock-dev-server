# Custom Headers

Example, simulate adding JWT, Authorization Header

## Object Type
```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  headers: {
    Authorization: 'Basic YWRtaW46YWRtaW4='
  },
})
```

## Functional Type

```ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: 'api/post/1',
  headers({ query, params, body, headers, getCookie }) {
    // query is the query string in the request URL, parsed into an object
    // params are dynamic matching parameters in the request URL
    // body is the POST request body
    // headers are the request headers
    // getCookie(name, option) can be used to retrieve cookie information carried in the request headers
    return {
      Authorization: 'Basic YWRtaW46YWRtaW4='
    }
  },
})
```
