# Shared Data

Due to the plugin, each `*.mock.*` file is compiled independently as a separate entry point, which leads to inconsistent dependency relationships after the mock files are compiled. Each mock file has its own scope, so even if multiple `*.mock.*` files import the same `data.ts` file, they have completely separate copies of the `data`. As a result, operations on the `data` in different `*.mock.*` files cannot be shared.

For some complex scenarios, it is expected that Interface B returns data modified by Interface A, for example:

Simulating the modification of article lists and articles:

```ts
const posts = [
  { id: 1, title: 'post1', content: '', author: 'Mark' },
  { id: 2, title: 'post2', content: '', author: 'John' },
]
```
- `/api/post/delete/:id` Delete a post
- `/api/post/update/:id` Update a post
- `/api/post/list` Get a list of all posts

I expect that after calling the delete and update post APIs, the get all posts API should return the modified content.

If the data operations are relatively simple, we can write the data and mock request configuration in the same `*.mock.ts` file.

::: code-group
```ts [*.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

const posts = [
  { id: 1, title: 'post1', content: '', author: 'Mark' },
  { id: 2, title: 'post2', content: '', author: 'John' },
]

export default defineMock([
  {
    url: '/api/post/list',
    body: () => posts
  },
  {
    url: '/api/post/delete/:id',
    body: ({ params }) => {
      const index = posts.find(post => post.id === Number.parseInt(params.id))
      index !== -1 && posts.splice(index, 1)
      return { message: 'success' }
    }
  },
  {
    url: '/api/post/update/:id',
    body: ({ params, body }) => {
      const index = posts.find(post => post.id === Number.parseInt(params.id))
      index !== -1 && (posts[index] = { ...posts[index], ...body })
      return { message: 'success' }
    }
  }
])
```
:::

And if we need to manage complex scenarios, we may need to break it down into different files:

::: code-group
```ts [posts/list.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from '../shared/data'

export default defineMock({
  url: '/api/post/list',
  body: () => posts
})
```
```ts [posts/update.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from '../shared/data'

export default defineMock({
  url: '/api/post/update/:id',
  body: ({ params, body }) => {
    const index = posts.findIndex(post => post.id === Number.parseInt(params.id))
    index !== -1 && (posts[index] = { ...posts[index], ...body })
    return { message: 'success' }
  }
})
```
```ts [posts/delete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from '../shared/data'

export default defineMock({
  url: '/api/post/delete/:id',
  body: ({ params }) => {
    const index = posts.findIndex(post => post.id === Number.parseInt(params.id))
    index !== -1 && posts.splice(index, 1)
    return { message: 'success' }
  }
})
```
```ts [shared/data.ts]
export const posts = [
  { id: 1, title: 'post1', content: '', author: 'Mark' },
  { id: 2, title: 'post2', content: '', author: 'John' },
]
```
:::

At this point, the interface will not return the modified data as expected. This is because each `*.mock.ts` file is independently importing `data.ts` for separate compilation.
They all have their own scopes, which means that operations on `data` in different `*.mock.ts` files cannot be shared.

## Solution

### Usage `defineMockData`

To address this, the plugin provides a `defineMockData(key, initialData)` function to solve this type of issue.

You just need to wrap the data in `data.ts` with `defineMockData`.

::: code-group
```ts [shared/data.ts] {1,3}
import { defineMockData } from 'vite-plugin-mock-dev-server'

export const posts = defineMockData('posts', [
  { id: 1, title: 'post1', content: '', author: 'Mark' },
  { id: 2, title: 'post2', content: '', author: 'John' },
])
```
```ts [posts/list.mock.ts] {6}
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from '../shared/data'

export default defineMock({
  url: '/api/post/list',
  body: () => posts.value
})
```
```ts [posts/update.mock.ts] {7,8}
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from '../shared/data'

export default defineMock({
  url: '/api/post/update/:id',
  body: ({ params, body }) => {
    const index = posts.value.findIndex(post => post.id === Number.parseInt(params.id))
    index !== -1 && (posts.value[index] = { ...posts.value[index], ...body })
    return { message: 'success' }
  }
})
```
```ts [posts/delete.mock.ts] {7,8}
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from '../shared/data'

export default defineMock({
  url: '/api/post/delete/:id',
  body: ({ params }) => {
    const index = posts.value.findIndex(post => post.id === Number.parseInt(params.id))
    index !== -1 && posts.value.splice(index, 1)
    return { message: 'success' }
  }
})
```
:::

`defineMockData` isolates the data into a separate shared scope and ensures the uniqueness of the data through a `key`.

::: info
`defineMockData` only provides support for shared data based on `memory`. If you need to persist mock data, it is recommended to use `nosql` databases such as `lowdb` or `level`.
:::
