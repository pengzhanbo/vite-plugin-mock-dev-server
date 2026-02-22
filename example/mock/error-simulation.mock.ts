import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/error-simulation',
    method: 'GET',
    body: { success: true, message: 'Request successful' },
    error: {
      probability: 0.5,
      status: 500,
    },
  },
  {
    url: '/api/error-simulation/404',
    method: 'GET',
    body: { success: true, message: 'Request successful' },
    error: {
      probability: 0.7,
      status: 404,
    },
  },
  {
    url: '/api/error-simulation/text',
    method: 'GET',
    body: 'Request successful',
    type: 'text',
    error: {
      probability: 0.5,
      status: 500,
    },
  },
  {
    url: '/api/error-simulation/custom-body',
    method: 'GET',
    body: { code: 200, msg: 'Success', result: { data: 'some data' } },
    error: {
      probability: 0.5,
      status: 200, // 网络请求成功
      body: { code: 500, msg: 'Internal error', result: null }, // 但返回错误的数据结构
    },
  },
  {
    url: '/api/error-simulation/empty-result',
    method: 'GET',
    body: { code: 200, msg: 'Success', result: { data: 'some data' } },
    error: {
      probability: 0.5,
      status: 200,
      body: { code: 200, msg: 'Success', result: {} }, // 成功状态但结果为空
    },
  },
  {
    url: '/api/error-simulation/dynamic-body',
    method: 'GET',
    body: { code: 200, msg: 'Success', result: { data: 'some data' } },
    error: {
      probability: 0.5,
      status: 200,
      body: (request) => {
        // 根据请求参数动态生成错误响应
        return {
          code: 500,
          msg: `Error for request: ${request.query.id || 'unknown'}`,
          result: null,
        }
      },
    },
  },
])
