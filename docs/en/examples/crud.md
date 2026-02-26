# CRUD Complete Example

This example demonstrates how to implement a complete CRUD (Create, Read, Update, Delete) API using `defineMock` and `defineMockData`.

## Scenario Description

Implement a user management API with the following features:
- Get user list (supports pagination, search, sorting)
- Get single user details
- Create user
- Update user information
- Delete user

## Data Structure

```ts
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}
```

## Complete Code

### 1. Define Shared Data

```ts [mock/data/users.ts]
import type { User } from '../types'
import { defineMockData } from 'vite-plugin-mock-dev-server'

// Initial user data
const initialUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 3,
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  }
]

// Create shared data
export const users = defineMockData<User[]>('users', initialUsers)

// Helper function: Generate ID
export function generateId(): number {
  return Date.now()
}

// Helper function: Get current time
export function getCurrentTime(): string {
  return new Date().toISOString()
}
```

### 2. Mock API Configuration

```ts [mock/users.mock.ts]
import type { User } from './types'
import { defineMock } from 'vite-plugin-mock-dev-server'
import { generateId, getCurrentTime, users } from './data/users'

export default defineMock([
  // ========== Get User List ==========
  {
    url: '/api/users',
    method: 'GET',
    body: ({ query }) => {
      let result = [...users.value]

      // Search filter
      if (query.keyword) {
        const keyword = String(query.keyword).toLowerCase()
        result = result.filter(user =>
          user.name.toLowerCase().includes(keyword)
          || user.email.toLowerCase().includes(keyword)
        )
      }

      // Role filter
      if (query.role) {
        result = result.filter(user => user.role === query.role)
      }

      // Status filter
      if (query.status) {
        result = result.filter(user => user.status === query.status)
      }

      // Sorting
      const sortField = query.sortField || 'createdAt'
      const sortOrder = query.sortOrder || 'desc'
      result.sort((a, b) => {
        const aVal = a[sortField as keyof User]
        const bVal = b[sortField as keyof User]
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        }
        return aVal < bVal ? 1 : -1
      })

      // Pagination
      const page = Number(query.page) || 1
      const pageSize = Number(query.pageSize) || 10
      const total = result.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      result = result.slice(start, end)

      return {
        data: result,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }
  },

  // ========== Get Single User ==========
  {
    url: '/api/users/:id',
    method: 'GET',
    body: ({ params }) => {
      const id = Number(params.id)
      const user = users.value.find(u => u.id === id)

      if (!user) {
        return {
          status: 404,
          body: { message: 'User not found' }
        }
      }

      return { data: user }
    }
  },

  // ========== Create User ==========
  {
    url: '/api/users',
    method: 'POST',
    delay: 500, // Simulate network delay
    body: ({ body }) => {
      // Validate required fields
      if (!body.name || !body.email) {
        return {
          status: 400,
          body: { message: 'Name and email are required' }
        }
      }

      // Check if email already exists
      const exists = users.value.some(u => u.email === body.email)
      if (exists) {
        return {
          status: 409,
          body: { message: 'Email already exists' }
        }
      }

      const now = getCurrentTime()
      const newUser: User = {
        id: generateId(),
        name: body.name,
        email: body.email,
        role: body.role || 'user',
        status: body.status || 'active',
        createdAt: now,
        updatedAt: now
      }

      // Add to data list
      users.value = [...users.value, newUser]

      return {
        status: 201,
        body: { data: newUser, message: 'Created successfully' }
      }
    }
  },

  // ========== Update User ==========
  {
    url: '/api/users/:id',
    method: 'PUT',
    delay: 500,
    body: ({ params, body }) => {
      const id = Number(params.id)
      const index = users.value.findIndex(u => u.id === id)

      if (index === -1) {
        return {
          status: 404,
          body: { message: 'User not found' }
        }
      }

      // Check if email conflicts with other users
      if (body.email) {
        const exists = users.value.some(
          (u, i) => i !== index && u.email === body.email
        )
        if (exists) {
          return {
            status: 409,
            body: { message: 'Email is already used by another user' }
          }
        }
      }

      // Update user data
      const updatedUser: User = {
        ...users.value[index],
        ...body,
        id, // ID cannot be modified
        updatedAt: getCurrentTime()
      }

      users.value = users.value.map(u => u.id === id ? updatedUser : u)

      return {
        body: { data: updatedUser, message: 'Updated successfully' }
      }
    }
  },

  // ========== Delete User ==========
  {
    url: '/api/users/:id',
    method: 'DELETE',
    body: ({ params }) => {
      const id = Number(params.id)
      const index = users.value.findIndex(u => u.id === id)

      if (index === -1) {
        return {
          status: 404,
          body: { message: 'User not found' }
        }
      }

      // Delete user
      users.value = users.value.filter(u => u.id !== id)

      return {
        status: 204
      }
    }
  },

  // ========== Batch Delete Users ==========
  {
    url: '/api/users/batch-delete',
    method: 'POST',
    body: ({ body }) => {
      const ids = body.ids as number[]

      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          status: 400,
          body: { message: 'Please provide a list of user IDs to delete' }
        }
      }

      const beforeCount = users.value.length
      users.value = users.value.filter(u => !ids.includes(u.id))
      const deletedCount = beforeCount - users.value.length

      return {
        body: {
          message: `Successfully deleted ${deletedCount} users`,
          deletedCount
        }
      }
    }
  },

  // ========== Update User Status ==========
  {
    url: '/api/users/:id/status',
    method: 'PATCH',
    body: ({ params, body }) => {
      const id = Number(params.id)
      const { status } = body

      if (!['active', 'inactive'].includes(status)) {
        return {
          status: 400,
          body: { message: 'Invalid status value' }
        }
      }

      const index = users.value.findIndex(u => u.id === id)
      if (index === -1) {
        return {
          status: 404,
          body: { message: 'User not found' }
        }
      }

      users.value = users.value.map(u =>
        u.id === id
          ? { ...u, status, updatedAt: getCurrentTime() }
          : u
      )

      return {
        body: {
          message: `User ${status === 'active' ? 'enabled' : 'disabled'}`
        }
      }
    }
  }
])
```

## Frontend Usage Example

```ts [api/users.ts]
import axios from 'axios'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UserListParams {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
  status?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse {
  data: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Get user list
export function getUsers(params?: UserListParams) {
  return axios.get<UserListResponse>('/api/users', { params })
}

// Get single user
export function getUser(id: number) {
  return axios.get<{ data: User }>(`/api/users/${id}`)
}

// Create user
export function createUser(data: Partial<User>) {
  return axios.post<{ data: User, message: string }>('/api/users', data)
}

// Update user
export function updateUser(id: number, data: Partial<User>) {
  return axios.put<{ data: User, message: string }>(`/api/users/${id}`, data)
}

// Delete user
export function deleteUser(id: number) {
  return axios.delete(`/api/users/${id}`)
}

// Batch delete
export function batchDeleteUsers(ids: number[]) {
  return axios.post('/api/users/batch-delete', { ids })
}

// Update user status
export function updateUserStatus(id: number, status: 'active' | 'inactive') {
  return axios.patch(`/api/users/${id}/status`, { status })
}
```

## Usage Example

```vue [UserManagement.vue]
<template>
  <div class="user-management">
    <!-- Search and Filter -->
    <div class="filters">
      <input v-model="filters.keyword" placeholder="Search users..." />
      <select v-model="filters.role">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
      <button @click="fetchUsers">Search</button>
      <button @click="showCreateModal = true">Add User</button>
    </div>

    <!-- User List -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <span :class="user.status">{{ user.status }}</span>
          </td>
          <td>
            <button @click="editUser(user)">Edit</button>
            <button @click="toggleStatus(user)">
              {{ user.status === 'active' ? 'Disable' : 'Enable' }}
            </button>
            <button @click="deleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination">
      <button
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        Previous
      </button>
      <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button
        :disabled="pagination.page >= pagination.totalPages"
        @click="changePage(pagination.page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUsers, deleteUser, updateUserStatus } from './api/users'
import type { User, UserListParams, UserListResponse } from './api/users'

const users = ref<User[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})
const filters = reactive({
  keyword: '',
  role: '',
  status: ''
})

async function fetchUsers() {
  const params: UserListParams = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...filters
  }

  const { data } = await getUsers(params)
  users.value = data.data
  Object.assign(pagination, data.pagination)
}

async function toggleStatus(user: User) {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  await updateUserStatus(user.id, newStatus)
  await fetchUsers()
}

async function handleDelete(id: number) {
  await deleteUser(id)
  await fetchUsers()
}

function changePage(page: number) {
  pagination.page = page
  fetchUsers()
}

onMounted(fetchUsers)
</script>
```

## Key Points

1. **Data Sharing**: Use `defineMockData` to ensure multiple API operations share the same data source
2. **Data Validation**: Perform necessary field validation during creation and update
3. **Error Handling**: Return appropriate HTTP status codes and error messages
4. **Pagination Implementation**: Server-side pagination to reduce frontend burden
5. **Multi-condition Filtering**: Support keyword search, role and status filtering
6. **Sorting Functionality**: Support ascending or descending order by field
