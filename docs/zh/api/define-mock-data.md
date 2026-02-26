# defineMockData

定义带有基于内存的共享机制的 Mock 数据，用于在多个 Mock 文件之间共享状态。

## 问题背景

由于插件是分别独立对 `*.mock.*` 等文件作为单独入口进行编译的，这导致了 mock 文件编译后的依赖关系不一致，每个 mock 文件拥有独立的作用域。即使多个 `*.mock.*` 文件引入了同一个 `data.ts` 文件，它们也是完全不同的两份 `data` 实例，使得对 `data` 的操作在不同的 `*.mock.*` 文件中并不能共享。

`defineMockData` 提供了一种基于内存的数据共享机制来解决这个问题。

## 函数签名

```ts
function defineMockData<T = any>(
  key: string,
  initialData: T
): MockData<T>
```

## 参数

### key

- **类型**: `string`
- **描述**: Mock 数据的唯一标识键
- **必填**: 是

### initialData

- **类型**: `T`
- **描述**: 初始数据值
- **必填**: 是

## 返回值

- **类型**: `MockData<T>`
- **描述**: 包含 getter、setter 和 value 属性的对象

## 返回值结构

```ts
type MockData<T> = readonly [
  () => T, // getter 函数
  (val: T | ((val: T) => T | void)) => void // setter 函数
] & {
  value: T // 可直接访问的属性
}
```

## 示例

### 基础用法

```ts [data.ts]
import { defineMockData } from 'vite-plugin-mock-dev-server'

// 定义共享的用户数据
export const users = defineMockData('users', [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
])

// 定义共享的文章数据
export const posts = defineMockData('posts', [
  { id: 1, title: 'Hello World', authorId: 1 },
  { id: 2, title: 'Getting Started', authorId: 2 }
])
```

```ts [users.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { users } from './data'

export default defineMock([
  // 获取用户列表
  {
    url: '/api/users',
    method: 'GET',
    body: () => users.value
  },
  // 获取单个用户
  {
    url: '/api/users/:id',
    method: 'GET',
    body: ({ params }) => {
      return users.value.find(u => u.id === Number(params.id))
    }
  },
  // 创建用户
  {
    url: '/api/users',
    method: 'POST',
    body: ({ body }) => {
      const newUser = {
        id: Date.now(),
        ...body
      }
      // 使用 setter 更新数据
      users.value = [...users.value, newUser]
      return newUser
    }
  },
  // 删除用户
  {
    url: '/api/users/:id',
    method: 'DELETE',
    body: ({ params }) => {
      const id = Number(params.id)
      // 使用 setter 函数形式更新
      users[1](prev => prev.filter(u => u.id !== id))
      return { success: true }
    }
  }
])
```

### 使用 getter/setter 函数

```ts [counter.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

const counter = defineMockData('counter', { count: 0 })

export default defineMock([
  {
    url: '/api/counter',
    method: 'GET',
    body: () => ({
      count: counter[0]().count // 使用 getter 函数
    })
  },
  {
    url: '/api/counter/increment',
    method: 'POST',
    body: () => {
      // 使用 setter 函数
      counter[1](prev => ({
        count: prev.count + 1
      }))
      return { count: counter[0]().count }
    }
  }
])
```

### 复杂数据操作

```ts [todo.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
}

const todos = defineMockData<Todo[]>('todos', [
  { id: 1, text: 'Learn Vite', completed: false, createdAt: Date.now() },
  { id: 2, text: 'Build Mock API', completed: true, createdAt: Date.now() }
])

export default defineMock([
  // 获取待办列表（支持筛选）
  {
    url: '/api/todos',
    method: 'GET',
    body: ({ query }) => {
      let result = todos.value

      // 按完成状态筛选
      if (query.completed !== undefined) {
        const isCompleted = query.completed === 'true'
        result = result.filter(t => t.completed === isCompleted)
      }

      // 按关键词搜索
      if (query.q) {
        result = result.filter(t =>
          t.text.toLowerCase().includes(String(query.q).toLowerCase())
        )
      }

      return result
    }
  },
  // 创建待办
  {
    url: '/api/todos',
    method: 'POST',
    body: ({ body }) => {
      const newTodo: Todo = {
        id: Date.now(),
        text: body.text,
        completed: false,
        createdAt: Date.now()
      }
      todos.value = [newTodo, ...todos.value]
      return newTodo
    }
  },
  // 切换完成状态
  {
    url: '/api/todos/:id/toggle',
    method: 'PATCH',
    body: ({ params }) => {
      const id = Number(params.id)
      todos[1](prev =>
        prev.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      )
      return todos.value.find(t => t.id === id)
    }
  },
  // 批量删除已完成
  {
    url: '/api/todos/clear-completed',
    method: 'DELETE',
    body: () => {
      const completedCount = todos.value.filter(t => t.completed).length
      todos[1](prev => prev.filter(t => !t.completed))
      return { deleted: completedCount }
    }
  }
])
```

## 热更新处理

`defineMockData` 内置了热更新处理机制：

1. **缓存机制**: 数据会被缓存，确保多个 Mock 文件访问的是同一实例
2. **热更新保护**: 在短时间内的重复编译（如使用 `mockjs` 或 `faker-js` 生成随机数据）不会导致数据重置
3. **数据持久**: 文件修改后的重新编译会保留已有的数据状态

## 注意事项

1. **内存存储**: 数据仅存储在内存中，服务重启后数据会丢失
2. **持久化建议**: 如需持久化存储，建议使用 `lowdb`、`level` 等数据库
3. **键的唯一性**: 确保 `key` 在全局范围内唯一，避免数据冲突
4. **数据类型**: 建议为复杂数据定义 TypeScript 接口以获得类型提示

```ts
// 持久化示例（使用 lowdb）
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { defineMock } from 'vite-plugin-mock-dev-server'

const adapter = new JSONFile('db.json')
const db = new Low(adapter, { posts: [] })
await db.read()

export default defineMock({
  url: '/api/posts',
  body: () => db.data.posts
})
```
