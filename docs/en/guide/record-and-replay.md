# Request Record and Replay

## Feature Overview

Request Record and Replay is an advanced feature provided by `vite-plugin-mock-dev-server` that allows developers to automatically capture real backend API responses during development and replay these recorded data in subsequent development. This feature provides a "record once, use anytime" mock data solution, effectively addressing development pain points when backend services are unstable or not yet ready.

### Core Values

- **Reduce Frontend-Backend Dependency**: Frontend can develop based on recorded real data when backend services are not ready
- **Improve Development Stability**: Use recorded data to ensure development continuity when backend services are unstable or unavailable
- **Facilitate Team Collaboration**: Recorded real data can be shared within the team to unify the development environment
- **Simplify API Integration**: After recording real responses, frontend debugging can proceed without repeatedly requesting the backend

## Use Cases

### Scenario 1: Backend Service Not Ready

In the early stages of project development, backend API interfaces may not yet be fully developed. In this case:

1. Use mock data for frontend page development
2. Enable recording to capture real responses when backend interfaces are ready
3. Subsequent development can directly use recorded real data without waiting for backend services

### Scenario 2: Backend Service Unstable

When the backend service occasionally becomes unavailable, responds slowly, or returns inconsistent data:

1. Record response data of key APIs when the service is stable
2. Automatically switch to recorded data replay mode when the service is unstable
3. Ensure continuity and stability of frontend development

### Scenario 3: Team Collaboration and Data Sharing

Team members need a unified mock data environment:

1. Record real response data of key business interfaces
2. Commit recording files to version control system
3. Other team members can directly use recorded data for development

### Scenario 4: Offline Development and Demo

Need to work in environments without network or for demonstration purposes:

1. Record required API response data in advance
2. Use recorded data for development and demonstration in offline state
3. Ensure data stability and consistency in the demo environment

## Workflow

### Three-Stage Workflow

```txt
Stage 1: Mock Development Phase (Backend Not Ready)
┌─────────────────────────────────────────────────────────┐
│  Frontend Request → Mock Data Match → Return Mock       │
│                                                         │
│  Plugin prioritizes matching mock file configurations   │
│  and returns predefined mock data                       │
│  Recording feature can remain enabled but no actual     │
│  recording data is generated at this time               │
└─────────────────────────────────────────────────────────┘

Stage 2: Recording Phase (Backend Ready)
┌──────────────────────────────────────────────────────────┐
│  1. Enable recording: record: true                       │
│                                                          │
│  2. Request processing flow:                             │
│     Frontend Request → Mock Match Failed → Find Record   │
│                                    ↓                     │
│                            No Record → Proxy Forward     │
│                                              ↓           │
│                                    Backend Returns Real  │
│                                              ↓           │
│                                    Auto-record Response  │
│                                              ↓           │
│                                    Return to Frontend    │
│                                                          │
│  3. Recording files automatically generated to directory │
└──────────────────────────────────────────────────────────┘

Stage 3: Replay Phase (Backend Unstable/Offline)
┌──────────────────────────────────────────────────────────┐
│  Request processing flow:                                │
│  Frontend Request → Mock Match Failed → Find Record      │
│                                    ↓                     │
│                            Has Record → Use Record Data  │
│                            No Record → Fallback to Proxy │
│                                                          │
│  Record data is prioritized when valid, auto-cleanup     │
│  after expiration                                        │
└──────────────────────────────────────────────────────────┘
```

### Request Processing Priority

```txt
Request Arrives
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Mock Data Match                  │
│    - Match Success → Use Mock Data  │
│    - Match Failed → Continue        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. Record Data Lookup (when replay  │
│    enabled)                         │
│    - Valid Record Found → Use Record│
│    - Not Found/Expired → Continue   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Proxy Forward (record when       │
│    enabled)                         │
│    - Forward to backend service     │
│    - Auto-record response           │
└─────────────────────────────────────┘
```

## Configuration

### Quick Enable

The simplest way to enable recording and replay with one click:

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

When `record` is set to `true`, the plugin will enable recording with default settings:

- Recording feature enabled
- Replay feature automatically enabled
- Recording data stored in `mock/.recordings` directory

### Full Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      // Recording configuration
      record: {
        enabled: true, // Enable recording feature
        dir: 'mock/.recordings', // Recording data storage directory
        overwrite: true, // Overwrite existing recording data
        expires: 0, // Recording data expiration time (seconds)
        status: [], // Status codes to record
        filter: { // Request filter configuration
          mode: 'glob',
          include: ['/api/**'],
          exclude: ['/api/auth/**']
        },
        gitignore: true // Add .gitignore
      },
      // Replay configuration (optional, defaults to enabled)
      replay: true
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### Configuration Options

#### `record.enabled`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to enable the recording feature. When set to `true`, the plugin will automatically record request responses forwarded through Proxy.

#### `record.dir`

- **Type**: `string`
- **Default**: `'mock/.recordings'`
- **Description**: Recording data storage directory, path relative to project root. The plugin will automatically create this directory.

#### `record.overwrite`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to overwrite existing recording data.
  - `true`: New responses for the same request will overwrite old data
  - `false`: Keep old data, do not record new data

#### `record.expires`

- **Type**: `number`
- **Default**: `0`
- **Description**: Recording data expiration time in seconds.
  - `0`: Never expire
  - Positive number: Expire after specified seconds, expired data is automatically cleaned when recording new data

#### `record.status`

- **Type**: `number | number[]`
- **Default**: `[]`
- **Description**: HTTP status codes to record.
  - Empty array: Record all status codes
  - Specified status codes: Only record specified status codes

#### `record.filter`

- **Type**: `((req: RecordedReq) => boolean) | { include?: string | string[], exclude?: string | string[], mode: 'glob' | 'path-to-regexp' }`
- **Default**: Record all requests
- **Description**: Filter requests to record.

**Function Mode**:

```ts
export default {
  record: {
    filter: (req) => {
    // Only record GET requests
      return req.method === 'GET'
    }
  }
}
```

**Object Mode**:

```ts
export default {
  record: {
    filter: {
      mode: 'glob', // or 'path-to-regexp'
      include: ['/api/**'], // Included paths
      exclude: ['/api/auth/**'] // Excluded paths
    }
  }
}
```

#### `record.gitignore`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to automatically add a `.gitignore` file (content: `*`) in the recording directory to prevent recording data from being accidentally committed to version control.

#### `replay`

- **Type**: `boolean`
- **Default**: `true` (when `record.enabled` is `true`)
- **Description**: Whether to enable replay feature. Can independently control replay, for example, replay only without recording:

```ts
export default {
  record: { enabled: false }, // Do not record new data
  replay: true, // But use existing recorded data
}
```

## Recording Files

### Storage Structure

Recording data is stored in the `mock/.recordings/` directory by default, organized by request path:

```txt
project-root/
├── mock/
│   ├── .recordings/              # Recording data directory
│   │   ├── .gitignore            # Auto-generated gitignore file
│   │   ├── api-users.json        # Recording data for GET /api/users
│   │   ├── api-users-id.json     # Recording data for GET /api/users/:id
│   │   └── api-login.json        # Recording data for POST /api/login
│   └── *.mock.ts                 # Mock files
└── vite.config.ts
```

### File Naming Convention

Recording files are named using the kebab-case format of the request path:

```txt
Rule: {kebab-case(pathname)}.json

Examples:
- /api/users          → api-users.json
- /api/users/:id      → api-users-id.json
- /api/user/profile   → api-user-profile.json
```

### File Content Format

```json
[
  {
    "meta": {
      "timestamp": 1704067200000,
      "createAt": "1/1/2024, 00:00:00",
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

### Data Structure Description

#### `meta` - Metadata

| Field       | Type     | Description                        |
| ----------- | -------- | ---------------------------------- |
| `timestamp` | `number` | Recording timestamp (milliseconds) |
| `createAt`  | `string` | Formatted recording time           |
| `filepath`  | `string` | Recording file path                |
| `referer`   | `string` | Request source page                |

#### `req` - Request Data

| Field      | Type      | Description                                  |
| ---------- | --------- | -------------------------------------------- |
| `method`   | `string`  | HTTP method (GET/POST/PUT/DELETE, etc.)      |
| `pathname` | `string`  | Request path                                 |
| `query`    | `object`  | URL query parameters                         |
| `body`     | `unknown` | Request body data                            |
| `bodyType` | `string`  | Request body type (e.g., `application/json`) |

#### `res` - Response Data

| Field        | Type     | Description                                       |
| ------------ | -------- | ------------------------------------------------- |
| `status`     | `number` | HTTP status code                                  |
| `statusText` | `string` | Status text                                       |
| `headers`    | `object` | Response headers (dynamic headers filtered)       |
| `body`       | `string` | Response body (UTF-8 for text, Base64 for binary) |

## Response Header Filtering

During recording, the plugin automatically filters the following dynamic or environment-related response headers to ensure portability of recorded data:

### Filtered Response Header Categories

1. **Date/Time Related** (changes with each request)
   - `date`, `expires`, `last-modified`

2. **Server Information** (environment-related)
   - `server`, `x-powered-by`, `x-aspnet-version`, `x-nginx-version`, `via`

3. **Cache Control** (not needed during replay)
   - `cache-control`, `etag`, `age`

4. **Connection Related** (different replay environment)
   - `connection`, `keep-alive`, `proxy-authenticate`, `proxy-authorization`

5. **CORS Related** (different replay environment)
   - `access-control-allow-origin`, `access-control-allow-credentials`, etc.

6. **Dynamic Identifiers** (unique per request)
   - `x-request-id`, `x-correlation-id`, `x-trace-id`, `cf-ray`, etc.

## Request Matching Mechanism

During replay, the plugin uses an exact matching algorithm to determine whether to use recorded data:

### Matching Conditions

Two requests are considered the same if and only if:

1. **Same pathname** - `pathname` exactly matches
2. **Same HTTP method** - `method` matches
3. **Same body type** - `bodyType` matches
4. **Same query parameters** - `query` deep equal
5. **Same body** - `body` deep equal (Buffer uses byte comparison)

### Matching Example

```txt
// Request at recording time
{
  method: 'GET',
  pathname: '/api/users',
  query: { page: '1', size: '10' },
  body: null
}

// This request will match
{
  method: 'GET',
  pathname: '/api/users',
  query: { page: '1', size: '10' },
  body: null
}

// This request will NOT match (different query params)
{
  method: 'GET',
  pathname: '/api/users',
  query: { page: '2', size: '10' },
  body: null
}
```

## Usage Examples

### Example 1: Basic Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: true // Enable record and replay with one click
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### Example 2: Filter by Status Code

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
        status: [200, 201], // Only record successful responses
        overwrite: true
      }
    })
  ]
})
```

### Example 3: Filter Requests with Glob

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
          include: ['/api/users/**', '/api/orders/**'], // Only record user and order APIs
          exclude: ['/api/users/sensitive/**'] // Exclude sensitive APIs
        }
      }
    })
  ]
})
```

### Example 4: Filter with path-to-regexp

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
          include: ['/api/:resource/:id'], // Match /api/users/123
          exclude: ['/api/auth/:action'] // Exclude auth-related
        }
      }
    })
  ]
})
```

### Example 5: Custom Filter Function

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
          // Only record GET requests and paths not containing sensitive
          return req.method === 'GET' && !req.pathname.includes('sensitive')
        }
      }
    })
  ]
})
```

### Example 6: Set Expiration Time

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
        expires: 86400, // Recording data expires after 24 hours
        overwrite: true
      }
    })
  ]
})
```

### Example 7: Replay Only (No Recording)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      prefix: ['/api'],
      record: { enabled: false }, // Do not record new data
      replay: true // But use existing recorded data
    })
  ]
})
```

### Example 8: Custom Storage Directory

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
        dir: 'recordings/api', // Custom storage directory
        overwrite: false, // Do not overwrite existing recordings
        gitignore: false // Do not auto-generate .gitignore
      }
    })
  ]
})
```

## Best Practices

### 1. Development Stage Strategy

```txt
Early Development (Backend Not Ready)
  ↓ Use mock data for rapid development
Integration Phase (Backend Ready)
  ↓ Enable recording to capture real responses
Stable Phase (Backend Stable)
  ↓ Optionally disable recording, use recorded or mock data
```

### 2. Team Collaboration Guidelines

- **Record Key Interfaces**: Commit recording files of core business interfaces to version control
- **Sensitive Data Handling**: Avoid recording interfaces containing sensitive information (e.g., login, payment)
- **Regular Updates**: Periodically re-record to sync with backend interface changes

### 3. Version Control Recommendations

```sh
# .gitignore
# Plugin auto-adds by default, manual configuration if needed:
mock/.recordings/*
!mock/.recordings/.gitkeep
```

To commit recording data to version control:

```ts
// vite.config.ts
export default {
  record: {
    enabled: true,
    gitignore: false // Do not auto-generate .gitignore
  }
}
```

### 4. Performance Optimization

- Recording has minimal performance impact, only saves data on Proxy response
- Use `filter` configuration to only record necessary requests
- Set reasonable `expires` time to automatically clean up expired data

### 5. Security Considerations

- Avoid recording interfaces containing sensitive information (passwords, tokens, personal info, etc.)
- Use `filter.exclude` to exclude sensitive paths
- Recording files are excluded by `.gitignore` by default to prevent accidental commits

## FAQ

### Q: Why aren't recording files being generated?

**Possible Causes**:

1. `record.enabled` is not set to `true`
2. Request did not go through Proxy (Mock match takes priority)
3. Request was filtered by `filter`
4. Response status code is not in `status` configuration

**Troubleshooting**:

```ts
export default {
  record: {
    enabled: true,
    filter: (req) => {
      console.log('Recording request:', req.pathname)
      return true // Temporarily return true for testing
    }
  }
}
```

### Q: Why isn't recorded data being replayed?

**Possible Causes**:

1. `replay` is set to `false`
2. Recording data has expired (exceeds `expires` setting)
3. Request matching failed (path, params, or body mismatch)
4. Mock data matched successfully (Mock has higher priority)

### Q: How to clean up all recording data?

Delete the recording directory directly:

```bash
rm -rf mock/.recordings
```

Or set expiration to 1 second in config and re-record:

```ts
export default {
  record: {
    enabled: true,
    expires: 1 // Expires after 1 second
  }
}
```

### Q: What if recording data takes up too much space?

1. Use `filter` to only record necessary interfaces
2. Set reasonable `expires` time
3. Periodically manually clean up recording directory
4. Avoid recording interfaces that return large files

### Q: Is WebSocket recording supported?

The current version does not support recording and replay of WebSocket requests, only HTTP/HTTPS requests are supported.

## Relationship with Other Features

### Priority with Mock Data

Mock Data Priority > Recorded Data > Proxy Forward

```ts
// If there's a matching config in mock file
export default defineMock({
  url: '/api/users',
  body: { list: [] } // Mock data takes priority
})

// Even with recorded data, the above Mock config will be used
```

### Relationship with Proxy Configuration

Recording feature depends on Vite's `server.proxy` configuration:

```ts
export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      record: true
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080' // Recording intercepts this proxy
    }
  }
})
```

### Integration with Build Feature

Optionally include recording files when building standalone mock service:

```ts
mockDevServerPlugin({
  record: { enabled: true },
  build: {
    includeRecord: true // Include recording files in build output
  }
})
```
