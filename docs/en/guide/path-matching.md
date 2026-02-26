# Path Matching Rules

This chapter introduces the path matching mechanism in `vite-plugin-mock-dev-server` in detail, helping you precisely control which requests should be mocked.

## Overview

The plugin uses the [path-to-regexp](https://github.com/pillarjs/path-to-regexp) library for path matching, the same library used by mainstream frameworks like Express and Koa, providing powerful and flexible path matching capabilities.

## Basic Matching Rules

### Static Path Matching

The simplest matching method requires an exact URL match:

```ts
export default defineMock({
  url: '/api/users', // Only matches /api/users
  body: { list: [] }
})
```

| Request URL      | Match Result                    |
| ---------------- | ------------------------------- |
| `/api/users`     | ✅ Match                        |
| `/api/users/`    | ❌ No match (note trailing slash) |
| `/api/users/123` | ❌ No match                     |
| `/API/users`     | ❌ No match (case-sensitive)    |

### Dynamic Parameter Matching

Use `:paramName` syntax to capture dynamic parts of the URL:

```ts
export default defineMock({
  url: '/api/users/:id',
  body: ({ params }) => ({
    userId: params.id // Get captured parameter
  })
})
```

| Request URL        | Match Result | params Value    |
| ------------------ | ------------ | --------------- |
| `/api/users/123`   | ✅ Match     | `{ id: '123' }` |
| `/api/users/abc`   | ✅ Match     | `{ id: 'abc' }` |
| `/api/users`       | ❌ No match  | -               |
| `/api/users/123/posts` | ❌ No match | -            |

### Multiple Dynamic Parameters

You can define multiple parameters in a single URL:

```ts
export default defineMock({
  url: '/api/users/:userId/posts/:postId',
  body: ({ params }) => ({
    userId: params.userId,
    postId: params.postId
  })
})
```

| Request URL              | params Value                      |
| ------------------------ | --------------------------------- |
| `/api/users/1/posts/100` | `{ userId: '1', postId: '100' }`  |

## Advanced Matching Rules

### Optional Parameters

Use `{}` to wrap parameters to mark them as optional:

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

| Request URL      | Match Result | params Value    |
| ---------------- | ------------ | --------------- |
| `/api/users`     | ✅ Match     | `{}`            |
| `/api/users/123` | ✅ Match     | `{ id: '123' }` |

### Wildcard Matching

Use `*name` syntax to match one or more path segments:

```ts
export default defineMock({
  url: '/api/files/*path',
  body: ({ params }) => ({
    path: params.path // Array format
  })
})
```

| Request URL                  | params.path            |
| ---------------------------- | ---------------------- |
| `/api/files/docs`            | `['docs']`             |
| `/api/files/docs/guide.md`   | `['docs', 'guide.md']` |

::: tip Zero or More Matches
To match zero or more path segments, wrap the wildcard with an optional group:

```ts
export default defineMock({
  url: '/api/files{/*path}',
  body: ({ params }) => ({
    path: params.path || [] // May be undefined or array
  })
})
```

| Request URL      | params.path |
| ---------------- | ----------- |
| `/api/files`     | `undefined` |
| `/api/files/docs`| `['docs']`  |

:::

### Any Path Matching

Use wildcards to match any path:

```ts
export default defineMock({
  url: '/api/proxy/*path',
  body: ({ params }) => ({
    proxiedPath: params.path?.join('/') // Access using array method
  })
})
```

| Request URL           | params.path       |
| --------------------- | ----------------- |
| `/api/proxy/anything` | `['anything']`    |
| `/api/proxy/a/b/c`    | `['a', 'b', 'c']` |

### Prefix Matching (Regex Form)

Use `^` at the beginning in plugin configuration to indicate regex matching:

```ts
mockDevServerPlugin({
  prefix: [
    '/api', // String prefix
    '^/api/v\\d+/.*', // Regex: matches /api/v1/, /api/v2/, etc.
    '^/graphql$' // Regex: exact match /graphql
  ]
})
```

## Path Matching Priority

When multiple Mock configurations match the same request, the plugin determines priority according to the following rules:

### Default Priority Rules

1. **Static path > Dynamic parameter** - `/api/users` takes precedence over `/api/:id`
2. **Fewer parameters > More parameters** - `/api/a/:b` takes precedence over `/api/:a/:b`
3. **Definition order** - When priority is equal, the one defined first takes precedence

### Example

```ts
export default defineMock([
  {
    url: '/api/users', // Priority 1: static path
    body: 'all users'
  },
  {
    url: '/api/users/:id', // Priority 2: one dynamic parameter
    body: 'single user'
  },
  {
    url: '/api/:resource/:id', // Priority 3: two dynamic parameters
    body: 'generic resource'
  }
])
```

| Request URL      | Matched Configuration    |
| ---------------- | ------------------------ |
| `/api/users`     | `/api/users`             |
| `/api/users/123` | `/api/users/:id`         |
| `/api/posts/123` | `/api/:resource/:id`     |

### Custom Priority

When default rules cannot meet your needs, you can use the `priority` configuration:

```ts
mockDevServerPlugin({
  priority: {
    // Global priority: arranged in order, higher priority comes first
    global: [
      '/api/users/admin', // Highest priority
      '/api/users/:id',
      '/api/:resource/:id'
    ],
    // Special priority rules
    special: {
      '/api/:a/:b/c': {
        rules: ['/api/a/:b/:c'], // When conflicting with these rules
        when: ['/api/a/b/c'] // In these scenarios
      }
    }
  }
})
```

## Real-world Application Scenarios

### Scenario 1: RESTful API Design

```ts
export default defineMock([
  // List and create
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
  // Single resource operations
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
  // Nested resources
  {
    url: '/api/users/:userId/posts',
    body: ({ params }) => ({ userId: params.userId, posts: [] })
  }
])
```

### Scenario 2: File Service

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
      // Handle file download...
    }
  }
])
```

### Scenario 3: Versioned API

```ts
mockDevServerPlugin({
  prefix: [
    '^/api/v\\d+/.*' // Match all versioned APIs
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

## Important Notes

1. **Case-sensitive**: URL matching is case-sensitive, `/api/Users` and `/api/users` are different paths
2. **Trailing slash**: `/api/users` and `/api/users/` are treated as different paths
3. **Parameter types**: All parameter values are strings, you need to manually convert to numbers or other types

## Migration from Old Versions

path-to-regexp v8.x has the following breaking changes compared to older versions:

| Old Version Syntax | v8.x Syntax   | Description                           |
| ------------------ | ------------- | ------------------------------------- |
| `:param?`          | `{/:param}`   | Optional parameters use curly braces  |
| `:param*`          | `{/*param}`   | Zero or more use optional group + wildcard |
| `:param+`          | `/*param`     | One or more use wildcard              |
| `(.*)`             | `/*param`     | Wildcard uses named parameter form    |

## Debugging Tips

Enable debug logging to view the matching process:

```ts
mockDevServerPlugin({
  log: 'debug' // Enable detailed logs
})
```

In the console you will see:

- Request path
- Rules being attempted to match
- Final matching result

This helps troubleshoot path matching issues.
