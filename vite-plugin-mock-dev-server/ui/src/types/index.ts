export type LocaleLanguage = 'zh-CN' | 'en-US'

export interface Locale {
  [key: string]: string
}

export type Appearance = 'light' | 'dark' | 'auto'

export interface AppStore {
  locale: LocaleLanguage
  appearance: Appearance
  mockList: [string, MockItem[]][]
  active: string
  testing: MockItem | null
}

export interface MockItem {
  url: string
  enabled: boolean
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE' | 'OPTIONS'
  headers?: Record<string, string> | '<function>'
  status?: number
  statusText?: string
  delay?: number | number[]
  cookies?: Record<string, string | [string, Record<string, any>]> | '<function>'
  type?: 'text' | 'json' | 'buffer' | string
  body?: any | '<function>' | '<buffer>' | '<stream>'
  response?: '<function>'
  validator?: {
    query?: Record<string, any>
    refererQuery?: Record<string, any>
    body?: Record<string, any>
    params?: Record<string, any>
  } | '<function>'
  error?: {
    probability?: number
    status?: number
    statusText?: string
    body?: any
  }
  __filepath__: string
}

export interface KeyValue {
  key: string
  value: string | FileList
  type: 'text' | 'file'
}

export interface TestRequest {
  url: string
  method: string
  body: {
    'raw': string
    'form-data': KeyValue[]
    'x-www-form-urlencoded': KeyValue[]
    'binary'?: FileList
  }
  query: KeyValue[]
  params: KeyValue[]
  headers: KeyValue[]
  bodyType: 'raw' | 'form-data' | 'x-www-form-urlencoded' | 'binary'
}

export interface TestResponse {
  status?: number
  statusText?: string
  body?: any
  type?: string
  headers?: Record<string, string>
  timestamp?: number
  error?: {
    type: 'network' | 'timeout' | 'abort' | 'unknown'
    message: string
  }
}
