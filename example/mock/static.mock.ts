import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mime from 'mime-types'
import { defineMock } from 'vite-plugin-mock-dev-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 模拟一个静态资源服务
 *
 * Mock a static file server.
 */
export default defineMock({
  url: '/static/*filepath',
  method: 'GET',
  headers(request) {
    const filepath = toRelativePath(request.params.filepath)
    const filename = path.basename(filepath)
    return {
      'Content-Type': mime.lookup(filename) || 'text/plain',
    }
  },
  body(request) {
    const filepath = toRelativePath(request.params.filepath)
    return createReadStream(path.join(__dirname, 'static', filepath))
  },
})

/**
 * Normalize the wildcard params to a relative file path
 *
 * 将通配符参数归一化为相对文件路径
 *
 * @param filepath - Wildcard params / 通配符参数
 * @returns Relative path / 相对路径
 */
function toRelativePath(filepath: string | string[]): string {
  return Array.isArray(filepath) ? filepath.join('/') : filepath
}
