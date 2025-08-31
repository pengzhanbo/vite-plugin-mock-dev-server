import type { Connect } from 'vite'
import type { Compiler } from '../compiler'
import type { ResolvedMockServerPluginOptions } from '../options'
import cors from 'cors'
import { doesProxyContextMatchUrl, isPathMatch, urlParse } from '../utils'

export function createCorsMiddleware(
  compiler: Compiler,
  { proxies, cors: corsOptions }: ResolvedMockServerPluginOptions,
): Connect.NextHandleFunction | undefined {
  return !corsOptions
    ? undefined
    : function (req, res, next) {
      const { pathname } = urlParse(req.url!)
      if (
        !pathname
        || proxies.length === 0
        || !proxies.some(context => doesProxyContextMatchUrl(context, req.url!))
      ) {
        return next()
      }

      const mockData = compiler.mockData

      const mockUrl = Object.keys(mockData).find(pattern => isPathMatch(pattern, pathname))

      if (!mockUrl)
        return next()

      cors(corsOptions)(req, res, next)
    }
}
