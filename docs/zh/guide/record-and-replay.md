# 请求录制与回放

## 功能概述

请求录制与回放是 `vite-plugin-mock-dev-server` 提供的高级功能，允许开发者在开发过程中自动捕获真实后端API响应，并在后续开发中回放这些录制数据。该功能提供"一次录制，随时使用"的mock数据方案，有效解决后端服务不稳定或尚未就绪时的开发痛点。

### 核心价值

- **降低前后端依赖**：后端服务未就绪时，前端可基于录制的真实数据进行开发
- **提升开发稳定性**：后端服务不稳定或不可用时，使用录制数据保障开发连续性
- **便于团队协作**：录制的真实数据可在团队内共享，统一开发环境
- **简化API对接**：录制真实响应后，前端调试可不重复请求后端

## 使用场景

### 场景1：后端服务未就绪

项目开发初期，后端API接口可能尚未开发完成。此时：

1. 先使用mock数据进行前端页面开发
2. 后端接口就绪后开启录制，捕获真实响应
3. 后续开发可直接使用录制的真实数据，无需等待后端服务

### 场景2：后端服务不稳定

当后端服务偶发不可用、响应缓慢或返回不一致数据时：

1. 在服务稳定时录制关键API的响应数据
2. 服务不稳定时自动切换至录制数据回放模式
3. 保障前端开发的连续性和稳定性

### 场景3：团队协作与数据共享

团队成员需要统一的mock数据环境：

1. 录制关键业务接口的真实响应数据
2. 将录制文件提交至版本控制系统
3. 其他成员可直接使用录制数据进行开发

### 场景4：离线开发与演示

需要在无网络环境工作或进行演示时：

1. 提前录制所需API的响应数据
2. 离线状态下使用录制数据进行开发和演示
3. 保障演示环境的数据稳定性和一致性

## 工作流程

### 三阶段工作流

```txt
阶段1：Mock开发阶段（后端未就绪）
┌─────────────────────────────────────────────────────────┐
│  前端请求 → Mock数据匹配 → 返回Mock                     │
│                                                         │
│  插件优先匹配mock文件配置                               │
│  返回预定义的mock数据                                   │
│  录制功能可保持开启但此时不会实际生成录制数据           │
└─────────────────────────────────────────────────────────┘

阶段2：录制阶段（后端就绪）
┌─────────────────────────────────────────────────────────┐
│  1. 开启录制：record: true                              │
│                                                         │
│  2. 请求处理流程：                                      │
│     前端请求 → Mock匹配失败 → 查找录制                  │
│                                    ↓                    │
│                                  无录制 → 代理转发      │
│                                              ↓          │
│                                       后端返回真实响应  │
│                                              ↓          │
│                                         自动录制响应    │
│                                              ↓          │
│                                          返回前端       │
│                                                         │
│  3. 录制文件自动生成至目录                              │
└─────────────────────────────────────────────────────────┘

阶段3：回放阶段（后端不稳定/离线）
┌─────────────────────────────────────────────────────────┐
│  请求处理流程：                                         │
│  前端请求 → Mock匹配失败 → 查找录制                     │
│                                    ↓                    │
│                            有录制 → 使用录制数据        │
│                            无录制 → 降级至代理          │
│                                                         │
│  录制数据有效时优先使用，过期后自动清理                 │
└─────────────────────────────────────────────────────────┘
```

### 请求处理优先级

```txt
请求到达
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Mock数据匹配                     │
│    - 匹配成功 → 使用Mock数据        │
│    - 匹配失败 → 继续                │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. 录制数据查找（回放开启时）       │
│    - 找到有效录制 → 使用录制        │
│    - 未找到/过期 → 继续             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. 代理转发（录制开启时记录）       │
│    - 转发至后端服务                 │
│    - 自动记录响应                   │
└─────────────────────────────────────┘
```

## 配置说明

### 快速启用

一键开启录制与回放的最简方式：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      record: true
    })
  ]
})
```

当`record`设为`true`时，插件将以默认配置启用录制：

- 录制功能开启
- 回放功能自动开启
- 录制数据存储于`mock/.recordings`目录

### 完整配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // 录制配置
      record: {
        enabled: true, // 启用录制功能
        dir: 'mock/.recordings', // 录制数据存储目录
        overwrite: true, // 覆盖已有录制数据
        expires: 0, // 录制数据过期时间(秒)
        status: [], // 需要录制的状态码
        filter: { // 请求过滤配置
          mode: 'glob',
          include: ['/api/**'],
          exclude: ['/api/auth/**']
        },
        gitignore: true // 添加.gitignore
      },
      // 回放配置(可选，默认开启)
      replay: true
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080' // 后端服务地址
    }
  }
})
```

### 配置选项

#### `record.enabled`

- **类型**：`boolean`
- **默认**：`false`
- **说明**：是否启用录制功能。设为`true`时，插件会自动记录通过Proxy转发的请求响应。

#### `record.dir`

- **类型**：`string`
- **默认**：`'mock/.recordings'`
- **说明**：录制数据存储目录，路径相对于项目根目录。插件会自动创建该目录。

#### `record.overwrite`

- **类型**：`boolean`
- **默认**：`true`
- **说明**：是否覆盖已有录制数据。
  - `true`：相同请求的新响应会覆盖旧数据
  - `false`：保留旧数据，不记录新数据

#### `record.expires`

- **类型**：`number`
- **默认**：`0`
- **说明**：录制数据过期时间(秒)。
  - `0`：永不过期
  - 正数：指定秒数后过期，录制新数据时会自动清理过期数据

#### `record.status`

- **类型**：`number | number[]`
- **默认**：`[]`
- **说明**：需要录制的HTTP状态码。
  - 空数组：记录所有状态码
  - 指定状态码：仅记录指定状态码

#### `record.filter`

- **类型**：`((req: RecordedReq) => boolean) | { include?: string | string[], exclude?: string | string[], mode: 'glob' | 'path-to-regexp' }`
- **默认**：记录所有请求
- **说明**：过滤需要记录的请求。

**函数模式**：

```ts
export default {
  record: {
    filter: (req) => {
    // 仅记录GET请求
      return req.method === 'GET'
    }
  }
}
```

**对象模式**：

```ts
export default {
  record: {
    filter: {
      mode: 'glob', // 或'path-to-regexp'
      include: ['/api/**'], // 包含路径
      exclude: ['/api/auth/**'] // 排除路径
    }
  }
}
```

#### `record.gitignore`

- **类型**：`boolean`
- **默认**：`true`
- **说明**：是否在录制目录自动添加`.gitignore`文件(内容：`*`)，防止录制数据意外提交至版本控制。

#### `replay`

- **类型**：`boolean`
- **默认**：`true`(当`record.enabled`为`true`时)
- **说明**：是否启用回放功能。可独立控制回放，例如仅回放不录制：

```ts
export default {
  record: { enabled: false }, // 不录制新数据
  replay: true // 但使用已有录制数据
}
```

## 录制文件

### 存储结构

录制数据默认存储在`mock/.recordings/`目录下，按请求路径组织：

```txt
项目根目录/
├── mock/
│   ├── .recordings/              # 录制数据目录
│   │   ├── .gitignore            # 自动生成的gitignore文件
│   │   ├── api-users.json        # GET /api/users的录制数据
│   │   ├── api-users-id.json     # GET /api/users/:id的录制数据
│   │   └── api-login.json        # POST /api/login的录制数据
│   └── *.mock.ts                 # mock文件
└── vite.config.ts
```

### 文件命名规则

录制文件使用请求路径的kebab-case格式命名：

```txt
规则：{kebab-case(pathname)}.json

示例：
- /api/users          → api-users.json
- /api/users/:id      → api-users-id.json
- /api/user/profile   → api-user-profile.json
```

### 文件内容格式

```json
[
  {
    "meta": {
      "timestamp": 1704067200000,
      "createAt": "2024/1/1 00:00:00",
      "filepath": "mock/.recordings/api-users.json",
      "referer": "http://localhost:5173/"
    },
    "req": {
      "method": "GET",
      "pathname": "/api/users",
      "query": { "page": "1", "size": "10" },
      "body": null,
      "bodyType": ""
    },
    "res": {
      "status": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json"
      },
      "body": "[{\"id\":1,\"name\":\"John\"}]"
    }
  }
]
```

### 数据结构说明

#### `meta` - 元数据

| 字段        | 类型     | 说明             |
| ----------- | -------- | ---------------- |
| `timestamp` | `number` | 录制时间戳(毫秒) |
| `createAt`  | `string` | 格式化的录制时间 |
| `filepath`  | `string` | 录制文件路径     |
| `referer`   | `string` | 请求来源页面     |

#### `req` - 请求数据

| 字段       | 类型      | 说明                             |
| ---------- | --------- | -------------------------------- |
| `method`   | `string`  | HTTP方法(GET/POST/PUT/DELETE等)  |
| `pathname` | `string`  | 请求路径                         |
| `query`    | `object`  | URL查询参数                      |
| `body`     | `unknown` | 请求体数据                       |
| `bodyType` | `string`  | 请求体类型(如`application/json`) |

#### `res` - 响应数据

| 字段         | 类型     | 说明                            |
| ------------ | -------- | ------------------------------- |
| `status`     | `number` | HTTP状态码                      |
| `statusText` | `string` | 状态文本                        |
| `headers`    | `object` | 响应头(已过滤动态头)            |
| `body`       | `string` | 响应体(文本UTF-8，二进制Base64) |

## 响应头过滤

录制时会自动过滤以下动态或环境相关的响应头，确保录制数据的可移植性：

### 过滤的响应头类别

1. **日期时间相关**(每次请求变化)
   - `date`, `expires`, `last-modified`

2. **服务器信息**(环境相关)
   - `server`, `x-powered-by`, `x-aspnet-version`, `x-nginx-version`, `via`

3. **缓存控制**(回放时不需要)
   - `cache-control`, `etag`, `age`

4. **连接相关**(回放环境不同)
   - `connection`, `keep-alive`, `proxy-authenticate`, `proxy-authorization`

5. **CORS相关**(回放环境不同)
   - `access-control-allow-origin`, `access-control-allow-credentials`等

6. **动态标识符**(每次请求唯一)
   - `x-request-id`, `x-correlation-id`, `x-trace-id`, `cf-ray`等

## 请求匹配机制

回放时使用精确匹配算法判断是否使用录制数据：

### 匹配条件

两个请求被视为相同的条件：

1. **相同pathname** - `pathname`完全匹配
2. **相同HTTP方法** - `method`匹配
3. **相同body类型** - `bodyType`匹配
4. **相同查询参数** - `query`深度相等
5. **相同body** - `body`深度相等(Buffer使用字节比较)

### 匹配示例

```txt
// 录制时的请求
{
  method: 'GET',
  pathname: '/api/users',
  query: { page: '1', size: '10' },
  body: null
}

// 此请求会匹配
{
  method: 'GET',
  pathname: '/api/users',
  query: { page: '1', size: '10' },
  body: null
}

// 此请求不会匹配(查询参数不同)
{
  method: 'GET',
  pathname: '/api/users',
  query: { page: '2', size: '10' },
  body: null
}
```

## 使用示例

### 示例1：基础用法

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: true // 一键开启录制与回放
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### 示例2：按状态码过滤

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: {
        enabled: true,
        status: [200, 201], // 仅记录成功响应
        overwrite: true
      }
    })
  ]
})
```

### 示例3：使用Glob过滤请求

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: {
        enabled: true,
        filter: {
          mode: 'glob',
          include: ['/api/users/**', '/api/orders/**'], // 仅记录用户和订单API
          exclude: ['/api/users/sensitive/**'] // 排除敏感API
        }
      }
    })
  ]
})
```

### 示例4：使用path-to-regexp过滤

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: {
        enabled: true,
        filter: {
          mode: 'path-to-regexp',
          include: ['/api/:resource/:id'], // 匹配/api/users/123
          exclude: ['/api/auth/:action'] // 排除鉴权相关
        }
      }
    })
  ]
})
```

### 示例5：自定义过滤函数

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: {
        enabled: true,
        filter: (req) => {
          // 仅记录GET请求且不包含敏感信息的路径
          return req.method === 'GET' && !req.pathname.includes('sensitive')
        }
      }
    })
  ]
})
```

### 示例6：设置过期时间

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: {
        enabled: true,
        expires: 86400, // 录制数据24小时后过期
        overwrite: true
      }
    })
  ]
})
```

### 示例7：仅回放不录制

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: { enabled: false }, // 不录制新数据
      replay: true // 但使用已有录制数据
    })
  ]
})
```

### 示例8：自定义存储目录

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: {
        enabled: true,
        dir: 'recordings/api', // 自定义存储目录
        overwrite: false, // 不覆盖已有录制
        gitignore: false // 不自动生成.gitignore
      }
    })
  ]
})
```

## 最佳实践

### 1. 开发阶段策略

```txt
早期开发（后端未就绪）
  ↓ 使用模拟数据进行快速开发
集成阶段（后端就绪）
  ↓ 开启录制功能捕获真实响应
稳定阶段（后端稳定）
  ↓ 可关闭录制，使用录制数据或模拟数据
```

### 2. 团队协作规范

- **录制核心接口**：将关键业务接口的录制文件提交版本管理
- **敏感数据处理**：避免录制包含敏感信息的接口（如登录、支付）
- **定期更新**：周期性重新录制以同步后端接口变更

### 3. 版本控制建议

```sh
# .gitignore
# 插件默认自动添加，如需手动配置：
mock/.recordings/*
!mock/.recordings/.gitkeep
```

提交录制数据至版本控制：

```ts
// vite.config.ts
export default {
  record: {
    enabled: true,
    gitignore: false // 禁止自动生成.gitignore
  }
}
```

### 4. 性能优化

- 录制性能影响极小，仅在Proxy响应时保存数据
- 使用`filter`配置仅录制必要请求
- 设置合理的`expires`时间自动清理过期数据

### 5. 安全注意事项

- 避免录制含敏感信息的接口（密码、令牌、个人信息等）
- 使用`filter.exclude`排除敏感路径
- 录制文件默认被`.gitignore`排除，防止误提交

## 常见问题

### Q: 为什么没有生成录制文件？

**可能原因**：

1. 未设置`record.enabled=true`
2. 请求未经过Proxy（Mock匹配优先）
3. 请求被`filter`过滤
4. 响应状态码不符合`status`配置

**排查方法**：

```ts
export default {
  record: {
    enabled: true,
    filter: (req) => {
      console.log('录制请求:', req.pathname)
      return true // 临时返回true测试
    }
  }
}
```

### Q: 为什么录制的数据没有回放？

**可能原因**：

1. `replay`设为`false`
2. 录制数据已过期（超过`expires`设置）
3. 请求匹配失败（路径、参数或Body不匹配）
4. Mock数据匹配成功（Mock优先级更高）

### Q: 如何清理全部录制数据？

直接删除录制目录：

```bash
rm -rf mock/.recordings
```

或在配置中设置1秒过期后重新录制：
```ts
export default {
  record: {
    enabled: true,
    expires: 1 // 1秒后过期
  }
}
```

### Q: 录制数据占用空间过大怎么办？

1. 使用`filter`仅录制必要接口
2. 设置合理的`expires`时间
3. 定期手动清理录制目录
4. 避免录制返回大文件的接口

### Q: 是否支持WebSocket录制？

当前版本不支持WebSocket请求的录制与回放，仅支持HTTP/HTTPS请求。

## 与其他功能的关系

### 与Mock数据的优先级

Mock数据 > 录制数据 > 代理转发

```ts
// 如果mock文件中有匹配配置
export default defineMock({
  url: '/api/users',
  body: { list: [] } // Mock数据优先
})

// 即使存在录制数据，也会使用上述Mock配置
```

### 与代理配置的关系

录制功能依赖Vite的`server.proxy`配置：

```ts
export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      record: true
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080' // 录制会拦截此代理
    }
  }
})
```

### 与构建功能的集成

构建独立Mock服务时可选择包含录制文件：

```ts
mockDevServerPlugin({
  record: { enabled: true },
  build: {
    includeRecord: true // 构建产物包含录制文件
  }
})
```
