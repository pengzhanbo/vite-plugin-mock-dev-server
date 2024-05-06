# Static resource service

Retrieve the file path from the request through dynamic route matching using `:filepath(.*)`, obtain the file path from the request, return it as a file stream in the body, and set the correct `Content-Type` in the headers.

```ts
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mime from 'mime-types'
import { defineMock } from 'vite-plugin-mock-dev-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineMock({
  url: '/mockData/:filepath(.*)',
  method: 'GET',
  headers(request) {
    const { filepath } = request.params
    const filename = path.basename(filepath)
    return {
      'Content-Type': mime.lookup(filename) || 'text/plain',
    }
  },
  body(request) {
    const { filepath } = request.params
    return createReadStream(path.join(__dirname, 'mockData', filepath))
  },
})
```
