# Authentication and Authorization Example

This example demonstrates how to implement a JWT-based authentication and authorization system, including login, logout, token refresh, and permission verification.

## Scenario Description

Implement a complete authentication flow:
- User login (verify username and password, return JWT Token)
- Token refresh (use Refresh Token to get a new Access Token)
- User logout (clear Token)
- Protected endpoints (verify Token validity)
- Role-based access control (RBAC)

## Data Structure

```ts
interface User {
  id: number
  username: string
  password: string // Should store hash in real projects
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

## Complete Code

### 1. Shared Data and Utility Functions

```ts [mock/data/auth.ts]
import type { User } from '../types'
import { defineMockData } from 'vite-plugin-mock-dev-server'

// Mock user database
const users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // Should use bcrypt for hashing in production
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

// Token storage (should use Redis in production)
export const tokenStore = defineMockData<Map<string, TokenPayload>>('tokenStore', new Map())

// JWT secret
const JWT_SECRET = 'your-secret-key-change-in-production'
const REFRESH_SECRET = 'your-refresh-secret-key'

// Simple JWT implementation (should use jsonwebtoken library in production)
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, type: 'access' | 'refresh' = 'access'): string {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = type === 'access' ? 3600 : 7 * 24 * 3600 // 1 hour / 7 days

  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }

  // Simplified implementation: Base64 encoding (should use JWT signing in production)
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

### 2. Mock API Configuration

```ts [mock/auth.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'
import {
  findUser,
  findUserById,
  generateToken,
  revokeToken,
  verifyToken
} from './data/auth'

// Authentication middleware
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    res.statusCode = 401
    res.end(JSON.stringify({ message: 'Authentication token not provided' }))
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.statusCode = 401
    res.end(JSON.stringify({ message: 'Token is invalid or expired' }))
    return
  }

  // Attach user info to request
  req.user = payload
  next()
}

// Permission check middleware
function requirePermission(...permissions: string[]) {
  return (req: any, res: any, next: any) => {
    const user = findUserById(req.user.userId)
    if (!user) {
      res.statusCode = 401
      res.end(JSON.stringify({ message: 'User not found' }))
      return
    }

    const hasPermission = permissions.every(p => user.permissions.includes(p))
    if (!hasPermission) {
      res.statusCode = 403
      res.end(JSON.stringify({ message: 'Insufficient permissions' }))
      return
    }

    next()
  }
}

// Role check middleware
function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    const userRoles = req.user.roles || []
    const hasRole = roles.some(r => userRoles.includes(r))

    if (!hasRole) {
      res.statusCode = 403
      res.end(JSON.stringify({ message: 'Specific role permission required' }))
      return
    }

    next()
  }
}

export default defineMock([
  // ========== Login ==========
  {
    url: '/api/auth/login',
    method: 'POST',
    delay: 500,
    body: ({ body }) => {
      const { username, password } = body

      if (!username || !password) {
        return {
          status: 400,
          body: { message: 'Username and password are required' }
        }
      }

      const user = findUser(username, password)
      if (!user) {
        return {
          status: 401,
          body: { message: 'Invalid username or password' }
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
          message: 'Login successful',
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

  // ========== Refresh Token ==========
  {
    url: '/api/auth/refresh',
    method: 'POST',
    body: ({ body }) => {
      const { refreshToken } = body

      if (!refreshToken) {
        return {
          status: 400,
          body: { message: 'Please provide refresh token' }
        }
      }

      const payload = verifyToken(refreshToken)
      if (!payload) {
        return {
          status: 401,
          body: { message: 'Refresh token is invalid or expired' }
        }
      }

      // Revoke old Refresh Token
      revokeToken(refreshToken)

      // Generate new token pair
      const tokenPayload = {
        userId: payload.userId,
        username: payload.username,
        roles: payload.roles
      }

      const newAccessToken = generateToken(tokenPayload, 'access')
      const newRefreshToken = generateToken(tokenPayload, 'refresh')

      return {
        body: {
          message: 'Token refreshed successfully',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600
          }
        }
      }
    }
  },

  // ========== Logout ==========
  {
    url: '/api/auth/logout',
    method: 'POST',
    body: ({ headers }) => {
      const token = headers.authorization?.replace('Bearer ', '')
      if (token) {
        revokeToken(token)
      }

      return {
        body: { message: 'Logout successful' }
      }
    }
  },

  // ========== Get Current User ==========
  {
    url: '/api/auth/me',
    method: 'GET',
    response: (req, res, next) => {
      authMiddleware(req, res, () => {
        const user = findUserById(req.user.userId)
        if (!user) {
          res.statusCode = 404
          res.end(JSON.stringify({ message: 'User not found' }))
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

  // ========== Admin Endpoint Example ==========
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

  // ========== Write Permission Required Endpoint ==========
  {
    url: '/api/posts',
    method: 'POST',
    response: (req, res, next) => {
      authMiddleware(req, res, () => {
        requirePermission('write')(req, res, () => {
          // Process create post logic
          res.end(JSON.stringify({
            message: 'Post created successfully',
            data: { id: Date.now(), author: req.user.username }
          }))
        })
      })
    }
  },

  // ========== Public Endpoint ==========
  {
    url: '/api/public/info',
    method: 'GET',
    body: {
      message: 'This is public information, no authentication required',
      timestamp: Date.now()
    }
  }
])
```

## Frontend Usage Example

```ts [api/auth.ts]
import axios from 'axios'

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api'
})

// Request interceptor: Add Token
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

// Response interceptor: Handle Token expiration
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
        // Refresh failed, clear Token and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Login
export function login(username: string, password: string) {
  return axios.post('/api/auth/login', { username, password })
}

// Logout
export function logout() {
  return apiClient.post('/api/auth/logout')
}

// Get current user
export function getCurrentUser() {
  return apiClient.get('/api/auth/me')
}

// Get admin data
export function getAdminUsers() {
  return apiClient.get('/api/admin/users')
}

// Create post
export function createPost(data: any) {
  return apiClient.post('/api/posts', data)
}
```

## Usage Example

```vue [Login.vue]
<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <h2>Login</h2>
      <input
        v-model="form.username"
        placeholder="Username"
        required
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
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

    // Store Token
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)

    // Redirect to home
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
```

```vue [AdminDashboard.vue]
<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div v-if="user">
      <p>Welcome, {{ user.username }}</p>
      <p>Roles: {{ user.roles.join(', ') }}</p>
      <p>Permissions: {{ user.permissions.join(', ') }}</p>
    </div>

    <h2>User List</h2>
    <table>
      <tr v-for="u in users" :key="u.id">
        <td>{{ u.username }}</td>
        <td>{{ u.email }}</td>
        <td>{{ u.roles.join(', ') }}</td>
      </tr>
    </table>

    <button @click="handleLogout">Logout</button>
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
    console.error('Failed to fetch data', error)
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

## Key Points

1. **Token Management**: Access Token is short-lived, Refresh Token is long-lived
2. **Auto Refresh**: Frontend interceptor automatically handles Token expiration refresh
3. **Permission Control**: Dual verification based on roles and permissions
4. **Middleware Pattern**: Use middleware to implement reusable authentication logic
5. **Security Considerations**: Production environment should use real JWT library and HTTPS
