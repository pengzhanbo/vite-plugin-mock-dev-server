import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

interface CrudItem {
  id: number
  title: string
}

const initialItems: CrudItem[] = [
  { id: 1, title: 'first item' },
  { id: 2, title: 'second item' },
]

/**
 * Shared in-memory data across different request handlers, including the getter /
 * setter tuple form of `defineMockData`.
 *
 * 不同请求处理函数之间共享的内存数据，同时演示 `defineMockData` 的
 * getter / setter 元组形式。
 */
const items = defineMockData<CrudItem[]>('example-crud-items', initialItems)

export default defineMock([
  {
    url: '/api/crud/items',
    method: 'GET',
    body: () => items.value,
  },
  {
    url: '/api/crud/items',
    method: ['POST', 'PUT'],
    body: ({ body }) => {
      const item: CrudItem = {
        id: items.value.length + 1,
        title: body?.title ?? 'untitled',
      }
      const [getItems, setItems] = items
      setItems((list) => [...list, item])
      return { created: item, list: getItems() }
    },
  },
  {
    url: '/api/crud/items/:id',
    method: 'PUT',
    body: ({ params, body }) => {
      const id = Number(params.id)
      items.value = items.value.map((item) =>
        item.id === id ? { ...item, title: body?.title ?? item.title } : item,
      )
      return { updated: id, list: items.value }
    },
  },
  {
    url: '/api/crud/items/:id',
    method: 'DELETE',
    body: ({ params }) => {
      const id = Number(params.id)
      items.value = items.value.filter((item) => item.id !== id)
      return { deleted: id, list: items.value }
    },
  },
  {
    url: '/api/crud/reset',
    method: 'POST',
    body: () => {
      items.value = initialItems
      return { reset: true, list: items.value }
    },
  },
])
