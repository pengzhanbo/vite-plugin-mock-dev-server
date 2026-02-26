# defineMockData

Define Mock data with a memory-based sharing mechanism, used to share state between multiple Mock files.

## Problem Background

Since the plugin compiles `*.mock.*` files as separate entries, this leads to inconsistent dependency relationships after compilation of mock files, with each mock file having its own independent scope. Even if multiple `*.mock.*` files import the same `data.ts` file, they are completely different `data` instances, so operations on `data` cannot be shared across different `*.mock.*` files.

`defineMockData` provides a memory-based data sharing mechanism to solve this problem.

## Function Signature

```ts
function defineMockData<T = any>(
  key: string,
  initialData: T
): MockData<T>
```

## Parameters

### key

- **Type**: `string`
- **Description**: Unique identifier key for Mock data
- **Required**: Yes

### initialData

- **Type**: `T`
- **Description**: Initial data value
- **Required**: Yes

## Return Value

- **Type**: `MockData<T>`
- **Description**: Object containing getter, setter, and value properties

## Return Value Structure

```ts
type MockData<T> = readonly [
  () => T, // getter function
  (val: T | ((val: T) => T | void)) => void // setter function
] & {
  value: T // Directly accessible property
}
```

## Examples

### Basic Usage

```ts [data.ts]
import { defineMockData } from 'vite-plugin-mock-dev-server'

// Define shared user data
export const users = defineMockData('users', [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
])

// Define shared post data
export const posts = defineMockData('posts', [
  { id: 1, title: 'Hello World', authorId: 1 },
  { id: 2, title: 'Getting Started', authorId: 2 }
])
```

```ts [users.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import { users } from './data'

export default defineMock([
  // Get user list
  {
    url: '/api/users',
    method: 'GET',
    body: () => users.value
  },
  // Get single user
  {
    url: '/api/users/:id',
    method: 'GET',
    body: ({ params }) => {
      return users.value.find(u => u.id === Number(params.id))
    }
  },
  // Create user
  {
    url: '/api/users',
    method: 'POST',
    body: ({ body }) => {
      const newUser = {
        id: Date.now(),
        ...body
      }
      // Update data using setter
      users.value = [...users.value, newUser]
      return newUser
    }
  },
  // Delete user
  {
    url: '/api/users/:id',
    method: 'DELETE',
    body: ({ params }) => {
      const id = Number(params.id)
      // Update using setter function form
      users[1](prev => prev.filter(u => u.id !== id))
      return { success: true }
    }
  }
])
```

### Using getter/setter Functions

```ts [counter.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

const counter = defineMockData('counter', { count: 0 })

export default defineMock([
  {
    url: '/api/counter',
    method: 'GET',
    body: () => ({
      count: counter[0]().count // Using getter function
    })
  },
  {
    url: '/api/counter/increment',
    method: 'POST',
    body: () => {
      // Using setter function
      counter[1](prev => ({
        count: prev.count + 1
      }))
      return { count: counter[0]().count }
    }
  }
])
```

### Complex Data Operations

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
  // Get todo list (supports filtering)
  {
    url: '/api/todos',
    method: 'GET',
    body: ({ query }) => {
      let result = todos.value

      // Filter by completion status
      if (query.completed !== undefined) {
        const isCompleted = query.completed === 'true'
        result = result.filter(t => t.completed === isCompleted)
      }

      // Search by keyword
      if (query.q) {
        result = result.filter(t =>
          t.text.toLowerCase().includes(String(query.q).toLowerCase())
        )
      }

      return result
    }
  },
  // Create todo
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
  // Toggle completion status
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
  // Batch delete completed
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

## Hot Reload Handling

`defineMockData` has built-in hot reload handling mechanism:

1. **Caching Mechanism**: Data is cached to ensure multiple Mock files access the same instance
2. **Hot Reload Protection**: Repeated compilations in a short time (such as using `mockjs` or `faker-js` to generate random data) will not cause data reset
3. **Data Persistence**: Data state is preserved after file modification and recompilation

## Important Notes

1. **Memory Storage**: Data is only stored in memory and will be lost after service restart
2. **Persistence Recommendation**: For persistent storage, it is recommended to use databases like `lowdb`, `level`, etc.
3. **Key Uniqueness**: Ensure `key` is globally unique to avoid data conflicts
4. **Data Types**: It is recommended to define TypeScript interfaces for complex data to get type hints

```ts
// Persistence example (using lowdb)
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
