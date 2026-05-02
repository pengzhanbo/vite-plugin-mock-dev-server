import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/scene',
    body: {
      scene: 'default scene',
    },
  },
  {
    url: '/api/scene',
    scene: 'test',
    body: {
      scene: 'test scene',
    },
  },
])
