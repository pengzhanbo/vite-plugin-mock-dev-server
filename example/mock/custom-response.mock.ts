import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/custom-response',
    response(req, res) {
      const { query = {} } = req
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(
        JSON.stringify({
          message: 'custom response',
          query,
        }),
      )
    },
  },
  {
    url: '/api/custom-response-skip',
    response(req, res, next) {
      if (req.query.skip === '1')
        next()

      else
        res.end('')
    },
  },
])
