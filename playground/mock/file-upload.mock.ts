import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/upload',
  method: 'POST',
  body(req) {
    const body = req.body
    const files = Array.isArray(body.files) ? body.files : [body.files]
    return {
      name: body.name,
      files: files.map((file: any) => file.originalFilename),
    }
  },
})
