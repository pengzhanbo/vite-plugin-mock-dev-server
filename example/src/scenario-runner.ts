/**
 * Request builder and assertion evaluator shared by the dashboard and the e2e specs.
 *
 * 仪表盘与端到端用例共享的请求构建与断言逻辑。
 */
import type { Scenario, ScenarioExpect, ScenarioRequest, ScenarioVariant } from './scenarios.js'
import { LARGE_BODY_SIZE } from './scenarios.js'

/**
 * A normalized scenario result
 *
 * 归一化后的场景执行结果
 */
export interface ScenarioResult {
  status: number
  statusText: string
  duration: number
  headers: Record<string, string>
  contentType: string
  text: string
  body: any
  errors: string[]
}

/**
 * Request function used to run a scenario
 *
 * 执行场景时使用的请求函数
 */
export type ScenarioRequestFn = (url: string, init?: RequestInit) => Promise<Response>

/**
 * List every request rendered by a scenario.
 *
 * The primary request is first, followed by its variants. The dashboard renders
 * one button per entry and the e2e specs execute the same list.
 *
 * 列出场景需要渲染的请求。
 *
 * 主请求在前，变体在后。仪表盘为每个条目渲染一个按钮，端到端用例执行同一份列表。
 *
 * @param scenario - Scenario / 场景
 * @returns Request variants / 请求变体列表
 */
export function getScenarioRequests(scenario: Scenario): ScenarioVariant[] {
  return [
    {
      id: 'default',
      label: scenario.request.method ?? 'GET',
      request: scenario.request,
      expect: scenario.expect,
    },
    ...(scenario.variants ?? []),
  ]
}

/**
 * Build the fetch init of a request
 *
 * 构建请求的 fetch 配置
 *
 * @param request - Scenario request / 场景请求
 * @param scene - Global scene override / 全局场景覆盖
 * @returns Fetch init / fetch 配置
 */
export function buildScenarioInit(request: ScenarioRequest, scene?: string): RequestInit {
  const headers: Record<string, string> = {
    ...(scene ? { 'x-mock-scene': scene } : {}),
    ...request.headers,
  }
  let body: BodyInit | undefined

  if (request.largeJson) {
    headers['content-type'] ??= 'application/json'
    body = JSON.stringify({ data: 'x'.repeat(LARGE_BODY_SIZE) })
  } else if (request.json !== undefined) {
    headers['content-type'] ??= 'application/json'
    body = JSON.stringify(request.json)
  } else if (request.text !== undefined) {
    body = request.text
  }

  return {
    method: request.method ?? 'GET',
    headers,
    body,
  }
}

/**
 * Evaluate the expectation of a scenario
 *
 * 执行场景断言
 *
 * @param expect - Expectation / 断言配置
 * @param result - Scenario result / 场景结果
 * @returns Error messages, empty when passed / 错误信息，通过时为空数组
 */
export function evaluateScenarioExpectation(
  expect: ScenarioExpect | undefined,
  result: Omit<ScenarioResult, 'errors'>,
): string[] {
  const errors: string[] = []
  if (!expect) {
    return errors
  }

  if (expect.status !== undefined) {
    const statuses = Array.isArray(expect.status) ? expect.status : [expect.status]
    if (!statuses.includes(result.status)) {
      errors.push(`expected status ${statuses.join(' | ')}, received ${result.status}`)
    }
  }

  if (expect.contentType && !result.contentType.includes(expect.contentType)) {
    errors.push(
      `expected content-type to contain "${expect.contentType}", received "${result.contentType}"`,
    )
  }

  for (const [name, value] of Object.entries(expect.headers ?? {})) {
    const actual = result.headers[name.toLowerCase()]
    if (actual !== value) {
      errors.push(`expected header ${name}: "${value}", received "${actual ?? ''}"`)
    }
  }

  for (const [name, value] of Object.entries(expect.headerIncludes ?? {})) {
    const actual = result.headers[name.toLowerCase()] ?? ''
    if (!actual.includes(value)) {
      errors.push(`expected header ${name} to contain "${value}", received "${actual}"`)
    }
  }

  if (expect.minDuration !== undefined && result.duration < expect.minDuration) {
    errors.push(
      `expected duration >= ${expect.minDuration}ms, received ${Math.round(result.duration)}ms`,
    )
  }

  if (expect.body) {
    try {
      const checked = expect.body(result.body)
      if (checked !== true) {
        errors.push(checked || 'body assertion failed')
      }
    } catch (error) {
      errors.push(`body assertion threw: ${(error as Error).message}`)
    }
  }

  return errors
}

/**
 * Run a scenario request and evaluate its expectation
 *
 * 执行场景请求并断言
 *
 * @param request - Request function / 请求函数
 * @param scenario - Scenario / 场景
 * @param scene - Global scene override / 全局场景覆盖
 * @param variant - Optional request variant; defaults to the primary request / 可选的请求变体，默认执行主请求
 * @returns Scenario result / 场景结果
 */
export async function runScenario(
  request: ScenarioRequestFn,
  scenario: Scenario,
  scene?: string,
  variant?: ScenarioVariant,
): Promise<ScenarioResult> {
  const selected = variant ?? {
    id: 'default',
    label: scenario.request.method ?? 'GET',
    request: scenario.request,
    expect: scenario.expect,
  }
  const start = performance.now()
  const response = await request(selected.request.url, buildScenarioInit(selected.request, scene))
  const duration = performance.now() - start
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  const contentType = headers['content-type'] ?? ''
  const text = await response.text()
  let body: any = text
  if (contentType.includes('application/json') && text) {
    try {
      body = JSON.parse(text)
    } catch {
      // Keep the raw text when the response is not valid JSON
      // 响应不是合法 JSON 时保留原始文本
    }
  }

  const base = {
    status: response.status,
    statusText: response.statusText,
    duration,
    headers,
    contentType,
    text,
    body,
  }

  return {
    ...base,
    errors: evaluateScenarioExpectation(selected.expect, base),
  }
}
