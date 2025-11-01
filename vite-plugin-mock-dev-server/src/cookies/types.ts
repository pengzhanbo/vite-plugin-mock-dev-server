import type { Keygrip } from './Keygrip'

export interface CookiesOption {
  keys?: string[] | Keygrip
  secure?: boolean
}

export interface SetCookieOption {
  /**
   * a number representing the milliseconds from `Date.now()` for expiry
   *
   * 表示从 `Date.now()` 起至过期的毫秒数
   */
  maxAge?: number
  /**
   * a Date object indicating the cookie's expiration
   * date (expires at the end of session by default).
   *
   * 一个指示cookie过期时间的 Date 对象（默认在会话结束时过期）。
   */
  expires?: Date
  /**
   * a string indicating the path of the cookie (`/` by default).
   *
   * 一个指示cookie路径的字符串（默认为 `/`）。
   */
  path?: string
  /**
   * a string indicating the domain of the cookie (no default).
   *
   * 表示 Cookie 域的字符串（无默认值）。
   */
  domain?: string
  /**
   * a boolean indicating whether the cookie is only to be sent
   * over HTTPS (false by default for HTTP, true by default for HTTPS).
   *
   * 一个布尔值，指示该 Cookie 是否仅通过 HTTPS 发送（HTTP 默认为 false，HTTPS 默认为 true）。
   */
  secure?: boolean
  /**
   * a boolean indicating whether the cookie is only to be sent over HTTP(S),
   * and not made available to client JavaScript (true by default).
   *
   * 一个布尔值，指示该 cookie 是否仅通过HTTP(S)发送，而不对客户端JavaScript开放（默认为true）。
   */
  httpOnly?: boolean
  /**
   * a boolean or string indicating whether the cookie is a "same site" cookie (false by default).
   * This can be set to 'strict', 'lax', or true (which maps to 'strict').
   *
   * 一个布尔值或字符串，用于指示该cookie是否为“同站”cookie（默认为false）。
   * 可将其设置为'strict'、'lax'或true（true会映射为'strict'）。
   */
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  /**
   * a boolean indicating whether the cookie is to be signed (false by default).
   * If this is true, another cookie of the same name with the .sig suffix
   * appended will also be sent, with a 27-byte url-safe base64 SHA1 value
   * representing the hash of cookie-name=cookie-value against the first Keygrip key.
   * This signature key is used to detect tampering the next time a cookie is received.
   *
   * 一个布尔值，指示cookie是否需签名（默认为false）。
   * 若设为true，将同时发送另一个同名但附加 `.sig` 后缀的 cookie，其值为 27 字节的URL安全型 base64 SHA1哈希值，
   * 该哈希由cookie名称=cookie值的字符串与首个 Keygrip 密钥计算生成。
   * 此签名密钥用于在下次接收cookie时检测数据是否被篡改。
   */
  signed?: boolean
  /**
   * a boolean indicating whether to overwrite previously set
   * cookies of the same name (false by default). If this is true,
   * all cookies set during the same request with the same
   * name (regardless of path or domain) are filtered out of
   * the Set-Cookie header when setting this cookie.
   *
   * 一个布尔值，指示是否覆盖先前设置的同名Cookie（默认为false）。
   * 若设为true，当设置此Cookie时，在同一请求期间设置的所有同名Cookie（无论路径或域）
   * 都将从Set-Cookie标头中过滤掉。
   */
  overwrite?: boolean
  /**
   * a string indicating the cookie priority.
   * This can be set to 'low', 'medium', or 'high'.
   *
   * 表示Cookie优先级的字符串。可设置为'low'、'medium'或'high'。
   */
  priority?: 'low' | 'medium' | 'high'
  /**
   * a boolean indicating whether to partition the cookie in Chrome
   * for the CHIPS Update (false by default). If this is true,
   * Cookies from embedded sites will be partitioned
   * and only readable from the same top level site from which it was created.
   *
   * 一个布尔值，指示是否在Chrome中为CHIPS更新对Cookie进行分区（默认为false）。
   * 若设为true，来自嵌入式站点的Cookie将被分区，且仅可从创建它的同一顶级站点读取。
   */
  partitioned?: boolean
}

export interface GetCookieOption {
  signed: boolean
}
