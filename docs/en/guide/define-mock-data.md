# defineMockData(key, initialData)

Define shareable mock data.

## Description

Due to the plugin compiling `*.mock.*` files as separate entry points, the dependency relationships of the compiled mock files are inconsistent. 

Each mock file has its own scope, which means that even if multiple `*.mock.*` files import the same `data.ts` file, they have completely separate copies of the `data` object. As a result, operations on `data` cannot be shared between different `*.mock.*` files.

`defineMockData` only provides shared data support based on memory. If you need to persist mock data, it is recommended to use a NoSQL database such as `lowdb` or `level`.

## Type Definition

```ts
type defineMockData<T> = (
  key: string, // unique key
  initialData: T // initial data
) => MockData<T>

type MockData<T> = [
  () => T, // getter
  (val: T | ((val: T) => void | T)) => void // setter
] & { value: T }
```

## Usage

`data.ts`

```ts
import { defineMockData } from 'vite-plugin-mock-dev-server'

export const posts = defineMockData('posts', [
  { id: '1', title: 'title1', content: 'content1' },
  { id: '2', title: 'title2', content: 'content2' },
])
```
The data encapsulated by `defineMockData` provides two different styles of data reading and writing support through the plugin, satisfying the usage habits of different developers.


- `posts.value`: Use `Object.defineProperty` to define read and write data.
- `[getter, setter] = posts`:  Deconstruct to a tuple containing `setter/getter` methods.



`*.mock.ts`  (`.value`)
::: code-group
```ts [post-list.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { posts } from './data'

export default defineMock({
  url: '/api/post/list',
  body: () => posts.value
})
```
```ts [post-delete.mock.ts]
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
:::

`*.mock.ts`  (`[getter, setter]`)
::: code-group
```ts [post-list.mock.ts]
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
```ts [post-delete.mock.ts]
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
:::
