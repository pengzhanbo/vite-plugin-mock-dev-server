# Real-world Examples

This chapter provides real-world project Mock scenarios, including e-commerce systems and admin dashboards.

## E-commerce System

### Scenario Description

Implement a complete e-commerce system Mock, including:
- Product management (list, details, search, filtering)
- Shopping cart (add, remove, modify quantity)
- Order system (create, pay, query)
- User system (login, register, address management)

### Data Structure

```ts
// types/ecommerce.ts
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  tags: string[]
  stock: number
  sales: number
  rating: number
  reviews: number
}

interface CartItem {
  productId: string
  quantity: number
  selected: boolean
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  address: Address
  createdAt: string
  paidAt?: string
}

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}
```

### Mock Implementation

```ts [mock/ecommerce/products.mock.ts]
import { faker } from '@faker-js/faker'
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

// Generate product data
function generateProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 10, max: 1000 })),
    originalPrice: faker.helpers.maybe(() =>
      Number(faker.commerce.price({ min: 100, max: 1200 }))
    ),
    images: Array.from({ length: 3 }, () => faker.image.url()),
    category: faker.commerce.department(),
    tags: faker.helpers.arrayElements(['hot', 'new', 'sale'], { min: 0, max: 2 }),
    stock: faker.number.int({ min: 0, max: 1000 }),
    sales: faker.number.int({ min: 0, max: 10000 }),
    rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    reviews: faker.number.int({ min: 0, max: 5000 })
  }))
}

const products = defineMockData('ecommerce-products', generateProducts(100))

export default defineMock([
  // Product list
  {
    url: '/api/ecommerce/products',
    method: 'GET',
    body: ({ query }) => {
      let result = [...products.value]

      // Search
      if (query.keyword) {
        const keyword = String(query.keyword).toLowerCase()
        result = result.filter(p =>
          p.name.toLowerCase().includes(keyword)
          || p.description.toLowerCase().includes(keyword)
        )
      }

      // Category filter
      if (query.category) {
        result = result.filter(p => p.category === query.category)
      }

      // Price range
      if (query.minPrice) {
        result = result.filter(p => p.price >= Number(query.minPrice))
      }
      if (query.maxPrice) {
        result = result.filter(p => p.price <= Number(query.maxPrice))
      }

      // Sorting
      const sortField = query.sortField || 'createdAt'
      const sortOrder = query.sortOrder || 'desc'
      result.sort((a, b) => {
        const aVal = a[sortField as keyof typeof a]
        const bVal = b[sortField as keyof typeof b]
        return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
      })

      // Pagination
      const page = Number(query.page) || 1
      const pageSize = Number(query.pageSize) || 20
      const total = result.length
      const start = (page - 1) * pageSize

      return {
        data: result.slice(start, start + pageSize),
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
      }
    }
  },

  // Product details
  {
    url: '/api/ecommerce/products/:id',
    method: 'GET',
    body: ({ params }) => {
      const product = products.value.find(p => p.id === params.id)
      if (!product) {
        return { status: 404, body: { message: 'Product not found' } }
      }
      return { data: product }
    }
  }
])
```

```ts [mock/ecommerce/cart.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

const carts = defineMockData<Map<string, CartItem[]>>('ecommerce-carts', new Map())

export default defineMock([
  // Get cart
  {
    url: '/api/ecommerce/cart',
    method: 'GET',
    body: ({ headers }) => {
      const userId = headers['x-user-id'] || 'guest'
      const cart = carts.value.get(userId) || []
      return { data: cart }
    }
  },

  // Add to cart
  {
    url: '/api/ecommerce/cart',
    method: 'POST',
    body: ({ headers, body }) => {
      const userId = headers['x-user-id'] || 'guest'
      const { productId, quantity = 1 } = body

      const cart = carts.value.get(userId) || []
      const existingItem = cart.find(item => item.productId === productId)

      if (existingItem) {
        existingItem.quantity += quantity
      }
      else {
        cart.push({ productId, quantity, selected: true })
      }

      carts.value.set(userId, cart)
      return { data: cart }
    }
  },

  // Update cart
  {
    url: '/api/ecommerce/cart/:productId',
    method: 'PUT',
    body: ({ headers, params, body }) => {
      const userId = headers['x-user-id'] || 'guest'
      const cart = carts.value.get(userId) || []
      const item = cart.find(i => i.productId === params.productId)

      if (!item) {
        return { status: 404, body: { message: 'Item not found' } }
      }

      if (body.quantity !== undefined) {
        item.quantity = Math.max(1, body.quantity)
      }
      if (body.selected !== undefined) {
        item.selected = body.selected
      }

      carts.value.set(userId, cart)
      return { data: cart }
    }
  },

  // Remove from cart
  {
    url: '/api/ecommerce/cart/:productId',
    method: 'DELETE',
    body: ({ headers, params }) => {
      const userId = headers['x-user-id'] || 'guest'
      let cart = carts.value.get(userId) || []
      cart = cart.filter(i => i.productId !== params.productId)
      carts.value.set(userId, cart)
      return { data: cart }
    }
  }
])
```

## Admin Dashboard

### Scenario Description

Implement an admin dashboard Mock, including:
- Dashboard data (statistics, charts)
- User management (CRUD, permissions)
- Content management (articles, categories)
- System settings

### Mock Implementation

```ts [mock/admin/dashboard.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/admin/dashboard',
  method: 'GET',
  body: () => ({
    data: {
      stats: {
        users: { total: 1234, growth: 12.5 },
        orders: { total: 567, growth: -5.2 },
        revenue: { total: 89000, growth: 23.8 },
        products: { total: 456, growth: 8.1 }
      },
      charts: {
        salesTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 10000)
        })),
        categoryDistribution: [
          { name: 'Electronics', value: 35 },
          { name: 'Clothing', value: 28 },
          { name: 'Food', value: 22 },
          { name: 'Others', value: 15 }
        ]
      },
      recentActivities: [
        { id: 1, user: 'Admin', action: 'Created product', time: '5 minutes ago' },
        { id: 2, user: 'User123', action: 'Placed order', time: '10 minutes ago' }
      ]
    }
  })
})
```

```ts [mock/admin/users.mock.ts]
import { defineMock, defineMockData } from 'vite-plugin-mock-dev-server'

const adminUsers = defineMockData('admin-users', [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'super', status: 'active', lastLogin: '2024-01-20' },
  { id: 2, username: 'editor', email: 'editor@example.com', role: 'editor', status: 'active', lastLogin: '2024-01-19' },
  { id: 3, username: 'viewer', email: 'viewer@example.com', role: 'viewer', status: 'inactive', lastLogin: '2024-01-15' }
])

export default defineMock([
  {
    url: '/api/admin/users',
    method: 'GET',
    body: ({ query }) => {
      let result = [...adminUsers.value]

      if (query.role) {
        result = result.filter(u => u.role === query.role)
      }
      if (query.status) {
        result = result.filter(u => u.status === query.status)
      }
      if (query.keyword) {
        const keyword = String(query.keyword).toLowerCase()
        result = result.filter(u =>
          u.username.toLowerCase().includes(keyword)
          || u.email.toLowerCase().includes(keyword)
        )
      }

      return { data: result }
    }
  },

  {
    url: '/api/admin/users/:id',
    method: 'PUT',
    body: ({ params, body }) => {
      const index = adminUsers.value.findIndex(u => u.id === Number(params.id))
      if (index === -1) {
        return { status: 404, body: { message: 'User not found' } }
      }
      adminUsers.value[index] = { ...adminUsers.value[index], ...body }
      return { data: adminUsers.value[index] }
    }
  },

  {
    url: '/api/admin/users/:id',
    method: 'DELETE',
    body: ({ params }) => {
      adminUsers.value = adminUsers.value.filter(u => u.id !== Number(params.id))
      return { status: 204 }
    }
  }
])
```

## Usage Recommendations

1. **Modular Organization**: Split Mock files by functional modules
2. **Data Persistence**: Use `defineMockData` to maintain data state
3. **Realistic Data**: Use faker to generate realistic test data
4. **Permission Control**: Simulate user identity through headers
5. **Error Simulation**: Add handling for various error scenarios
