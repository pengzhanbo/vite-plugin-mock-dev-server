import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineAPIMock } from './shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const buffer1 = defineAPIMock({
  url: 'buffer/buffer-a',
  type: 'buffer',
  body: () => createReadStream(path.join(__dirname, './shared.ts')),
})
