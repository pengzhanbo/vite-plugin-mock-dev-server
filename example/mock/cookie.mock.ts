import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/login',
    cookies: {
      token: 'username&password',
    },
    body: {
      code: 200,
      message: 'login success',
    },
  },
  {
    url: '/api/logout',
    cookies({ getCookie }) {
      const token = getCookie('token')
      if (token) {
        return {
          token: ['', { expires: new Date(Date.now() - 86400000) }],
        }
      }
      // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
      return {} as any
    },
    body: {
      code: 200,
      message: 'logout success',
    },
  },
  {
    url: '/api/check-login',
    body(request) {
      const token = request.getCookie('token')
      return {
        isLogin: !!token,
      }
    },
  },
])
