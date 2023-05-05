import { Buffer } from 'node:buffer'
import { defineAPIMock } from './shared'

export const buffer1 = defineAPIMock({
  url: 'buffer/buffer-type',
  type: 'buffer',
  body: {
    message: 'The response body data will be converted to buffer',
  },
})

export const buffer2 = defineAPIMock({
  url: 'buffer/buffer-body',
  type: 'json',
  body: Buffer.from(
    JSON.stringify({
      message: 'The body can also receive buffers',
    }),
  ),
})
