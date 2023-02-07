import type * as http from 'node:http'
import type { Connect, ResolvedConfig } from 'vite'
import { baseMiddleware } from './baseMiddleware'
import { MockLoader } from './MockLoader'
import type { MockServerPluginOptions } from './types'
import { isArray } from './utils'

export async function mockServerMiddleware(
  httpServer: http.Server | null,
  config: ResolvedConfig,
  options: Required<MockServerPluginOptions>,
): Promise<Connect.NextHandleFunction> {
  const include = isArray(options.include) ? options.include : [options.include]
  const exclude = isArray(options.exclude) ? options.exclude : [options.exclude]

  const define: ResolvedConfig['define'] = {}
  if (config.define) {
    for (const key in config.define) {
      const val = config.define[key]
      define[key] = typeof val === 'string' ? val : JSON.stringify(val)
    }
  }

  const loader = new MockLoader({
    include,
    exclude,
    define,
  })

  await loader.load()
  httpServer?.on('close', () => loader.close())

  /**
   * 获取 服务代理配置中，配置的 请求前缀，
   * 作为判断接口是否需要mock的首要条件。
   *
   * 在一般开发场景中，我们也只需要对通过 vite server 进行代理的请求 进行 mock
   */
  const proxies: string[] = Object.keys(config.server.proxy || {})

  return baseMiddleware(loader, {
    formidableOptions: options.formidableOptions,
    proxies,
  })
}
