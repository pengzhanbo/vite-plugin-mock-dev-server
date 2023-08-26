# defineMockData(key, initialData)

定义可共享的 mock data。

::: info 说明

由于插件是 分别独立对 `*.mock.*` 等文件作为单独入口进行编译的，
这导致了 mock 文件编译后的依赖关系不一致，每个 mock 文件拥有独立的作用域，
使得即使多个 `*.mock.*` 虽然引入了同一个 `data.ts` 文件，然而确是完全不同两份 `data`，
使得对 `data` 的操作，在不同的 `*.mock.*` 文件中并不能共享。

`defineMockData` 仅是基于 `memory` 提供的共享数据支持，如果需要做 mock 数据持久化，建议使用 `nosql`， 如 `lowdb` 或 `level` 等。
:::

```ts
type defineMockData<T> = (
  key: string, // 唯一标识符
  initialData: T // 初始化数据
) => MockData<T>

type MockData<T> = [
  () => T, // getter
  (val: T | ((val: T) => void | T)) => void // setter
] & { value: T }
```

## 使用

`data.ts`

```ts
import { defineMockData } from 'vite-plugin-mock-dev-server'

export default defineMockData('posts', [
  { id: '1', title: 'title1', content: 'content1' },
  { id: '2', title: 'title2', content: 'content2' },
])
```

`*.mock.ts`  (`.value`)
::: code-group
```ts [post-list.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import posts from './data'

export default defineMock({
  url: '/api/post/list',
  body: () => posts.value
})
```
```ts [post-delete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import posts from './data'

export default defineMock({
  url: '/api/post/delete/:id',
  body: (params) => {
    const id = params.id
    posts.value = posts.value.filter((post) => post.id !== id)
    return { success: true }
  }
})
```
:::

`*.mock.ts`  (`[getter, setter]`)
::: code-group
```ts [post-list.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import posts from './data'

export default defineMock({
  url: '/api/post/list',
  body: () => {
    const [getPost] = posts
    return getPost()
  }
})
```
```ts [post-delete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import posts from './data'

export default defineMock({
  url: '/api/post/delete/:id',
  body: (params) => {
    const id = params.id
    const [, setPosts] = posts
    
    setPost((posts) => posts.filter((post) => post.id !== id))

    return { success: true }
  }
})
```
:::
