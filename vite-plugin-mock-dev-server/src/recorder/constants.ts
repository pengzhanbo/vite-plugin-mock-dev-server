export const FILTERED_RESPONSE_HEADERS: string[] = [
  // 日期时间相关（每次请求都会变化）
  'date',
  'expires',
  'last-modified',

  // 服务器信息（与环境相关）
  'server',
  'x-powered-by',
  'x-aspnet-version',
  'x-nginx-version',
  'via',

  // 缓存控制（回放时不需要）
  'cache-control',
  'etag',
  'age',

  // 连接相关（回放环境不同）
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'trailer',

  // CORS相关（回放环境不同）
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-expose-headers',
  'access-control-max-age',

  // 跨域资源共享标识
  'origin',

  // 其他动态header
  'p3p',
  'pragma',
  'x-request-id',
  'x-correlation-id',
  'x-trace-id',
  'x-varnish',
  'x-cache',
  'x-cache-hits',
  'x-cache-status',
  'cf-cache-status',
  'cf-ray',
  'cf-request-id',
  'server-timing',
  'x-dns-prefetch-control',
]
