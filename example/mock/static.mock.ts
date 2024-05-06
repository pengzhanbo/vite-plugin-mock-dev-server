import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mime from 'mime-types'
import { defineMock } from 'vite-plugin-mock-dev-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 模拟一个 静态资源服务
 */
export default defineMock({
  url: '/static/:filepath(.*)',
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
    return createReadStream(path.join(__dirname, 'static', filepath))
  },
})
