// fork for https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/define.ts
//
// 在 vite 内部，除了处理 用户配置的 `define`， 在处理环境变量 `env` 时，在不同的 mode 下使用了不同的内置插件，
// - 在 production mode 下， `define` 和 `env` 均在 define-plugin 中进行处理；
// - 在 development mode 下， `define` 由 define-plugin 处理，而 `env` 由 importAnalysis-plugin 处理;
//
// 在本插件中，简化了处理过程，仅提供 支持在 mock 文件中使用 `define` 和 `env`，并删除了不必要的边界处理。
// 而存在的问题则是，插件并没有对`.env` 文件进行监听，即 `env` 发生变化，不会触发插件的热更新。

import colors from 'picocolors'
import type { ResolvedConfig } from 'vite'
import { log } from './utils'

const metaEnvRe = /import\.meta\.env\.(.+)/

export function viteDefine(config: ResolvedConfig) {
  const processNodeEnv: Record<string, string> = {}

  const nodeEnv = process.env.NODE_ENV || config.mode
  Object.assign(processNodeEnv, {
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    'global.process.env.NODE_ENV': JSON.stringify(nodeEnv),
    'globalThis.process.env.NODE_ENV': JSON.stringify(nodeEnv),
    '__vite_process_env_NODE_ENV': JSON.stringify(nodeEnv),
  })

  const userDefine: Record<string, string> = {}
  const userDefineEnv: Record<string, string> = {}
  const defineErrorKeys = []
  for (const key in config.define) {
    // fix: #31 https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31
    const val = config.define[key]
    if (typeof val === 'string') {
      try {
        JSON.parse(val)
        userDefine[key] = val
      } catch {
        defineErrorKeys.push(key)
      }
    } else {
      userDefine[key] = JSON.stringify(val)
    }

    // make sure `import.meta.env` object has user define properties
    const match = key.match(metaEnvRe)
    if (match && userDefine[key]) {
      userDefineEnv[match[1]] = `__vite__define__${userDefine[key]}`
    }
  }

  if (defineErrorKeys.length) {
    log.error(
      `${colors.yellow('[warn]')} The following keys: ${colors.yellow(
        colors.underline(defineErrorKeys.join(', ')),
      )} declared in 'define' cannot be parsed as regular code snippets.`,
    )
  }

  const importMetaKeys: Record<string, string> = {}
  const importMetaFallbackKeys: Record<string, string> = {}

  // set here to allow override with config.define
  importMetaKeys['import.meta.hot'] = 'undefined'
  for (const key in config.env) {
    importMetaKeys[`import.meta.env.${key}`] = JSON.stringify(config.env[key])
  }
  Object.assign(importMetaFallbackKeys, {
    'import.meta.env': JSON.stringify({
      ...config.env,
      ...userDefineEnv,
    }).replace(
      /"__vite__define__(.+?)"([,}])/g,
      (_, val, suffix) => `${val.replace(/(^\\")|(\\"$)/g, '"')}${suffix}`,
    ),
  })

  return {
    ...importMetaKeys,
    ...userDefine,
    ...importMetaFallbackKeys,
    ...processNodeEnv,
  }
}
