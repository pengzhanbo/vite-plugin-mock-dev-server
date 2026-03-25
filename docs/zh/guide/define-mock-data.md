# defineMockData(key, initialData [, options])

定义可共享的 mock data，用于在多个 Mock 文件之间共享状态。

## 问题背景

由于插件是分别独立对 `*.mock.*` 等文件作为单独入口进行编译的，这导致了 mock 文件编译后的依赖关系不一致，每个 mock 文件拥有独立的作用域。即使多个 `*.mock.*` 文件引入了同一个 `data.ts` 文件，它们也是完全不同的两份 `data` 实例，使得对 `data` 的操作在不同的 `*.mock.*` 文件中并不能共享。

`defineMockData` 提供了一种基于内存的数据共享机制来解决这个问题。

::: info 说明
`defineMockData` 仅是基于内存提供的共享数据支持，如果需要做 mock 数据持久化，建议使用 `lowdb` 或 `level` 等数据库。
:::

## 使用

```ts [mock/data.ts]
import { defineMockData } from 'vite-plugin-mock-dev-server'

export const posts = defineMockData('posts', [
  { id: '1', title: 'title1', content: 'content1' },
  { id: '2', title: 'title2', content: 'content2' },
])
```

通过 `defineMockData` 封装的数据，插件提供了两种不同风格的方式来支持对数据的读写：

- `posts.value`: 使用 `Object.defineProperty` 方式定义数据的读写
- `[getter, setter] = posts`: 解构为包含 `setter/getter` 方法的元组

### 使用 `.value` 方式

```ts [mock/post-list.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from './data'

export default defineMock({
  url: '/api/post/list',
  body: () => posts.value
})
```

```ts [mock/post-delete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from './data'

export default defineMock({
  url: '/api/post/delete/:id',
  body: (params) => {
    const id = params.id
    posts.value = posts.value.filter(post => post.id !== id)
    return { success: true }
  }
})
```

### 使用 `[getter, setter]` 方式

```ts [mock/post-list.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from './data'

export default defineMock({
  url: '/api/post/list',
  body: () => {
    const [getPost] = posts
    return getPost()
  }
})
```

```ts [mock/post-delete.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from './data'

export default defineMock({
  url: '/api/post/delete/:id',
  body: (params) => {
    const id = params.id
    const [, setPosts] = posts
    setPosts(posts => posts.filter(post => post.id !== id))
    return { success: true }
  }
})
```

## 更多详情

查看 [API 参考 - defineMockData](../api/define-mock-data) 获取完整的类型定义和更多示例。
