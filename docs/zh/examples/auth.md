# 认证授权示例

本示例展示如何实现基于 JWT 的认证授权系统，包括登录、登出、Token 刷新和权限验证。

## 场景描述

实现完整的认证流程：
- 用户登录（验证用户名密码，返回 JWT Token）
- Token 刷新（使用 Refresh Token 获取新的 Access Token）
- 用户登出（清除 Token）
- 受保护接口（验证 Token 有效性）
- 角色权限控制（基于角色的访问控制）

## 数据结构

```ts
interface User {
  id: number
  username: string
  password: string // 实际项目中应存储哈希值
  email: string
  roles: string[]
  permissions: string[]
}

interface TokenPayload {
  userId: number
  username: string
  roles: string[]
  iat: number
  exp: number
}
```

## 完整代码

### 1. 共享数据和工具函数

```ts [mock/data/auth.ts]
import type { User } from '../types'
import { defineMockData } from 'vite-plugin-mock-dev-server'

// 模拟用户数据库
const users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // 实际应使用 bcrypt 等哈希
    email: 'admin@example.com',
    roles: ['admin', 'user'],
    permissions: ['read', 'write', 'delete', 'manage']
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    roles: ['user'],
    permissions: ['read']
  },
  {
    id: 3,
    username: 'editor',
    password: 'editor123',
    email: 'editor@example.com',
    roles: ['editor', 'user'],
    permissions: ['read', 'write']
  }
]

export const userDatabase = defineMockData<User[]>('users', users)

// Token 存储（生产环境应使用 Redis）
export const tokenStore = defineMockData<Map<string, TokenPayload>>('tokenStore', new Map())

// JWT 密钥
const JWT_SECRET = 'your-secret-key-change-in-production'
const REFRESH_SECRET = 'your-refresh-secret-key'

// 简单的 JWT 实现（实际项目应使用 jsonwebtoken 库）
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, type: 'access' | 'refresh' = 'access'): string {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = type === 'access' ? 3600 : 7 * 24 * 3600 // 1小时 / 7天

  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }

  // 简化实现：Base64 编码（实际应使用 JWT 签名）
  const token = btoa(JSON.stringify(tokenPayload))
  tokenStore.value.set(token, tokenPayload)

  return token
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = tokenStore.value.get(token)
    if (!payload)
      return null

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      tokenStore.value.delete(token)
      return null
    }

    return payload
  }
  catch {
    return null
  }
}

export function revokeToken(token: string): void {
  tokenStore.value.delete(token)
}

export function findUser(username: string, password: string): User | undefined {
  return userDatabase.value.find(
    u => u.username === username && u.password === password
  )
}

export function findUserById(id: number): User | undefined {
  return userDatabase.value.find(u => u.id === id)
}
```

### 2. Mock API 配置

```ts [mock/auth.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import {
  findUser,
  findUserById,
  generateToken,
  revokeToken,
  verifyToken
} from './data/auth'

// 认证中间件
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    res.statusCode = 401
    res.end(JSON.stringify({ message: '未提供认证令牌' }))
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.statusCode = 401
    res.end(JSON.stringify({ message: '令牌无效或已过期' }))
    return
  }

  // 将用户信息附加到请求
  req.user = payload
  next()
}

// 权限检查中间件
function requirePermission(...permissions: string[]) {
  return (req: any, res: any, next: any) => {
    const user = findUserById(req.user.userId)
    if (!user) {
      res.statusCode = 401
      res.end(JSON.stringify({ message: '用户不存在' }))
      return
    }

    const hasPermission = permissions.every(p => user.permissions.includes(p))
    if (!hasPermission) {
      res.statusCode = 403
      res.end(JSON.stringify({ message: '权限不足' }))
      return
    }

    next()
  }
}

// 角色检查中间件
function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    const userRoles = req.user.roles || []
    const hasRole = roles.some(r => userRoles.includes(r))

    if (!hasRole) {
      res.statusCode = 403
      res.end(JSON.stringify({ message: '需要特定角色权限' }))
      return
    }

    next()
  }
}

export default defineMock([
  // ========== 登录 ==========
  {
    url: '/api/auth/login',
    method: 'POST',
    delay: 500,
    body: ({ body }) => {
      const { username, password } = body

      if (!username || !password) {
        return {
          status: 400,
          body: { message: '用户名和密码不能为空' }
        }
      }

      const user = findUser(username, password)
      if (!user) {
        return {
          status: 401,
          body: { message: '用户名或密码错误' }
        }
      }

      const tokenPayload = {
        userId: user.id,
        username: user.username,
        roles: user.roles
      }

      const accessToken = generateToken(tokenPayload, 'access')
      const refreshToken = generateToken(tokenPayload, 'refresh')

      return {
        body: {
          message: '登录成功',
          data: {
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              roles: user.roles
            }
          }
        }
      }
    }
  },

  // ========== 刷新 Token ==========
  {
    url: '/api/auth/refresh',
    method: 'POST',
    body: ({ body }) => {
      const { refreshToken } = body

      if (!refreshToken) {
        return {
          status: 400,
          body: { message: '请提供刷新令牌' }
        }
      }

      const payload = verifyToken(refreshToken)
      if (!payload) {
        return {
          status: 401,
          body: { message: '刷新令牌无效或已过期' }
        }
      }

      // 吊销旧的 Refresh Token
      revokeToken(refreshToken)

      // 生成新的 Token 对
      const tokenPayload = {
        userId: payload.userId,
        username: payload.username,
        roles: payload.roles
      }

      const newAccessToken = generateToken(tokenPayload, 'access')
      const newRefreshToken = generateToken(tokenPayload, 'refresh')

      return {
        body: {
          message: '令牌刷新成功',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600
          }
        }
      }
    }
  },

  // ========== 登出 ==========
  {
    url: '/api/auth/logout',
    method: 'POST',
    body: ({ headers }) => {
      const token = headers.authorization?.replace('Bearer ', '')
      if (token) {
        revokeToken(token)
      }

      return {
        body: { message: '登出成功' }
      }
    }
  },

  // ========== 获取当前用户信息 ==========
  {
    url: '/api/auth/me',
    method: 'GET',
    response: (req, res, next) => {
      authMiddleware(req, res, () => {
        const user = findUserById(req.user.userId)
        if (!user) {
          res.statusCode = 404
          res.end(JSON.stringify({ message: '用户不存在' }))
          return
        }

        res.end(JSON.stringify({
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions
          }
        }))
      })
    }
  },

  // ========== 管理员接口示例 ==========
  {
    url: '/api/admin/users',
    method: 'GET',
    response: (req, res, next) => {
      authMiddleware(req, res, () => {
        requireRole('admin')(req, res, () => {
          const users = userDatabase.value.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            roles: u.roles
          }))

          res.end(JSON.stringify({ data: users }))
        })
      })
    }
  },

  // ========== 需要写权限的接口 ==========
  {
    url: '/api/posts',
    method: 'POST',
    response: (req, res, next) => {
      authMiddleware(req, res, () => {
        requirePermission('write')(req, res, () => {
          // 处理创建文章逻辑
          res.end(JSON.stringify({
            message: '文章创建成功',
            data: { id: Date.now(), author: req.user.username }
          }))
        })
      })
    }
  },

  // ========== 公开接口 ==========
  {
    url: '/api/public/info',
    method: 'GET',
    body: {
      message: '这是公开信息，无需认证',
      timestamp: Date.now()
    }
  }
])
```

## 前端调用示例

```ts [api/auth.ts]
import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api'
})

// 请求拦截器：添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：处理 Token 过期
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })

        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
        return apiClient(originalRequest)
      }
      catch (refreshError) {
        // 刷新失败，清除 Token 并跳转登录
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// 登录
export function login(username: string, password: string) {
  return axios.post('/api/auth/login', { username, password })
}

// 登出
export function logout() {
  return apiClient.post('/api/auth/logout')
}

// 获取当前用户
export function getCurrentUser() {
  return apiClient.get('/api/auth/me')
}

// 获取管理员数据
export function getAdminUsers() {
  return apiClient.get('/api/admin/users')
}

// 创建文章
export function createPost(data: any) {
  return apiClient.post('/api/posts', data)
}
```

## 使用示例

```vue [Login.vue]
<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <h2>登录</h2>
      <input
        v-model="form.username"
        placeholder="用户名"
        required
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="密码"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from './api/auth'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: ''
})

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await login(form.username, form.password)

    // 存储 Token
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)

    // 跳转到首页
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
```

```vue [AdminDashboard.vue]
<template>
  <div class="admin-dashboard">
    <h1>管理员面板</h1>
    <div v-if="user">
      <p>欢迎，{{ user.username }}</p>
      <p>角色：{{ user.roles.join(', ') }}</p>
      <p>权限：{{ user.permissions.join(', ') }}</p>
    </div>

    <h2>用户列表</h2>
    <table>
      <tr v-for="u in users" :key="u.id">
        <td>{{ u.username }}</td>
        <td>{{ u.email }}</td>
        <td>{{ u.roles.join(', ') }}</td>
      </tr>
    </table>

    <button @click="handleLogout">登出</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getAdminUsers, logout } from './api/auth'

const router = useRouter()
const user = ref(null)
const users = ref([])

onMounted(async () => {
  try {
    const [{ data: userData }, { data: usersData }] = await Promise.all([
      getCurrentUser(),
      getAdminUsers()
    ])
    user.value = userData.data
    users.value = usersData.data
  } catch (error) {
    console.error('获取数据失败', error)
  }
})

async function handleLogout() {
  await logout()
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>
```

## 关键点说明

1. **Token 管理**: Access Token 短期有效，Refresh Token 长期有效
2. **自动刷新**: 前端拦截器自动处理 Token 过期刷新
3. **权限控制**: 基于角色和权限的双重验证
4. **中间件模式**: 使用中间件实现可复用的认证逻辑
5. **安全考虑**: 生产环境应使用真正的 JWT 库和 HTTPS
