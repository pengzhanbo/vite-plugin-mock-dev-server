import type { Connect } from 'vite'
import type { Logger } from '../core/logger.js'
import ansis from 'ansis'
import { doesProxyContextMatchUrl } from '../utils/index.js'

/**
 * 请求是否应直接交给后续中间件
 *
 * 在进入匹配流程之前过滤两类请求：
 * - URL 无法解析（如路径中存在非法的百分号编码），此时不可能匹配到任何 mock，
 *   必须记录原因，否则与「未命中 mock」无法区分；
 * - 请求不在插件的任何代理前缀内。
 *
 * @param req - Request object / 请求对象
 * @param pathname - Parsed pathname, empty when parsing failed / 解析后的路径名，解析失败时为空
 * @param urlError - Parse error / 解析错误
 * @param proxies - Proxy prefixes / 代理前缀
 * @param logger - Logger instance / 日志实例
 * @returns Whether to call `next()` / 是否调用 `next()`
 */
export function shouldPassThrough(
  req: Connect.IncomingMessage,
  pathname: string,
  urlError: Error | undefined,
  proxies: string[],
  logger: Logger,
): boolean {
  if (urlError) {
    logger.warn(
      `${ansis.yellow('Malformed request URL')} ${ansis.underline(req.url ?? '')}, the request is forwarded without mock\n  ${urlError.message}`,
    )
    return true
  }

  return (
    !pathname ||
    proxies.length === 0 ||
    !proxies.some((context) => doesProxyContextMatchUrl(context, req.url!))
  )
}
