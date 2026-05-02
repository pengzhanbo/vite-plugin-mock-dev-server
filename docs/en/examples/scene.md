# Scene Mock

Scene Mock allows you to define multiple mock responses for the same URL and switch between them via scene configuration, without modifying mock files.

## Basic Usage

Define mocks with different scenes for the same endpoint. Mocks without `scene` are universal and always active.

<<< @/../example/mock/scene.mock.ts

## Plugin Configuration

Configure the active scene in `vite.config.ts`:

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      activeScene: 'test', // Activates the 'test' scene
    }),
  ],
})
```

When `activeScene` is set to `'test'`:
- `GET /api/scene` without a matching scene → returns `{ scene: 'default scene' }` (universal, no scene)
- `GET /api/scene` with scene `'test'` → returns `{ scene: 'test scene' }` (scene match)

When `activeScene` is not configured (or empty):
- `GET /api/scene` → returns `{ scene: 'default scene' }` (only universal mock matches)

## Per-Request Override

Use the `X-Mock-Scene` header to dynamically switch scenes per request:

```ts
// Activate 'test' scene for this request
fetch('/api/scene', {
  headers: { 'X-Mock-Scene': 'test' }
})
// Response: { scene: 'test scene' }
```

The `X-Mock-Scene` header supports multiple comma-separated scenes:

```ts
fetch('/api/scene', {
  headers: { 'X-Mock-Scene': 'test,dev' }
})
```
