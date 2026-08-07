import { get, post } from './request.js'

function fileExtension(): void {
  void get('/api/json')
  void get('/api/json5')
  void get('/api/es-module-js')
  void get('/api/typescript')
  void get('/api/common-js')
  void get('/api/javascript')
}

function allowMethod(): void {
  void get('/api/only-get-method')
  void post('/api/only-get-method')
  void get('/api/allow-get-and-post')
  void post('/api/allow-get-and-post')
}

function apiDev(): void {
  void get('/api-dev/list/get')
}

function buffer(): void {
  void post('/api/buffer/buffer-type')
  void post('/api/buffer/buffer-body')
}

function cookie(): void {
  void post('/api/login')
  void post('/api/check-login')
  void post('/api/logout')
  void post('/api/check-login')
}

function delay(): void {
  void get('/api/delay')
  void get('/api/delay-and-fail')
}

function customHeader(): void {
  void get('/api/custom-header')
  void get('/api/custom-header-fn')
}

function customResponse(): void {
  void get('/api/custom-response?a=1&b=2')
  void post('/api/custom-response-skip?skip=1', { skip: 1, aa: 222 })
  void get('/api/custom-response-skip')
}

function dynamicMatchUrl(): void {
  void get('/api/author/10001')
  void get('/api/author/10002')
  void get('/api/author/10003')
}

function fail(): void {
  void get('/api/fail')
}

function mockjs(): void {
  void get('/api/mockjs')
}

function otherMock(): void {
  void post('/api/post/list', { page: 1 })
  void post('/api/post/delete/1')
  void post('/api/post/list', { page: 1 })
  void get('/api/user/list')
  void get('/api/user/mark2022')
}

function validatorBody(): void {
  void post('/api/post-update', { shouldUpdate: true })
  void post('/api/post-update', { shouldUpdate: false })
}

function validatorParams(): void {
  void get('/api/post/1001')
  void get('/api/post/1002')
  void get('/api/post/1003')
}

function validatorQuery(): void {
  void get('/api/post?id=1000')
  void get('/api/post?id=1001&other=1')
  void get('/api/post?id=1002')
  void get('/api/post?id=1003&other=1')
}

function validatorRequest(): void {
  void get('/api/validator-check-cookie')
  void post('/api/validator-body-include', { ids: [] })
}

function scene(): void {
  void get('/api/scene')
}

function httpMock(): void {
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

function webSocketMock(): void {
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
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'message', payload: { a: 1 } }))
    }
  }, 3000)
}

function eventSourceMock(): void {
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
