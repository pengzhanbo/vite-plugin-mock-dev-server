import { get, post } from './request'

function fileExtension() {
  get('/api/json')
  get('/api/json5')
  get('/api/es-module-js')
  get('/api/typescript')
  get('/api/common-js')
  get('/api/javascript')
}

function allowMethod() {
  get('/api/only-get-method')
  post('/api/only-get-method')
  get('/api/allow-get-and-post')
  post('/api/allow-get-and-post')
}

function apiDev() {
  get('/api-dev/list/get')
}

function buffer() {
  post('/api/buffer/buffer-type')
  post('/api/buffer/buffer-body')
}

function cookie() {
  post('/api/login')
  post('/api/check-login')
  post('/api/logout')
  post('/api/check-login')
}

function delay() {
  get('/api/delay')
  get('/api/delay-and-fail')
}

function customHeader() {
  get('/api/custom-header')
  get('/api/custom-header-fn')
}

function customResponse() {
  get('/api/custom-response?a=1&b=2')
  post('/api/custom-response-skip?skip=1', { skip: 1, aa: 222 })
  get('/api/custom-response-skip')
}

function dynamicMatchUrl() {
  get('/api/author/10001')
  get('/api/author/10002')
  get('/api/author/10003')
}

function fail() {
  get('/api/fail')
}

function mockjs() {
  get('/api/mockjs')
}

function otherMock() {
  post('/api/post/list', { page: 1 })
  post('/api/post/delete/1')
  post('/api/post/list', { page: 1 })
  get('/api/user/list')
  get('/api/user/mark2022')
}

function validatorBody() {
  post('/api/post-update', { shouldUpdate: true })
  post('/api/post-update', { shouldUpdate: false })
}

function validatorParams() {
  get('/api/post/1001')
  get('/api/post/1002')
  get('/api/post/1003')
}

function validatorQuery() {
  get('/api/post?id=1000')
  get('/api/post?id=1001&other=1')
  get('/api/post?id=1002')
  get('/api/post?id=1003&other=1')
}

function validatorRequest() {
  get('/api/validator-check-cookie')
  post('/api/validator-body-include', { ids: [] })
}

function scene() {
  get('/api/scene')
}

function httpMock() {
  scene()
  fileExtension()
  allowMethod()
  apiDev()
  buffer()
  cookie()
  customHeader()
  customResponse()
  dynamicMatchUrl()
  fail()
  mockjs()
  validatorBody()
  validatorParams()
  validatorQuery()
  validatorRequest()

  otherMock()
  delay()
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

httpMock()
webSocketMock()
eventSourceMock()
