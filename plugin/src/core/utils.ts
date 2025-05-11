import type { ParsedUrlQuery } from 'node:querystring'
import type { Readable, Stream } from 'node:stream'
import type { ResolvedConfig } from 'vite'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parse as queryParse } from 'node:querystring'
import { fileURLToPath, URL } from 'node:url'
import Debug from 'debug'
import { match } from 'path-to-regexp'

export function isStream(stream: unknown): stream is Stream {
  return stream !== null
    && typeof stream === 'object'
    && typeof (stream as any).pipe === 'function'
}

export function isReadableStream(stream: unknown): stream is Readable {
  return isStream(stream)
    && (stream as any).readable !== false
    && typeof (stream as any)._read === 'function'
    && typeof (stream as any)._readableState === 'object'
}

export function getDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl))
}

export const debug: Debug.Debugger = Debug('vite:mock-dev-server')

interface LookupFileOptions {
  pathOnly?: boolean
  rootDir?: string
  predicate?: (file: string) => boolean
}

export function lookupFile(
  dir: string,
  formats: string[],
  options?: LookupFileOptions,
): string | undefined {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const result = options?.pathOnly
        ? fullPath
        : fs.readFileSync(fullPath, 'utf-8')
      if (!options?.predicate || options.predicate(result))
        return result
    }
  }
  const parentDir = path.dirname(dir)
  if (
    parentDir !== dir
    && (!options?.rootDir || parentDir.startsWith(options?.rootDir))
  ) {
    return lookupFile(parentDir, formats, options)
  }
}

export function ensureProxies(
  serverProxy: ResolvedConfig['server']['proxy'] = {},
): { httpProxies: string[], wsProxies: string[] } {
  const httpProxies: string[] = []
  const wsProxies: string[] = []
  Object.keys(serverProxy).forEach((key) => {
    const value = serverProxy[key]
    if (
      typeof value === 'string'
      || (!value.ws
        && !value.target?.toString().startsWith('ws:')
        && !value.target?.toString().startsWith('wss:'))
    ) {
      httpProxies.push(key)
    }
    else {
      wsProxies.push(key)
    }
  })
  return { httpProxies, wsProxies }
}

export function doesProxyContextMatchUrl(
  context: string,
  url: string,
): boolean {
  return (
    (context[0] === '^' && new RegExp(context).test(url))
    || url.startsWith(context)
  )
}

export function parseParams(pattern: string, url: string): Record<string, any> {
  const urlMatch = match(pattern, { decode: decodeURIComponent })(url) || {
    params: {},
  }
  return urlMatch.params || {}
}

/**
 * nodejs 从 19.0.0 开始 弃用 url.parse，因此使用 url.parse 来解析 可能会报错，
 * 使用 URL 来解析
 */
export function urlParse(input: string): {
  pathname: string
  query: ParsedUrlQuery
} {
  const url = new URL(input, 'http://example.com')
  const pathname = decodeURIComponent(url.pathname)
  const query = queryParse(url.search.replace(/^\?/, ''))
  return { pathname, query }
}

const windowsSlashRE = /\\/g
const isWindows = os.platform() === 'win32'

export function slash(p: string): string {
  return p.replace(windowsSlashRE, '/')
}
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}
