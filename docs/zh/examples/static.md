# 静态资源服务

通过 动态路由匹配，获取请求的文件路径 `*filepath`, 获取请求中的文件路径，
在 `body` 中以文件流的方式返回，并在 `headers` 中设置正确的 `Content-Type`。

```ts
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mime from 'mime-types'
import { defineMock } from 'vite-plugin-mock-dev-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineMock({
  url: '/mock-static/*filepath',
  method: 'GET',
  headers(request) {
    const filepath = request.params.filepath.join('/')
    const filename = path.basename(filepath)
    return {
      'Content-Type': mime.lookup(filename) || 'text/plain',
    }
  },
  body(request) {
    const { filepath } = request.params
    return createReadStream(path.join(__dirname, 'mock-static', filepath))
  },
})
```
