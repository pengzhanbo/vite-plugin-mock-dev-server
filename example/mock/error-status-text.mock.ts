import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Error simulation: probability, status, statusText and custom bodies.
 *
 * 错误模拟：概率、状态码、状态文本与自定义响应体。
 */
export default defineMock([
  {
    url: '/api/error/always',
    body: { success: true },
    error: {
      probability: 1,
      status: 502,
      statusText: 'Bad Gateway',
      body: { success: false, error: 'simulated gateway error' },
    },
  },
  {
    url: '/api/error/probability',
    body: { success: true, message: 'request successful' },
    error: {
      probability: 0.5,
      status: 500,
    },
  },
  {
    url: '/api/error/body-function',
    body: { code: 200, result: { data: 'some data' } },
    error: {
      probability: 1,
      status: 200,
      body: (request) => ({
        code: 500,
        message: `error for request: ${request.query.id ?? 'unknown'}`,
        result: null,
      }),
    },
  },
  {
    url: '/api/error/text',
    type: 'text',
    body: 'request successful',
    error: {
      probability: 1,
      status: 503,
      body: 'service unavailable',
    },
  },
])
