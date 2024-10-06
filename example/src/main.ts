import { get, post } from './request'

async function fileExtension() {
  await get('/api/json')
  await get('/api/json5')
  await get('/api/es-module-js')
  await get('/api/typescript')
  await get('/api/common-js')
  await get('/api/javascript')
}

async function allowMethod() {
  await get('/api/only-get-method')
  await post('/api/only-get-method')
  await get('/api/allow-get-and-post')
  await post('/api/allow-get-and-post')
}

async function apiDev() {
  await get('/api-dev/list/get')
}

async function buffer() {
  await post('/api/buffer/buffer-type')
  await post('/api/buffer/buffer-body')
}

async function cookie() {
  await post('/api/login')
  await post('/api/check-login')
  await post('/api/logout')
  await post('/api/check-login')
}

async function delay() {
  await get('/api/delay')
  await get('/api/delay-and-fail')
}

async function customHeader() {
  await get('/api/custom-header')
  await get('/api/custom-header-fn')
}

async function customResponse() {
  await get('/api/custom-response?a=1&b=2')
  await post('/api/custom-response-skip?skip=1', { skip: 1, aa: 222 })
  await get('/api/custom-response-skip')
}

async function dynamicMatchUrl() {
  await get('/api/author/10001')
  await get('/api/author/10002')
  await get('/api/author/10003')
}

async function fail() {
  await get('/api/fail')
}

async function mockjs() {
  await get('/api/mockjs')
}

async function otherMock() {
  await post('/api/post/list', { page: 1 })
  await post('/api/post/delete/1')
  await post('/api/post/list', { page: 1 })
  await get('/api/user/list')
  await get('/api/user/mark2022')
}

async function validatorBody() {
  await post('/api/post-update', { shouldUpdate: true })
  await post('/api/post-update', { shouldUpdate: false })
}

async function validatorParams() {
  await get('/api/post/1001')
  await get('/api/post/1002')
  await get('/api/post/1003')
}

async function validatorQuery() {
  await get('/api/post?id=1000')
  await get('/api/post?id=1001&other=1')
  await get('/api/post?id=1002')
  await get('/api/post?id=1003&other=1')
}

async function validatorRequest() {
  await get('/api/validator-check-cookie')
  await post('/api/validator-body-include', { ids: [] })
}

async function bootstrap() {
  await fileExtension()
  await allowMethod()
  await apiDev()
  await buffer()
  await cookie()
  await customHeader()
  await customResponse()
  await dynamicMatchUrl()
  await fail()
  await mockjs()
  await validatorBody()
  await validatorParams()
  await validatorQuery()
  await validatorRequest()

  await otherMock()
  await delay()
}

function webSocketMock() {
  const ws = new WebSocket('ws://localhost:5173/socket.io')
  ws.addEventListener(
    'open',
    () => {
      // eslint-disable-next-line no-console
      console.log('isOpen')
    },
    { once: true },
  )
  setTimeout(() => {
    if (ws.readyState === ws.OPEN)
      ws.send(JSON.stringify({ type: 'message', payload: { a: 1 } }))
  }, 3000)
}

function eventSourceMock() {
  const es = new EventSource('/api/sse')
  es.addEventListener('count', (e) => {
    // eslint-disable-next-line no-console
    console.log(e.data)
  })
  es.addEventListener('close', () => {
    es.close()
    // eslint-disable-next-line no-console
    console.log('close')
  })
}

bootstrap()
webSocketMock()
eventSourceMock()
