import { createReadStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineMock } from 'vite-plugin-mock-dev-server'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineMock({
  url: '/api/file-download',
  type: 'shared.js',
  // response file read stream
  body: () => createReadStream(join(__dirname, 'shared.ts')),
})
