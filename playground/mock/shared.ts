import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

export const defineAPIMock = createDefineMock((mock) => {
  mock.url = path.join('/api', mock.url)
})
