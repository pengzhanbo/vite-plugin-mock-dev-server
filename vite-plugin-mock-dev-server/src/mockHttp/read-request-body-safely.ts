import type formidable from 'formidable'
import type { ServerResponse } from 'node:http'
import type { Connect } from 'vite'
import type { Logger } from '../core/logger.js'
import type { BodyParserOptions } from '../types/index.js'
import type { RequestBodyError } from './request-body-limit.js'
import type { ParsedRequestBody } from './request-body.js'
import ansis from 'ansis'
import { isRequestBodyError } from './request-body-limit.js'
import { parseRequestBodyWithRaw } from './request-body.js'
import { getHTTPStatusText } from './response-status.js'

/**
 * Read the request body and answer the request when it cannot be read
 *
 * 读取请求体，无法读取时直接结束请求
 *
 * An oversized body / aborted request is an expected client error: it is answered with
 * the matching status code and `undefined` is returned, while any other error still
 * bubbles up to the error boundary of the middleware.
 *
 * 请求体超限 / 客户端中断是可预期的客户端错误：以对应状态码结束请求并返回 `undefined`；
 * 其余异常仍向上抛出，由中间件的统一错误处理兜底。
 *
 * @param req - Request object / 请求对象
 * @param res - Response object / 响应对象
 * @param logger - Logger instance / 日志实例
 * @param formidableOptions - Formidable options / formidable 配置项
 * @param bodyParserOptions - Body parser options / 请求体解析配置项
 * @returns Parsed body, `undefined` when the request has been answered / 解析后的请求体，已结束请求时为 `undefined`
 */
export async function readRequestBodySafely(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  logger: Logger,
  formidableOptions: formidable.Options,
  bodyParserOptions: BodyParserOptions,
): Promise<ParsedRequestBody | undefined> {
  try {
    return await parseRequestBodyWithRaw(req, logger, formidableOptions, bodyParserOptions)
  } catch (error) {
    if (isRequestBodyError(error)) {
      handleRequestBodyError(req, res, logger, error)
      return undefined
    }
    throw error
  }
}

/**
 * Answer a request whose body could not be read
 *
 * 结束请求体无法读取的请求
 *
 * `BODY_TOO_LARGE` is answered with `413` so the client gets an explicit error instead
 * of a mock response built from a truncated body; an aborted request is only logged,
 * since its connection is already gone.
 *
 * `BODY_TOO_LARGE` 以 `413` 明确响应，避免客户端拿到基于不完整请求体构建的 mock 响应；
 * 客户端中断的请求只记录日志，因为连接已经不存在。
 *
 * @param req - Request object / 请求对象
 * @param res - Response object / 响应对象
 * @param logger - Logger instance / 日志实例
 * @param error - Body read error / 请求体读取错误
 */
export function handleRequestBodyError(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  logger: Logger,
  error: RequestBodyError,
): void {
  if (error.code === 'REQUEST_ABORTED') {
    logger.debug(`${ansis.yellow('mock request aborted')} ${req.url ?? ''}`)
    return
  }

  logger.warn(`${ansis.yellow('mock request body rejected')} ${req.url ?? ''}\n  ${error.message}`)

  if (res.writableEnded || res.destroyed) {
    return
  }
  // 响应已开始发送时无法再改写状态码，只能销毁连接
  // The response has started, so the status cannot be changed anymore: destroy it
  if (res.headersSent) {
    res.destroy()
    return
  }

  res.statusCode = error.statusCode
  res.statusMessage = getHTTPStatusText(error.statusCode)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end(error.message)
}
