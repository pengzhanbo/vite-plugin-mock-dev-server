# Scene Mock

## Feature Overview

Scene Mock allows you to define multiple sets of mock responses for the same API endpoint and switch between them via scene configuration. This is useful when you need different mock behaviors for different development contexts — such as testing, debugging, or demo environments.

### Core Values

- **Context Switching**: Switch between different mock data sets without modifying mock files
- **Per-Request Override**: Use the `X-Mock-Scene` header to dynamically switch scenes per request
- **Non-Intrusive**: Mocks without a `scene` configuration remain universal and are always active
- **Priority Aware**: Scene-specific mocks have higher matching priority than universal mocks

## Plugin Configuration

First, define which scenes are active via the `activeScene` option in the plugin configuration:

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      activeScene: 'dev', // Only activate mocks with scene: 'dev'
    }),
  ],
})
```

You can also configure multiple active scenes:

```ts
mockDevServerPlugin({
  activeScene: ['dev', 'test'],
})
```

## Mock Configuration

Tag mock configurations with a `scene` identifier. Mocks without a `scene` are universal and always active.

```ts [api.mock.ts]
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  // Universal — always active
  {
    url: '/api/user',
    body: { name: 'Default User' },
  },
  // Only active when scene 'admin' matches
  {
    url: '/api/user',
    scene: 'admin',
    body: { name: 'Admin User', role: 'admin' },
  },
  // Only active when scene 'demo' matches
  {
    url: '/api/user',
    scene: 'demo',
    body: { name: 'Demo User', role: 'guest' },
  },
])
```

## Per-Request Scene Override

The scene can be overridden on a per-request basis using the `X-Mock-Scene` HTTP header. This takes precedence over the `activeScene` plugin configuration.

```ts
// Activate 'admin' scene for this request
fetch('/api/user', {
  headers: { 'X-Mock-Scene': 'admin' }
})

// Activate multiple scenes
fetch('/api/user', {
  headers: { 'X-Mock-Scene': 'admin,demo' }
})
```

## Matching Rules

1. A mock with **no `scene`** is universal — it matches regardless of the active scene.
2. A mock **with `scene`** only matches when at least one of its scenes matches one of the active scenes.
3. If **no `activeScene`** is configured and no `X-Mock-Scene` header is present, scene-specific mocks **will not match**.
4. The `X-Mock-Scene` header **overrides** the plugin's `activeScene` configuration for that request.
5. Scene-specific mocks have **higher priority** than universal mocks when both match the same URL.

## Use Cases

### Scenario 1: Multi-Environment Development

Switch between different backend states (empty data, paginated data, error states) without modifying mock files.

### Scenario 2: Demo Mode

Create a dedicated demo scene that returns curated data, and switch to it by configuring `activeScene: 'demo'`.

### Scenario 3: Automated Testing

Use `X-Mock-Scene` headers in test requests to verify different API response scenarios without modifying global configuration.
