import type { Connect } from 'vite'
import type { Logger } from '../core/logger.js'
import type { ResolvedRecordOptions } from '../types/index.js'
import ansis from 'ansis'
import { recordRequestWithRawReq } from '../recorder/index.js'

/**
 * Record the request and log it when no mock rule matches
 *
 * 未命中 mock 规则时记录请求并输出日志
 *
 * Requests that match a mock url but no rule are still candidates of record / replay,
 * so the body is stored before the request is passed to the following middleware.
 *
 * 命中 mock url 但没有可用规则的请求仍然是录制 / 回放的候选，
 * 因此在交给后续中间件之前需要保存请求体。
 *
 * @param req - Request object / 请求对象
 * @param pathname - Request pathname / 请求路径
 * @param mockUrls - Mock urls matching the pathname / 命中路径的 mock url
 * @param body - Parsed request body / 解析后的请求体
 * @param context - Logger and record options / 日志与录制配置
 */
export function handleMissingMock(
  req: Connect.IncomingMessage,
  pathname: string,
  mockUrls: string[],
  body: unknown,
  context: { logger: Logger; record: ResolvedRecordOptions },
): void {
  // 请求体录制时，需要记录请求体，以便后续回放时使用
  if (context.record.enabled) {
    recordRequestWithRawReq(req, pathname, body)
  }

  if (mockUrls.length > 0) {
    const matched = mockUrls.map((mockUrl) => ansis.dim(mockUrl)).join(', ')
    context.logger.warn(`${ansis.green(pathname)} matches ${matched}, but mock data is not found.`)
  }
}
