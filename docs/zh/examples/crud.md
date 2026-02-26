# CRUD 完整示例

本示例展示如何使用 `defineMock` 和 `defineMockData` 实现一个完整的 CRUD（增删改查）API。

## 场景描述

实现一个用户管理 API，包含以下功能：
- 获取用户列表（支持分页、搜索、排序）
- 获取单个用户详情
- 创建用户
- 更新用户信息
- 删除用户

## 数据结构

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

## 完整代码

### 1. 定义共享数据

```ts [mock/data/users.ts]
import type { User } from '../types'
import { defineMockData } from 'vite-plugin-mock-dev-server'

// 初始用户数据
const initialUsers: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  }
]

// 创建共享数据
export const users = defineMockData<User[]>('users', initialUsers)

// 辅助函数：生成 ID
export function generateId(): number {
  return Date.now()
}

// 辅助函数：获取当前时间
export function getCurrentTime(): string {
  return new Date().toISOString()
}
```

### 2. Mock API 配置

```ts [mock/users.mock.ts]
import type { User } from './types'
import { defineMock } from 'vite-plugin-mock-dev-server'
import { generateId, getCurrentTime, users } from './data/users'

export default defineMock([
  // ========== 获取用户列表 ==========
  {
    url: '/api/users',
    method: 'GET',
    body: ({ query }) => {
      let result = [...users.value]

      // 搜索过滤
      if (query.keyword) {
        const keyword = String(query.keyword).toLowerCase()
        result = result.filter(user =>
          user.name.toLowerCase().includes(keyword)
          || user.email.toLowerCase().includes(keyword)
        )
      }

      // 角色过滤
      if (query.role) {
        result = result.filter(user => user.role === query.role)
      }

      // 状态过滤
      if (query.status) {
        result = result.filter(user => user.status === query.status)
      }

      // 排序
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

      // 分页
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

  // ========== 获取单个用户 ==========
  {
    url: '/api/users/:id',
    method: 'GET',
    body: ({ params }) => {
      const id = Number(params.id)
      const user = users.value.find(u => u.id === id)

      if (!user) {
        return {
          status: 404,
          body: { message: '用户不存在' }
        }
      }

      return { data: user }
    }
  },

  // ========== 创建用户 ==========
  {
    url: '/api/users',
    method: 'POST',
    delay: 500, // 模拟网络延迟
    body: ({ body }) => {
      // 验证必填字段
      if (!body.name || !body.email) {
        return {
          status: 400,
          body: { message: '姓名和邮箱不能为空' }
        }
      }

      // 检查邮箱是否已存在
      const exists = users.value.some(u => u.email === body.email)
      if (exists) {
        return {
          status: 409,
          body: { message: '邮箱已存在' }
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

      // 添加到数据列表
      users.value = [...users.value, newUser]

      return {
        status: 201,
        body: { data: newUser, message: '创建成功' }
      }
    }
  },

  // ========== 更新用户 ==========
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
          body: { message: '用户不存在' }
        }
      }

      // 检查邮箱是否与其他用户冲突
      if (body.email) {
        const exists = users.value.some(
          (u, i) => i !== index && u.email === body.email
        )
        if (exists) {
          return {
            status: 409,
            body: { message: '邮箱已被其他用户使用' }
          }
        }
      }

      // 更新用户数据
      const updatedUser: User = {
        ...users.value[index],
        ...body,
        id, // ID 不可修改
        updatedAt: getCurrentTime()
      }

      users.value = users.value.map(u => u.id === id ? updatedUser : u)

      return {
        body: { data: updatedUser, message: '更新成功' }
      }
    }
  },

  // ========== 删除用户 ==========
  {
    url: '/api/users/:id',
    method: 'DELETE',
    body: ({ params }) => {
      const id = Number(params.id)
      const index = users.value.findIndex(u => u.id === id)

      if (index === -1) {
        return {
          status: 404,
          body: { message: '用户不存在' }
        }
      }

      // 删除用户
      users.value = users.value.filter(u => u.id !== id)

      return {
        status: 204
      }
    }
  },

  // ========== 批量删除用户 ==========
  {
    url: '/api/users/batch-delete',
    method: 'POST',
    body: ({ body }) => {
      const ids = body.ids as number[]

      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          status: 400,
          body: { message: '请提供要删除的用户ID列表' }
        }
      }

      const beforeCount = users.value.length
      users.value = users.value.filter(u => !ids.includes(u.id))
      const deletedCount = beforeCount - users.value.length

      return {
        body: {
          message: `成功删除 ${deletedCount} 个用户`,
          deletedCount
        }
      }
    }
  },

  // ========== 更新用户状态 ==========
  {
    url: '/api/users/:id/status',
    method: 'PATCH',
    body: ({ params, body }) => {
      const id = Number(params.id)
      const { status } = body

      if (!['active', 'inactive'].includes(status)) {
        return {
          status: 400,
          body: { message: '无效的状态值' }
        }
      }

      const index = users.value.findIndex(u => u.id === id)
      if (index === -1) {
        return {
          status: 404,
          body: { message: '用户不存在' }
        }
      }

      users.value = users.value.map(u =>
        u.id === id
          ? { ...u, status, updatedAt: getCurrentTime() }
          : u
      )

      return {
        body: {
          message: `用户已${status === 'active' ? '启用' : '禁用'}`
        }
      }
    }
  }
])
```

## 前端调用示例

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

// 获取用户列表
export function getUsers(params?: UserListParams) {
  return axios.get<UserListResponse>('/api/users', { params })
}

// 获取单个用户
export function getUser(id: number) {
  return axios.get<{ data: User }>(`/api/users/${id}`)
}

// 创建用户
export function createUser(data: Partial<User>) {
  return axios.post<{ data: User, message: string }>('/api/users', data)
}

// 更新用户
export function updateUser(id: number, data: Partial<User>) {
  return axios.put<{ data: User, message: string }>(`/api/users/${id}`, data)
}

// 删除用户
export function deleteUser(id: number) {
  return axios.delete(`/api/users/${id}`)
}

// 批量删除
export function batchDeleteUsers(ids: number[]) {
  return axios.post('/api/users/batch-delete', { ids })
}

// 更新用户状态
export function updateUserStatus(id: number, status: 'active' | 'inactive') {
  return axios.patch(`/api/users/${id}/status`, { status })
}
```

## 使用示例

```vue [UserManagement.vue]
<template>
  <div class="user-management">
    <!-- 搜索和筛选 -->
    <div class="filters">
      <input v-model="filters.keyword" placeholder="搜索用户..." />
      <select v-model="filters.role">
        <option value="">所有角色</option>
        <option value="admin">管理员</option>
        <option value="user">普通用户</option>
      </select>
      <button @click="fetchUsers">搜索</button>
      <button @click="showCreateModal = true">新增用户</button>
    </div>

    <!-- 用户列表 -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
          <th>操作</th>
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
            <button @click="editUser(user)">编辑</button>
            <button @click="toggleStatus(user)">
              {{ user.status === 'active' ? '禁用' : '启用' }}
            </button>
            <button @click="deleteUser(user.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <button
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        上一页
      </button>
      <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button
        :disabled="pagination.page >= pagination.totalPages"
        @click="changePage(pagination.page + 1)"
      >
        下一页
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

## 关键点说明

1. **数据共享**: 使用 `defineMockData` 确保多个 API 操作共享同一数据源
2. **数据验证**: 在创建和更新时进行必要的字段验证
3. **错误处理**: 返回适当的 HTTP 状态码和错误信息
4. **分页实现**: 服务端分页，减轻前端负担
5. **多条件筛选**: 支持关键词搜索、角色和状态筛选
6. **排序功能**: 支持按字段升序或降序排列
