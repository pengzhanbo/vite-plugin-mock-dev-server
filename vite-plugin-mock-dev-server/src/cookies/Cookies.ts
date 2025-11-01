import type { IncomingMessage, ServerResponse } from 'node:http'
import type { CookiesOption, GetCookieOption, SetCookieOption } from './types'
import http from 'node:http'
import { isArray, toArray } from '@pengzhanbo/utils'
import { REGEXP_CACHE, REGEXP_ESCAPE_CHARS_REGEXP } from './constants'
import { Cookie } from './Cookie'
import { Keygrip } from './Keygrip'

export class Cookies {
  request: IncomingMessage
  response: ServerResponse<IncomingMessage>
  secure: boolean | undefined
  keys: Keygrip | undefined

  constructor(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    options: CookiesOption = {},
  ) {
    this.request = req
    this.response = res
    this.secure = options.secure

    if (options.keys instanceof Keygrip) {
      this.keys = options.keys
    }
    else if (isArray(options.keys)) {
      this.keys = new Keygrip(options.keys)
    }
  }

  set(name: string, value?: string | null, options?: SetCookieOption): this {
    const req = this.request
    const res = this.response
    const headers = toArray(res.getHeader('Set-Cookie')) as string[]
    const cookie = new Cookie(name, value, options)
    const signed = options?.signed ?? !!this.keys
    const secure = this.secure === undefined
      ? (req as IncomingMessage & { protocol: string }).protocol === 'https' || isRequestEncrypted(req)
      : Boolean(this.secure)

    if (!secure && options?.secure) {
      throw new Error('Cannot send secure cookie over unencrypted connection')
    }

    cookie.secure = options?.secure ?? secure

    pushCookie(headers, cookie)

    if (signed && options) {
      if (!this.keys)
        throw new Error('.keys required for signed cookies')
      cookie.value = this.keys.sign(cookie.toString())
      cookie.name += '.sig'
      pushCookie(headers, cookie)
    }

    const setHeader = (res as any).set ? http.OutgoingMessage.prototype.setHeader : res.setHeader
    setHeader.call(res, 'Set-Cookie', headers)

    return this
  }

  get(name: string, options?: GetCookieOption): string | void {
    const signName = `${name}.sig`
    const signed = options?.signed ?? !!this.keys

    const header = this.request.headers.cookie

    if (!header)
      return

    const match = header.match(getPattern(name))

    if (!match)
      return

    let value = match[1]

    if (value[0] === '"')
      value = value.slice(1, -1)

    if (!options || !signed)
      return value

    const remote = this.get(signName)
    if (!remote)
      return

    const data = `${name}=${value}`

    if (!this.keys)
      throw new Error('.keys required for signed cookies')

    const index = this.keys.index(data, remote)
    if (index < 0) {
      this.set(signName, null, { path: '/', signed: false })
    }
    else {
      index && this.set(signName, this.keys.sign(data), { signed: false })
      return value
    }
  }
}

/**
 * Get the pattern to search for a cookie in a string.
 */
function getPattern(name: string): RegExp {
  if (!REGEXP_CACHE[name]) {
    REGEXP_CACHE[name] = new RegExp(
      `(?:^|;) *${
        name.replace(REGEXP_ESCAPE_CHARS_REGEXP, '\\$&')
      }=([^;]*)`,
    )
  }

  return REGEXP_CACHE[name]
}

/**
 * Get the encrypted status for a request.
 */
function isRequestEncrypted(req: IncomingMessage): boolean {
  return Boolean(req.socket
    ? (req.socket as any).encrypted
    : (req.connection as any).encrypted)
}

function pushCookie(headers: string[], cookie: Cookie): void {
  if (cookie.overwrite) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i].indexOf(`${cookie.name}=`) === 0) {
        headers.splice(i, 1)
      }
    }
  }

  headers.push(cookie.toHeader())
}
