/**
 * Headers describing how the response body is framed
 *
 * 描述响应体分帧方式的 header
 *
 * 录制时响应体可能被解压，长度不再与原始 header 一致；回放时由 Node 依据实际写出的
 * 字节重新计算，因此录制与回放两侧都需要丢弃它们。
 *
 * The recorded body may be decompressed, so its length no longer matches the original
 * header. On replay Node computes the framing from the bytes actually written, so these
 * headers are dropped both when recording and when replaying.
 */
export const BODY_FRAMING_HEADERS: string[] = ['content-length', 'transfer-encoding']

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

  // 响应体长度与分块传输（回放时的响应体长度由 Node 依据实际写出的字节计算）
  // body length and chunked transfer: on replay, the length is computed by Node
  // from the bytes actually written
  ...BODY_FRAMING_HEADERS,

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
