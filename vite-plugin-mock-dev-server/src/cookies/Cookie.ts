import type { SetCookieOption } from './types'
import {
  fieldContentRegExp,
  PRIORITY_REGEXP,
  RESTRICTED_NAME_CHARS_REGEXP,
  RESTRICTED_VALUE_CHARS_REGEXP,
  SAME_SITE_REGEXP,
} from './constants'

export class Cookie {
  name!: string
  value: string | undefined | null

  maxAge: number | undefined
  expires: Date | undefined
  path = '/'
  domain: string | undefined
  secure = false
  httpOnly = true
  sameSite: SetCookieOption['sameSite'] = false
  overwrite = false
  priority: SetCookieOption['priority'] | undefined
  partitioned: boolean | undefined

  constructor(name: string, value?: string | null, options: SetCookieOption = {}) {
    if (!fieldContentRegExp.test(name) || RESTRICTED_NAME_CHARS_REGEXP.test(name)) {
      throw new TypeError('argument name is invalid')
    }

    if (value && (!fieldContentRegExp.test(value) || RESTRICTED_VALUE_CHARS_REGEXP.test(value)))
      throw new TypeError('argument value is invalid')

    this.name = name
    this.value = value

    Object.assign(this, options)

    if (!this.value) {
      this.expires = new Date(0)
      this.maxAge = undefined
    }

    if (this.path && !fieldContentRegExp.test(this.path)) {
      throw new TypeError('[Cookie] option path is invalid')
    }

    if (this.domain && !fieldContentRegExp.test(this.domain)) {
      throw new TypeError('[Cookie] option domain is invalid')
    }

    if (typeof this.maxAge === 'number' ? (Number.isNaN(this.maxAge) || !Number.isFinite(this.maxAge)) : this.maxAge) {
      throw new TypeError('[Cookie] option maxAge is invalid')
    }

    if (this.priority && !PRIORITY_REGEXP.test(this.priority)) {
      throw new TypeError('[Cookie] option priority is invalid')
    }

    if (this.sameSite && this.sameSite !== true && !SAME_SITE_REGEXP.test(this.sameSite)) {
      throw new TypeError('[Cookie] option sameSite is invalid')
    }
  }

  toString(): string {
    return `${this.name}=${this.value}`
  }

  toHeader(): string {
    let header = this.toString()

    if (this.maxAge)
      this.expires = new Date(Date.now() + this.maxAge)

    if (this.path)
      header += `; path=${this.path}`
    if (this.expires)
      header += `; expires=${this.expires.toUTCString()}`
    if (this.domain)
      header += `; domain=${this.domain}`
    if (this.priority)
      header += `; priority=${this.priority.toLowerCase()}`
    if (this.sameSite)
      header += `; samesite=${this.sameSite === true ? 'strict' : this.sameSite.toLowerCase()}`
    if (this.secure)
      header += '; secure'
    if (this.httpOnly)
      header += '; httponly'
    if (this.partitioned)
      header += '; partitioned'

    return header
  }
}
