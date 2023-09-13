# 共享数据

由于插件是 分别独立对 `*.mock.*` 等文件作为单独入口进行编译的，
这导致了 mock 文件编译后的依赖关系不一致，每个 mock 文件拥有独立的作用域，
使得即使多个 `*.mock.*` 虽然引入了同一个 `data.ts` 文件，然而确是完全不同两份 `data`，
使得对 `data` 的操作，在不同的 `*.mock.*` 文件中并不能共享。

对于一些复杂场景，期望 接口 B 返回被 接口 A 修改过的数据，比如:

模拟 对 文章列表和文章的修改:
```ts
const posts = [
  { id: 1, title: 'post1', content: '', author: 'Mark' },
  { id: 2, title: 'post2', content: '', author: 'John' },
]
```
- `/api/post/delete/:id` 将会删除文章，
- `/api/post/update/:id` 用于修改文章，
- `/api/post/list` 获取所有文章列表

期望 调用 删除、修改文章的接口后，重新调用获取所有文章的接口能够返回已修改的内容。

如果对数据的操作比较简单，我们可以将 数据、模拟请求配置都放在 同一个 `*.mock.ts` 中编写:

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
      const index = posts.find((post) => post.id === parseInt(params.id))
      index !== -1 && posts.splice(index, 1)
      return { message: 'success' }
    }
  },
  {
    url: '/api/post/update/:id',
    body: ({ params, body }) => {
      const index = posts.find((post) => post.id === parseInt(params.id))
      index !== -1 && (posts[index] = { ...posts[index], ...body })
      return { message: 'success' }
    }
  }
])
```
:::

而如果对于复杂场景，我们可能需要拆解为不同的文件来进行管理时：
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
      const index = posts.find((post) => post.id === parseInt(params.id))
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
      const index = posts.find((post) => post.id === parseInt(params.id))
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

这时候，接口将不会按预期返回被修改的数据，这是由于每个 `*.mock.ts` 都是独立引入 `data.ts`进行单独编译的。
它们都有独立的作用域，使得对 `data` 的操作在不同的 `*.mock.ts` 中并不能共享。

## 解决方案

### 使用 `defineMockData`

为此，插件提供了一个 `defineMockData(key, initialData)` 来解决这类问题。

只需要将 `data.ts` 中的数据包装在 `defineMockData` 中即可。

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
      const index = posts.value.find((post) => post.id === parseInt(params.id))
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
      const index = posts.value.find((post) => post.id === parseInt(params.id))
      index !== -1 && posts.value.splice(index, 1)
      return { message: 'success' }
    }
  })
```
:::

`defineMockData` 将数据隔离到单独的共享作用域中，并通过 `key` 保证数据的唯一性。

::: info 说明
`defineMockData` 仅是基于 `memory` 提供的共享数据支持，如果需要做 mock 数据持久化，建议使用 `nosql`， 如 `lowdb` 或 `level` 等。
:::
