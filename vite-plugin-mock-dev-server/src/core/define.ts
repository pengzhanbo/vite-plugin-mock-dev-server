/**
 * fork for https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/define.ts
 *
 * 在 vite 内部，除了处理 用户配置的 `define`， 在处理环境变量 `env` 时，在不同的 mode 下使用了不同的内置插件，
 * - 在 production mode 下， `define` 和 `env` 均在 define-plugin 中进行处理；
 * - 在 development mode 下， `define` 由 define-plugin 处理，而 `env` 由 importAnalysis-plugin 处理;
 *
 * 在本插件中，简化了处理过程，仅提供 支持在 mock 文件中使用 `define` 和 `env`，并删除了不必要的边界处理。
 * 在 vite5 中，对 define 做了优化， 因此插件在 1.4.6 版本中进行了同步更新。
 *
 * 值得注意的是，如果 define 中存在 无法被 JSON.parse 解析的值，则会被直接忽略。
 * 所以类似 其它插件 注入的一些 代码片段 的字符串值，在 mock 文件中都不能使用。
 */

import type { ResolvedConfig } from 'vite'
import process from 'node:process'

export function viteDefine(config: ResolvedConfig): Record<string, string> {
  const processNodeEnv: Record<string, string> = {}

  const nodeEnv = process.env.NODE_ENV || config.mode
  Object.assign(processNodeEnv, {
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    'global.process.env.NODE_ENV': JSON.stringify(nodeEnv),
    'globalThis.process.env.NODE_ENV': JSON.stringify(nodeEnv),
  })

  const userDefine: Record<string, string> = {}
  const userDefineEnv: Record<string, string> = {}
  for (const key in config.define) {
    // fix: #31 https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31
    // fix: #71 https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/71
    const val = config.define[key]
    const isMetaEnv = key.startsWith('import.meta.env.')
    if (typeof val === 'string') {
      if (canJsonParse(val)) {
        userDefine[key] = val
        if (isMetaEnv)
          userDefineEnv[key.slice(16)] = val
      }
    }
    else {
      userDefine[key] = handleDefineValue(val)
      if (isMetaEnv)
        userDefineEnv[key.slice(16)] = val
    }
  }

  // during dev, import.meta properties are handled by importAnalysis plugin.
  const importMetaKeys: Record<string, string> = {}
  const importMetaEnvKeys: Record<string, string> = {}
  const importMetaFallbackKeys: Record<string, string> = {}
  importMetaKeys['import.meta.hot'] = `undefined`
  for (const key in config.env) {
    const val = JSON.stringify(config.env[key])
    importMetaKeys[`import.meta.env.${key}`] = val
    importMetaEnvKeys[key] = val
  }
  importMetaFallbackKeys['import.meta.env'] = `undefined`

  const define = {
    ...processNodeEnv,
    ...importMetaKeys,
    ...userDefine,
    ...importMetaFallbackKeys,
  }

  // fix: #71 https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/71
  if ('import.meta.env' in define) {
    define['import.meta.env'] = serializeDefine({
      ...importMetaEnvKeys,
      ...userDefineEnv,
    })
  }
  return define
}

/**
 * Like `JSON.stringify` but keeps raw string values as a literal
 * in the generated code. For example: `"window"` would refer to
 * the global `window` object directly.
 */
export function serializeDefine(define: Record<string, any>): string {
  let res = `{`
  const keys = Object.keys(define)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const val = define[key]
    res += `${JSON.stringify(key)}: ${handleDefineValue(val)}`
    if (i !== keys.length - 1)
      res += `, `
  }
  return `${res}}`
}

function handleDefineValue(value: any): string {
  if (typeof value === 'undefined')
    return 'undefined'
  if (typeof value === 'string')
    return value
  return JSON.stringify(value)
}

function canJsonParse(value: any): boolean {
  try {
    JSON.parse(value)
    return true
  }
  catch {
    return false
  }
}
