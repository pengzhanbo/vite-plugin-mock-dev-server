# 路径匹配规则

本章节详细介绍 `vite-plugin-mock-dev-server` 中的路径匹配机制，帮助你精确控制哪些请求应该被 Mock。

## 概述

插件使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 库进行路径匹配，这是 Express 和 Koa 等主流框架使用的同款库，提供了强大而灵活的路径匹配能力。

## 基础匹配规则

### 静态路径匹配

最简单的匹配方式，URL 必须完全匹配：

```ts
export default defineMock({
  url: '/api/users', // 只匹配 /api/users
  body: { list: [] }
})
```

| 请求 URL         | 是否匹配                  |
| ---------------- | ------------------------- |
| `/api/users`     | ✅ 匹配                   |
| `/api/users/`    | ❌ 不匹配（注意尾部斜杠） |
| `/api/users/123` | ❌ 不匹配                 |
| `/API/users`     | ❌ 不匹配（大小写敏感）   |

### 动态参数匹配

使用 `:paramName` 语法捕获 URL 中的动态部分：

```ts
export default defineMock({
  url: '/api/users/:id',
  body: ({ params }) => ({
    userId: params.id // 获取捕获的参数
  })
})
```

| 请求 URL               | 是否匹配  | params 值       |
| ---------------------- | --------- | --------------- |
| `/api/users/123`       | ✅ 匹配   | `{ id: '123' }` |
| `/api/users/abc`       | ✅ 匹配   | `{ id: 'abc' }` |
| `/api/users`           | ❌ 不匹配 | -               |
| `/api/users/123/posts` | ❌ 不匹配 | -               |

### 多个动态参数

可以在一个 URL 中定义多个参数：

```ts
export default defineMock({
  url: '/api/users/:userId/posts/:postId',
  body: ({ params }) => ({
    userId: params.userId,
    postId: params.postId
  })
})
```

| 请求 URL                 | params 值                        |
| ------------------------ | -------------------------------- |
| `/api/users/1/posts/100` | `{ userId: '1', postId: '100' }` |

## 高级匹配规则

### 可选参数

使用 `{}` 包裹参数标记为可选：

```ts
export default defineMock({
  url: '/api/users{/:id}',
  body: ({ params }) => {
    if (params.id) {
      return { type: 'single', id: params.id }
    }
    return { type: 'list', users: [] }
  }
})
```

| 请求 URL         | 是否匹配  | params 值       |
| ---------------- | --------- | --------------- |
| `/api/users`     | ✅ 匹配   | `{}`            |
| `/api/users/123` | ✅ 匹配   | `{ id: '123' }` |

### 通配符匹配

使用 `*name` 语法匹配一个或多个路径段：

```ts
export default defineMock({
  url: '/api/files/*path',
  body: ({ params }) => ({
    path: params.path // 数组形式
  })
})
```

| 请求 URL                   | params.path            |
| -------------------------- | ---------------------- |
| `/api/files/docs`          | `['docs']`             |
| `/api/files/docs/guide.md` | `['docs', 'guide.md']` |

::: tip 零个或多个匹配
如需匹配零个或多个路径段，请使用可选组包裹通配符：

```ts
export default defineMock({
  url: '/api/files{/*path}',
  body: ({ params }) => ({
    path: params.path || [] // 可能是 undefined 或数组
  })
})
```

| 请求 URL          | params.path |
| ----------------- | ----------- |
| `/api/files`      | `undefined` |
| `/api/files/docs` | `['docs']`  |

:::

### 任意路径匹配

使用通配符匹配任意路径：

```ts
export default defineMock({
  url: '/api/proxy/*path',
  body: ({ params }) => ({
    proxiedPath: params.path?.join('/') // 使用数组方法访问
  })
})
```

| 请求 URL              | params.path       |
| --------------------- | ----------------- |
| `/api/proxy/anything` | `['anything']`    |
| `/api/proxy/a/b/c`    | `['a', 'b', 'c']` |

### 前缀匹配（正则形式）

在插件配置中使用 `^` 开头表示正则匹配：

```ts
mockDevServerPlugin({
  prefix: [
    '/api', // 字符串前缀
    '^/api/v\\d+/.*', // 正则：匹配 /api/v1/, /api/v2/ 等
    '^/graphql$' // 正则：精确匹配 /graphql
  ]
})
```

## 路径匹配优先级

当多个 Mock 配置匹配同一个请求时，插件按以下规则确定优先级：

### 默认优先级规则

1. **静态路径 > 动态参数** - `/api/users` 优先于 `/api/:id`
2. **更少参数 > 更多参数** - `/api/a/:b` 优先于 `/api/:a/:b`
3. **定义顺序** - 相同优先级时，先定义的优先

### 示例

```ts
export default defineMock([
  {
    url: '/api/users', // 优先级 1：静态路径
    body: 'all users'
  },
  {
    url: '/api/users/:id', // 优先级 2：一个动态参数
    body: 'single user'
  },
  {
    url: '/api/:resource/:id', // 优先级 3：两个动态参数
    body: 'generic resource'
  }
])
```

| 请求 URL         | 匹配的配置           |
| ---------------- | -------------------- |
| `/api/users`     | `/api/users`         |
| `/api/users/123` | `/api/users/:id`     |
| `/api/posts/123` | `/api/:resource/:id` |

### 自定义优先级

当默认规则无法满足需求时，可以使用 `priority` 配置：

```ts
mockDevServerPlugin({
  priority: {
    // 全局优先级：按顺序排列，靠前的优先级更高
    global: [
      '/api/users/admin', // 最高优先级
      '/api/users/:id',
      '/api/:resource/:id'
    ],
    // 特殊优先级规则
    special: {
      '/api/:a/:b/c': {
        rules: ['/api/a/:b/:c'], // 当与这些规则冲突时
        when: ['/api/a/b/c'] // 在这些场景下
      }
    }
  }
})
```

## 实际应用场景

### 场景 1：RESTful API 设计

```ts
export default defineMock([
  // 列表和创建
  {
    url: '/api/users',
    method: 'GET',
    body: { users: [] }
  },
  {
    url: '/api/users',
    method: 'POST',
    body: ({ body }) => ({ id: Date.now(), ...body })
  },
  // 单个资源操作
  {
    url: '/api/users/:id',
    method: 'GET',
    body: ({ params }) => ({ id: params.id })
  },
  {
    url: '/api/users/:id',
    method: 'PUT',
    body: ({ params, body }) => ({ id: params.id, ...body })
  },
  {
    url: '/api/users/:id',
    method: 'DELETE',
    status: 204
  },
  // 嵌套资源
  {
    url: '/api/users/:userId/posts',
    body: ({ params }) => ({ userId: params.userId, posts: [] })
  }
])
```

### 场景 2：文件服务

```ts
export default defineMock([
  {
    url: '/api/files/:type(images|documents|videos)/:name',
    body: ({ params }) => ({
      type: params.type,
      filename: params.name
    })
  },
  {
    url: '/api/download/*path',
    response: (req, res) => {
      const filePath = req.params.path?.join('/')
      // 处理文件下载...
    }
  }
])
```

### 场景 3：版本控制 API

```ts
mockDevServerPlugin({
  prefix: [
    '^/api/v\\d+/.*' // 匹配所有版本化的 API
  ]
})

export default defineMock([
  {
    url: '/api/v1/users',
    body: { version: 'v1', users: [] }
  },
  {
    url: '/api/v2/users',
    body: { version: 'v2', users: [], meta: {} }
  }
])
```

## 注意事项

1. **大小写敏感**: URL 匹配是大小写敏感的，`/api/Users` 和 `/api/users` 是不同的路径
2. **尾部斜杠**: `/api/users` 和 `/api/users/` 被视为不同路径
3. **参数类型**: 所有参数值都是字符串，需要手动转换为数字或其他类型

## 从旧版本迁移

path-to-regexp v8.x 与旧版本相比有以下破坏性变更：

| 旧版本语法 | v8.x 语法   | 说明                        |
| ---------- | ----------- | --------------------------- |
| `:param?`  | `{/:param}` | 可选参数使用花括号包裹      |
| `:param*`  | `{/*param}` | 零个或多个使用可选组+通配符 |
| `:param+`  | `/*param`   | 一个或多个使用通配符        |
| `(.*)`     | `/*param`   | 通配符使用命名参数形式      |

## 调试技巧

开启调试日志查看匹配过程：

```ts
mockDevServerPlugin({
  log: 'debug' // 启用详细日志
})
```

在控制台中你将看到：

- 请求路径
- 尝试匹配的规则
- 最终匹配的结果

这有助于排查路径匹配问题。
