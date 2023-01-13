import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock([
  {
    url: '/api/test',
    body: {
      aaa: 11122,
    },
  },
  {
    url: '/api/test/:id',
    body: ({ query, params, body }) => {
      return {
        query,
        params,
        body,
      }
    },
  },
  /**
   * 直接使一个接口 404
   */
  {
    url: '/api/custom/404',
    status: 404,
    statusText: 'Not Found',
  },
  /**
   * 通过 response 自定义一个 404的请求
   */
  {
    url: '/api/custom/fail',
    response(req, res) {
      // req.query
      // req.body
      // req.params
      res.statusCode = 404
      res.statusMessage = 'Not Found'
      res.end()
    },
  },
  /**
   * 使接口延迟响应，单位： ms
   */
  {
    url: '/api/delay',
    delay: 4000,
  },
])
