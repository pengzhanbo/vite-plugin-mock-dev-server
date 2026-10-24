// oxlint-disable max-lines
/**
 * Feature scenario manifest of the example.
 *
 * The dashboard renders every scenario from this manifest, and the end-to-end
 * specs execute the very same list against the example project. Keeping a single
 * source of truth guarantees that a scenario shown in the UI is also covered by
 * the automated regression tests.
 *
 * 示例的功能场景清单。
 *
 * 仪表盘根据该清单渲染全部场景，端到端用例则对同一个清单执行请求。
 * 单一数据源保证 UI 中展示的场景一定同时被自动化回归用例覆盖。
 */

/**
 * Expectation of a scenario
 *
 * 场景断言
 */
export interface ScenarioExpect {
  /**
   * Expected status code(s)
   *
   * 期望状态码
   */
  status?: number | number[]
  /**
   * Expected `content-type` substring
   *
   * 期望的 `content-type` 子串
   */
  contentType?: string
  /**
   * Expected response headers (exact value)
   *
   * 期望的响应头（精确匹配）
   */
  headers?: Record<string, string>
  /**
   * Expected response header substrings
   *
   * 期望的响应头子串
   */
  headerIncludes?: Record<string, string>
  /**
   * Minimum response duration in milliseconds
   *
   * 最小响应耗时（毫秒）
   */
  minDuration?: number
  /**
   * Body assertion, returns `true` or an error message
   *
   * 响应体断言，返回 `true` 或错误信息
   */
  body?: (body: any) => boolean | string
}

/**
 * Request definition of a scenario
 *
 * 场景请求定义
 */
export interface ScenarioRequest {
  url: string
  method?: string
  headers?: Record<string, string>
  /** JSON request body / JSON 请求体 */
  json?: unknown
  /** Plain text request body / 文本请求体 */
  text?: string
  /** Request body size used to exceed the parse limit / 用于触发解析上限的请求体 */
  largeJson?: boolean
}

/**
 * An additional request variant of a scenario.
 *
 * Variants are rendered as extra buttons in the same card, so related requests
 * (for example GET and POST against the same rule) can be compared without
 * splitting them into separate blocks.
 *
 * 场景的额外请求变体。
 *
 * 变体会在同一张卡片中渲染为额外按钮，便于比较同一规则下的 GET / POST 等请求，
 * 而不必拆成多个区块。
 */
export interface ScenarioVariant {
  /** Stable id unique within the scenario / 场景内唯一 id */
  id: string
  /** Button label, such as GET or POST / 按钮文本，如 GET、POST */
  label: string
  request: ScenarioRequest
  expect?: ScenarioExpect
}

/**
 * A single feature scenario
 *
 * 单个功能场景
 */
export interface Scenario {
  id: string
  title: string
  description: string
  /** Primary request, rendered as the first button / 主请求，渲染为第一个按钮 */
  request: ScenarioRequest
  expect?: ScenarioExpect
  /** Extra request variants rendered as additional buttons / 额外请求变体 */
  variants?: ScenarioVariant[]
  /**
   * Human-readable hint about hidden dependencies, state or browser limitations
   *
   * 关于隐藏依赖、共享状态或浏览器限制的说明
   */
  hint?: string
}

/**
 * A group of scenarios
 *
 * 一组场景
 */
export interface ScenarioGroup {
  id: string
  title: string
  description: string
  scenarios: Scenario[]
}

/**
 * Special scenarios rendered as dedicated panels
 *
 * 以独立面板呈现的特殊场景
 */
export interface SpecialScenario {
  id: string
  title: string
  description: string
  kind: 'sse' | 'ws' | 'upload' | 'download' | 'cors' | 'record'
  /** Relative mock/plugin file shown in the card / 卡片中展示的 mock/插件文件 */
  mockFile?: string
}

/**
 * Build a body assertion result
 *
 * 生成响应体断言结果
 *
 * @param passed - Whether the assertion passed / 是否通过
 * @param message - Error message / 错误信息
 * @returns `true` or the message / `true` 或错误信息
 */
function assert(passed: boolean, message: string): true | string {
  return passed || message
}

/**
 * Assert the example's JSON 404 response
 *
 * 断言示例返回的 JSON 404 响应
 *
 * @param body - Response body / 响应体
 * @returns Assertion result / 断言结果
 */
function notFound(body: any): true | string {
  return assert(body?.message === 'No mock matched', 'expected the example 404 response')
}

/**
 * Check whether a nested value can be read without throwing
 *
 * 安全读取嵌套值
 *
 * @param read - Reader / 读取函数
 * @returns The value or `undefined` / 值或 `undefined`
 */
function safe<T>(read: () => T): T | undefined {
  try {
    return read()
  } catch {
    return undefined
  }
}

/**
 * Size of the oversized request body used by `largeJson`
 *
 * `largeJson` 使用的超限请求体大小
 */
export const LARGE_BODY_SIZE: number = 70 * 1024

export const scenarioGroups: ScenarioGroup[] = [
  {
    id: 'basic',
    title: '文件与匹配',
    description: '不同扩展名的 mock 文件、正则 prefix、exclude、enabled 与 fallback 规则。',
    scenarios: [
      {
        id: 'file-json',
        title: 'JSON 文件',
        description: '使用 .mock.json 编写 mock 配置。',
        request: { url: '/api/json' },
        expect: {
          body: (body) =>
            assert(
              safe(() => body.message.includes('json file')) === true,
              'expected the json mock message',
            ),
        },
      },
      {
        id: 'file-json5',
        title: 'JSON5 文件',
        description: '使用 .mock.json5 编写 mock 配置。',
        request: { url: '/api/json5' },
        expect: {
          body: (body) =>
            assert(
              safe(() => body.message.includes('json5 file')) === true,
              'expected the json5 mock message',
            ),
        },
      },
      {
        id: 'file-javascript',
        title: 'JavaScript 文件',
        description: '使用 .mock.js / .mock.mjs / .mock.cjs 编写 mock 配置。',
        request: { url: '/api/javascript' },
        expect: {
          body: (body) =>
            assert(
              safe(() => body.message.includes('js file')) === true,
              'expected the javascript mock message',
            ),
        },
      },
      {
        id: 'file-esm',
        title: 'ESModule 文件',
        description: '使用 .mock.mjs 编写 mock 配置。',
        request: { url: '/api/es-module-js' },
        expect: {
          body: (body) =>
            assert(
              safe(() => body.message.includes('ESModule')) === true,
              'expected the esm mock message',
            ),
        },
      },
      {
        id: 'file-commonjs',
        title: 'CommonJS 文件',
        description: '使用 .mock.cjs 编写 mock 配置。',
        request: { url: '/api/common-js' },
        expect: {
          body: (body) =>
            assert(
              safe(() => body.message.includes('CommonJs')) === true,
              'expected the cjs mock message',
            ),
        },
      },
      {
        id: 'file-typescript',
        title: 'TypeScript 文件',
        description: '使用 .mock.ts 编写 mock 配置。',
        request: { url: '/api/typescript' },
        expect: {
          body: (body) =>
            assert(
              safe(() => body.message.includes('typescript')) === true,
              'expected the ts mock message',
            ),
        },
      },
      {
        id: 'prefix-regexp',
        title: '正则 prefix',
        description: 'prefix 以 ^ 开头时按正则匹配。',
        request: { url: '/api-dev/list/get' },
        expect: {
          body: (body) =>
            assert(body.message === 'api-dev list get', 'expected the api-dev list message'),
        },
      },
      {
        id: 'fallback',
        title: '通配兜底',
        description: '仅 /api/fallback 命名空间由 /api/fallback{/*rest} 兜底。',
        request: { url: '/api/fallback/not-exists' },
        expect: {
          status: 200,
          body: (body) =>
            assert(body.message === 'This request fallback', 'expected the fallback message'),
        },
      },
      {
        id: 'missing',
        title: '未配置路径 404',
        description: '没有匹配规则时返回 404，而不是被全局兜底吞掉。',
        request: { url: '/api/not-exists' },
        expect: {
          status: 404,
          body: notFound,
        },
      },
      {
        id: 'excluded',
        title: 'excluded 规则 404',
        description: 'exclude: ignored/** 使该目录下的 mock 不会被加载，请求返回 404。',
        request: { url: '/api/ignored' },
        expect: {
          status: 404,
          body: notFound,
        },
      },
      {
        id: 'disabled',
        title: 'enabled: false 返回 404',
        description: 'enabled 为 false 的规则在编译阶段被丢弃，请求返回 404。',
        request: { url: '/api/disabled' },
        expect: {
          status: 404,
          body: notFound,
        },
      },
      {
        id: 'enabled',
        title: 'enabled 默认启用',
        description: '未配置 enabled 时规则默认生效。',
        request: { url: '/api/enabled' },
        expect: {
          body: (body) => assert(body.enabled === true, 'expected the enabled mock'),
        },
      },
    ],
  },
  {
    id: 'method',
    title: '请求方法与 CRUD',
    description: 'method 匹配、默认 GET+POST、PUT/DELETE，以及 defineMockData 的增删改查。',
    scenarios: [
      {
        id: 'method-get',
        title: '仅允许 GET',
        description: '同一张卡片中对比 GET 命中与 POST 不匹配的 404。',
        hint: 'GET 命中规则；POST 不满足 method: GET，返回 404（不是兜底响应）。',
        request: { url: '/api/only-get-method' },
        expect: {
          status: 200,
          body: (body) =>
            assert(
              body.message === 'Only get request methods are allowed',
              'expected the GET-only message',
            ),
        },
        variants: [
          {
            id: 'post',
            label: 'POST',
            request: { url: '/api/only-get-method', method: 'POST' },
            expect: {
              status: 404,
              body: notFound,
            },
          },
        ],
      },
      {
        id: 'method-get-and-post',
        title: 'GET + POST',
        description: '同一张卡片中对比 GET、POST 命中与 PUT 不匹配的 404。',
        request: { url: '/api/allow-get-and-post' },
        expect: {
          status: 200,
          body: (body) =>
            assert(
              body.message === 'Allow get and post request methods',
              'expected the multi-method message',
            ),
        },
        variants: [
          {
            id: 'post',
            label: 'POST',
            request: { url: '/api/allow-get-and-post', method: 'POST' },
            expect: {
              status: 200,
              body: (body) =>
                assert(
                  body.message === 'Allow get and post request methods',
                  'expected the multi-method message for POST',
                ),
            },
          },
          {
            id: 'put',
            label: 'PUT',
            request: { url: '/api/allow-get-and-post', method: 'PUT' },
            expect: {
              status: 404,
              body: notFound,
            },
          },
        ],
      },
      {
        id: 'crud-reset',
        title: 'CRUD 重置',
        description: '重置 defineMockData 中的共享数据。',
        request: { url: '/api/crud/reset', method: 'POST' },
        expect: {
          body: (body) =>
            assert(body.reset === true && body.list.length === 2, 'expected the initial list'),
        },
      },
      {
        id: 'crud-create',
        title: 'CRUD 新增',
        description: 'POST 创建数据，并使用 defineMockData 的 setter 更新共享数据。',
        request: {
          url: '/api/crud/items',
          method: 'POST',
          json: { title: 'third item' },
        },
        expect: {
          body: (body) =>
            assert(
              body.created?.title === 'third item' && body.list.length === 3,
              'expected the created item',
            ),
        },
      },
      {
        id: 'crud-update',
        title: 'CRUD 更新',
        description: 'PUT 更新数据。',
        request: {
          url: '/api/crud/items/3',
          method: 'PUT',
          json: { title: 'updated item' },
        },
        expect: {
          body: (body) =>
            assert(
              body.updated === 3 && body.list?.[2]?.title === 'updated item',
              'expected the updated item',
            ),
        },
      },
      {
        id: 'crud-delete',
        title: 'CRUD 删除',
        description: 'DELETE 删除数据。',
        request: { url: '/api/crud/items/3', method: 'DELETE' },
        expect: {
          body: (body) =>
            assert(body.deleted === 3 && body.list.length === 2, 'expected the item to be deleted'),
        },
      },
      {
        id: 'crud-list',
        title: 'CRUD 列表',
        description: 'GET 返回最新的共享数据。',
        request: { url: '/api/crud/items' },
        expect: {
          body: (body) => assert(body.length === 2, 'expected two items after deletion'),
        },
      },
    ],
  },
  {
    id: 'path',
    title: '路径匹配',
    description: '动态参数、可选参数、通配符、静态优先与 priority.special。',
    scenarios: [
      {
        id: 'path-dynamic',
        title: '动态参数',
        description: '/api/path/dynamic/:id 解析 params.id。',
        request: { url: '/api/path/dynamic/42' },
        expect: {
          body: (body) =>
            assert(body.kind === 'dynamic' && body.id === '42', 'expected params.id to be 42'),
        },
      },
      {
        id: 'path-optional-empty',
        title: '可选参数（省略）',
        description: '/api/path/optional{/:id} 允许省略参数。',
        request: { url: '/api/path/optional' },
        expect: {
          body: (body) =>
            assert(body.kind === 'optional' && body.id == null, 'expected an omitted id'),
        },
      },
      {
        id: 'path-optional-value',
        title: '可选参数（传入）',
        description: '/api/path/optional{/:id} 也能捕获参数。',
        request: { url: '/api/path/optional/7' },
        expect: {
          body: (body) => assert(body.id === '7', 'expected params.id to be 7'),
        },
      },
      {
        id: 'path-wildcard',
        title: '通配符',
        description: '/*segments 捕获一个或多个路径片段（数组）。',
        request: { url: '/api/path/wild/a/b/c' },
        expect: {
          body: (body) =>
            assert(
              Array.isArray(body.segments) && body.segments.join('/') === 'a/b/c',
              'expected wildcard segments',
            ),
        },
      },
      {
        id: 'path-zero',
        title: '可选通配符（零片段）',
        description: '{/*segments} 允许零个路径片段。',
        request: { url: '/wildcard/zero' },
        expect: {
          body: (body) =>
            assert(
              body.kind === 'zero-or-more' && body.segments.length === 0,
              'expected zero segments',
            ),
        },
      },
      {
        id: 'path-zero-segments',
        title: '可选通配符（多片段）',
        description: '{/*segments} 也能捕获多个片段。',
        request: { url: '/wildcard/zero/a/b' },
        expect: {
          body: (body) =>
            assert(
              Array.isArray(body.segments) && body.segments.join('/') === 'a/b',
              'expected optional wildcard segments',
            ),
        },
      },
      {
        id: 'path-static-priority',
        title: '静态优先于动态',
        description: '/api/path/static 优先命中静态规则。',
        request: { url: '/api/path/static' },
        expect: {
          body: (body) => assert(body.kind === 'static', 'expected the static rule to win'),
        },
      },
      {
        id: 'priority-default',
        title: '默认优先级',
        description: '参数越靠后的规则优先级越高，.../a/b/:third 获胜。',
        request: { url: '/api/priority/default/a/b/c' },
        expect: {
          body: (body) =>
            assert(
              body.winner === '/api/priority/default/a/b/:third',
              'expected the default priority rule to win',
            ),
        },
      },
      {
        id: 'priority-global',
        title: 'priority.global',
        description: '配置 global 后，指定规则在全局范围内优先。',
        request: { url: '/api/priority/global/a/b/c' },
        expect: {
          body: (body) =>
            assert(
              body.winner === '/api/priority/global/:first/b/c',
              'expected the global priority rule to win',
            ),
        },
      },
      {
        id: 'priority-special',
        title: 'priority.special',
        description: '配置 special 后，参数更靠前的规则被提升到首位。',
        request: { url: '/api/priority/special/a/b/c' },
        expect: {
          body: (body) =>
            assert(
              body.winner === '/api/priority/special/:first/b/c',
              'expected the promoted rule to win',
            ),
        },
      },
      {
        id: 'priority-static',
        title: '静态规则优先',
        description: '/api/priority/static 不会被 /api/priority/:id 抢走。',
        request: { url: '/api/priority/static' },
        expect: {
          body: (body) => assert(body.kind === 'static', 'expected the static rule to win'),
        },
      },
    ],
  },
  {
    id: 'request',
    title: '请求解析',
    description: 'query、params、body、headers、refererQuery、cookie 与请求体解析上限。',
    scenarios: [
      {
        id: 'request-echo',
        title: '完整请求信息',
        description: '回显 query、params、body、headers、refererQuery 与 cookie。',
        request: {
          url: '/api/request/echo/7?tab=profile',
          method: 'POST',
          headers: {
            'x-demo': 'yes',
            'referer': 'http://localhost:5173/page?from=post-page',
            'cookie': 'demo-cookie=allowed',
          },
          json: { hello: 'world' },
        },
        expect: {
          body: (body) =>
            assert(
              body.params?.id === '7' &&
                body.query?.tab === 'profile' &&
                body.body?.hello === 'world' &&
                body.refererQuery?.from === 'post-page' &&
                body.cookie === 'allowed' &&
                body.headers?.['x-demo'] === 'yes',
              'expected the full request extras',
            ),
        },
      },
      {
        id: 'request-text',
        title: 'text/plain 请求体',
        description: 'text/plain 请求体被解析为字符串。',
        request: {
          url: '/api/request/echo-text',
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          text: 'plain text body',
        },
        expect: {
          body: (body) => assert(body.body === 'plain text body', 'expected the plain text body'),
        },
      },
      {
        id: 'request-form',
        title: 'urlencoded 请求体',
        description: 'application/x-www-form-urlencoded 请求体被解析为对象。',
        request: {
          url: '/api/request/echo-form',
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          text: 'a=1&b=2',
        },
        expect: {
          body: (body) =>
            assert(body.body?.a === '1' && body.body?.b === '2', 'expected the parsed form body'),
        },
      },
      {
        id: 'request-validator-headers',
        title: 'validator.headers 命中',
        description: '对象校验器匹配请求头。',
        hint: '请求头必须包含 x-api-key: secret。',
        request: {
          url: '/api/request/validator-headers',
          headers: { 'x-api-key': 'secret' },
        },
        expect: {
          body: (body) => assert(body.matched === 'headers', 'expected the header validator'),
        },
      },
      {
        id: 'request-validator-headers-fallback',
        title: 'validator.headers 未命中',
        description: '请求头不匹配时使用同路径的兜底规则。',
        hint: '不发送 x-api-key，或值不是 secret 时命中 fallback。',
        request: { url: '/api/request/validator-headers' },
        expect: {
          body: (body) => assert(body.matched === 'fallback', 'expected the fallback rule'),
        },
      },
      {
        id: 'request-validator-referer',
        title: 'validator.refererQuery 命中',
        description: '根据来源页面 query 选择规则。',
        hint: 'Referer 必须是 http://localhost:5173/page?from=dashboard；from=dashboard 是命中条件。',
        request: {
          url: '/api/request/validator-referer',
          headers: { referer: 'http://localhost:5173/page?from=dashboard' },
        },
        expect: {
          body: (body) => assert(body.matched === 'referer', 'expected the referer validator'),
        },
      },
      {
        id: 'request-validator-referer-fallback',
        title: 'validator.refererQuery 未命中',
        description: '来源页面 query 不匹配时使用兜底规则。',
        hint: '不发送 Referer，或 from 不是 dashboard 时命中 fallback。',
        request: { url: '/api/request/validator-referer' },
        expect: {
          body: (body) => assert(body.matched === 'fallback', 'expected the fallback rule'),
        },
      },
      {
        id: 'request-validator-function',
        title: '函数校验器命中',
        description: '函数校验器同时读取 query 与 cookie。',
        hint: '需要 query role=admin 且 cookie demo-cookie=allowed；示例代理会发送这两个条件。',
        request: {
          url: '/api/request/validator-function?role=admin',
          headers: { cookie: 'demo-cookie=allowed' },
        },
        expect: {
          body: (body) => assert(body.matched === 'admin', 'expected the admin validator'),
        },
      },
      {
        id: 'request-validator-function-fallback',
        title: '函数校验器未命中',
        description: '条件不满足时使用兜底规则。',
        hint: '缺少 role=admin 或 demo-cookie=allowed 时命中 guest fallback。',
        request: { url: '/api/request/validator-function' },
        expect: {
          body: (body) => assert(body.matched === 'guest', 'expected the guest fallback'),
        },
      },
      {
        id: 'request-body-parser',
        title: '请求体解析成功',
        description: '正常大小的 JSON 请求体解析为对象。',
        request: {
          url: '/api/request/body-parser',
          method: 'POST',
          json: { ok: true },
        },
        expect: {
          body: (body) => assert(body.parsed === true, 'expected the body to be parsed'),
        },
      },
      {
        id: 'request-body-limit',
        title: '请求体超过上限',
        description: '超过 bodyParserOptions.jsonLimit 的请求在读取阶段被拒绝，返回 413。',
        hint: '请求体约 70KB，超过 jsonLimit: 64kb；插件在读取请求体时即返回 413 Payload Too Large，不会把不完整的请求体交给 mock。',
        request: {
          url: '/api/request/body-parser',
          method: 'POST',
          largeJson: true,
        },
        expect: {
          status: 413,
          contentType: 'text/plain',
          body: (body) =>
            assert(
              typeof body === 'string' && body.includes('exceeds'),
              'expected the 413 body about the exceeded limit',
            ),
        },
      },
    ],
  },
  {
    id: 'response',
    title: '响应控制',
    description: 'status、statusText、异步 body / headers、延迟区间、响应体类型与流式响应。',
    scenarios: [
      {
        id: 'response-status-text',
        title: 'statusText',
        description: '同时设置状态码与状态文本。',
        request: { url: '/api/response/status-text' },
        expect: {
          status: 201,
          body: (body) => assert(body.created === true, 'expected the created body'),
        },
      },
      {
        id: 'response-async-body',
        title: '异步 body',
        description: 'body 函数返回 Promise。',
        request: { url: '/api/response/async-body?id=42' },
        expect: {
          body: (body) =>
            assert(body.async === true && body.id === '42', 'expected the async body result'),
        },
      },
      {
        id: 'response-async-headers',
        title: '异步 headers',
        description: 'headers 函数返回 Promise。',
        request: { url: '/api/response/async-headers' },
        expect: {
          headers: { 'x-async-header': 'yes' },
          body: (body) => assert(body.asyncHeaders === true, 'expected the async headers'),
        },
      },
      {
        id: 'response-delay',
        title: '固定延迟',
        description: 'delay: 150 固定延迟 150ms。',
        request: { url: '/api/response/delay' },
        expect: {
          minDuration: 120,
          body: (body) => assert(body.delayed === 150, 'expected the delayed body'),
        },
      },
      {
        id: 'response-delay-range',
        title: '延迟区间',
        description: 'delay: [200, 400] 在区间内随机延迟。',
        request: { url: '/api/response/delay-range' },
        expect: {
          minDuration: 180,
          body: (body) => assert(body.delayed === '200-400ms', 'expected the delayed body'),
        },
      },
      {
        id: 'response-empty',
        title: '空响应体',
        description: '未配置 body 时返回空响应。',
        request: { url: '/api/response/empty' },
        expect: {
          body: (body) => assert(body === '', 'expected an empty body'),
        },
      },
      {
        id: 'response-null',
        title: 'null 响应体',
        description: 'body: null 返回空响应。',
        request: { url: '/api/response/null' },
        expect: {
          body: (body) => assert(body === '', 'expected an empty body'),
        },
      },
      {
        id: 'response-number',
        title: '数字响应体',
        description: '数字响应体按 text 类型输出。',
        request: { url: '/api/response/number' },
        expect: {
          contentType: 'text/plain',
          body: (body) => assert(body === '42', 'expected 42'),
        },
      },
      {
        id: 'response-array',
        title: '数组响应体',
        description: '数组按 JSON 输出。',
        request: { url: '/api/response/array' },
        expect: {
          body: (body) => assert(Array.isArray(body) && body.length === 3, 'expected an array'),
        },
      },
      {
        id: 'response-text',
        title: 'text 类型',
        description: 'type: text 输出纯文本。',
        request: { url: '/api/response/text' },
        expect: {
          contentType: 'text/plain',
          body: (body) => assert(body === 'plain text response', 'expected the text body'),
        },
      },
      {
        id: 'response-csv',
        title: 'mime 类型',
        description: 'type: text/csv 输出对应 Content-Type。',
        request: { url: '/api/response/csv' },
        expect: {
          contentType: 'text/csv',
          body: (body) => assert(body.startsWith('id,name'), 'expected the csv body'),
        },
      },
      {
        id: 'response-filename-type',
        title: '文件名作为 type',
        description: 'type 传入文件名时自动解析 mime 类型。',
        request: { url: '/api/response/filename-type' },
        expect: {
          contentType: 'application/json',
          body: (body) => assert(body.from === 'filename', 'expected the filename body'),
        },
      },
      {
        id: 'response-buffer',
        title: 'Buffer 响应体',
        description: 'Buffer 原样写出。',
        request: { url: '/api/response/buffer' },
        expect: {
          body: (body) => assert(body === 'buffer body', 'expected the buffer body'),
        },
      },
      {
        id: 'response-chunked',
        title: 'response 中间件分块输出',
        description: '使用 res.write / res.end 分块响应。',
        request: { url: '/api/response/chunked' },
        expect: {
          contentType: 'text/plain',
          body: (body) =>
            assert(body === 'chunk-1\nchunk-2\nchunk-3\n', 'expected the chunked body'),
        },
      },
    ],
  },
  {
    id: 'error',
    title: '错误模拟',
    description: '概率、状态码、状态文本与自定义错误响应体。',
    scenarios: [
      {
        id: 'error-always',
        title: '确定性错误',
        description: 'probability: 1 时始终返回错误状态与状态文本。',
        request: { url: '/api/error/always' },
        expect: {
          status: 502,
          body: (body) =>
            assert(
              body.error === 'simulated gateway error',
              'expected the simulated gateway error',
            ),
        },
      },
      {
        id: 'error-probability',
        title: '概率错误',
        description: 'probability: 0.5 时状态码可能为 200 或 500。',
        hint: '每次请求独立随机；连续点击可以观察 200 / 500 切换。',
        request: { url: '/api/error/probability' },
        expect: {
          status: [200, 500],
        },
      },
      {
        id: 'error-body-function',
        title: '动态错误响应体',
        description: 'error.body 支持函数，可根据请求生成错误数据。',
        request: { url: '/api/error/body-function?id=42' },
        expect: {
          status: 200,
          body: (body) =>
            assert(
              body.code === 500 && body.message.includes('42'),
              'expected the dynamic error body',
            ),
        },
      },
      {
        id: 'error-text',
        title: '文本错误响应',
        description: '错误模拟同样支持 text 类型。',
        request: { url: '/api/error/text' },
        expect: {
          status: 503,
          contentType: 'text/plain',
          body: (body) => assert(body === 'service unavailable', 'expected the text error body'),
        },
      },
    ],
  },
  {
    id: 'scene',
    title: '场景',
    description:
      'activeScene 默认激活 test 场景，X-Mock-Scene 请求头按请求覆盖；无场景规则始终可用。',
    scenarios: [
      {
        id: 'scene-active',
        title: 'activeScene 默认场景',
        description: 'plugin options 中 activeScene: test 生效。',
        request: { url: '/api/scene' },
        expect: {
          body: (body) => assert(body.scene === 'test', 'expected the active test scene'),
        },
      },
      {
        id: 'scene-header-demo',
        title: 'X-Mock-Scene: demo',
        description: '请求头覆盖 activeScene。',
        hint: '请求头 x-mock-scene: demo 覆盖 plugin options 中的 activeScene: test。',
        request: { url: '/api/scene', headers: { 'x-mock-scene': 'demo' } },
        expect: {
          body: (body) => assert(body.scene === 'demo', 'expected the demo scene'),
        },
      },
      {
        id: 'scene-header-multi',
        title: '多场景规则',
        description: 'scene 为数组，任一匹配即生效。',
        hint: 'x-mock-scene: admin 命中 scene: [admin, demo] 的规则。',
        request: { url: '/api/scene', headers: { 'x-mock-scene': 'admin' } },
        expect: {
          body: (body) => assert(body.scene === 'admin or demo', 'expected the multi-scene rule'),
        },
      },
      {
        id: 'scene-universal',
        title: '通用规则兜底',
        description: '无场景的规则在任何场景下都可用。',
        request: { url: '/api/scene', headers: { 'x-mock-scene': 'unknown' } },
        expect: {
          body: (body) => assert(body.scene === 'universal', 'expected the universal scene'),
        },
      },
    ],
  },
  {
    id: 'validator',
    title: '校验器',
    description: 'query、params、body、refererQuery、cookie 与函数校验器，以及同路径兜底。',
    scenarios: [
      {
        id: 'validator-query',
        title: 'query 校验器',
        description: '根据 query 选择同路径规则。',
        request: { url: '/api/post?id=1001' },
        expect: {
          body: (body) => assert(body.result?.id === '1001', 'expected post 1001'),
        },
      },
      {
        id: 'validator-query-fallback',
        title: 'query 未命中兜底',
        description: '未匹配任何校验器时使用无校验器的规则。',
        request: { url: '/api/post?id=9999' },
        expect: {
          body: (body) =>
            assert(body.result?.title === 'random post title', 'expected the random post'),
        },
      },
      {
        id: 'validator-params',
        title: 'params 校验器',
        description: '根据动态参数选择同路径规则。',
        request: { url: '/api/post/1001' },
        expect: {
          body: (body) => assert(body.result?.id === '1001', 'expected post 1001'),
        },
      },
      {
        id: 'validator-body-true',
        title: 'body 校验器命中',
        description: '根据请求体选择规则。',
        request: {
          url: '/api/post-update',
          method: 'POST',
          json: { shouldUpdate: true },
        },
        expect: {
          body: (body) => assert(body.result?.updated === true, 'expected updated: true'),
        },
      },
      {
        id: 'validator-body-false',
        title: 'body 校验器未命中',
        description: '另一个请求体命中另一条规则。',
        request: {
          url: '/api/post-update',
          method: 'POST',
          json: { shouldUpdate: false },
        },
        expect: {
          body: (body) => assert(body.result?.updated === false, 'expected updated: false'),
        },
      },
      {
        id: 'validator-referer',
        title: 'refererQuery 校验器',
        description: '根据来源页面的 query 返回不同列表。',
        hint: 'Referer 必须为 http://localhost:5173/post.html?from=post-page，from 决定命中列表。',
        request: {
          url: '/api/post/list',
          headers: { referer: 'http://localhost:5173/post.html?from=post-page' },
        },
        expect: {
          body: (body) =>
            assert(
              Array.isArray(body.list) && body.list.length === 11 && !body.fallback,
              'expected the post-page list',
            ),
        },
      },
      {
        id: 'validator-referer-fallback',
        title: 'refererQuery 未命中',
        description: '未匹配来源页面时使用同路径兜底规则。',
        hint: '不发送 Referer，或 from 不是 post-page 时返回 fallback 列表。',
        request: { url: '/api/post/list' },
        expect: {
          body: (body) =>
            assert(body.fallback === true && body.list.length === 11, 'expected the fallback list'),
        },
      },
      {
        id: 'validator-cookie-expired',
        title: '函数校验器：无 cookie',
        description: '没有 token 时返回过期提示。',
        hint: '请求不带 token=abc；若先在登录卡片登录，浏览器会带上 token，可清除站点 cookie 后重试。',
        request: { url: '/api/validator-check-cookie' },
        expect: {
          body: (body) => assert(body.message === 'token expired.', 'expected the expired message'),
        },
      },
      {
        id: 'validator-cookie-valid',
        title: '函数校验器：有 cookie',
        description: '携带 token 时命中同路径兜底规则。',
        hint: '通过示例代理显式发送 cookie: token=abc，浏览器直接 fetch 无法设置该请求头。',
        request: {
          url: '/api/validator-check-cookie',
          headers: { cookie: 'token=abc' },
        },
        expect: {
          body: (body) => assert(body.message === 'token valid.', 'expected the valid message'),
        },
      },
      {
        id: 'validator-body-include',
        title: '函数校验器：数组包含',
        description: '请求体数组包含指定值时命中。',
        request: {
          url: '/api/validator-body-include',
          method: 'POST',
          json: { ids: ['1001'] },
        },
        expect: {
          body: (body) =>
            assert(body.message === 'ids include 1001', 'expected the included message'),
        },
      },
      {
        id: 'validator-body-missing',
        title: '函数校验器：数组缺失',
        description: '请求体数组缺失指定值时返回提示。',
        request: {
          url: '/api/validator-body-include',
          method: 'POST',
          json: { ids: [] },
        },
        expect: {
          body: (body) =>
            assert(body.message === 'ids must be include 1001', 'expected the missing message'),
        },
      },
    ],
  },
  {
    id: 'data',
    title: '共享数据',
    description: 'defineMockData 跨请求共享，以及 createDefineMock 生成统一前缀的定义函数。',
    scenarios: [
      {
        id: 'data-user-list',
        title: '用户列表',
        description: '读取 defineMockData 中的共享数据。',
        request: { url: '/api/user/list' },
        expect: {
          body: (body) => assert(body.mark2022?.age === 20, 'expected the mark2022 user'),
        },
      },
      {
        id: 'data-user-detail',
        title: '用户详情',
        description: '动态参数读取共享数据。',
        request: { url: '/api/user/mark2022' },
        expect: {
          body: (body) =>
            assert(
              typeof body.username === 'string' && body.age === 20,
              'expected the mark2022 user',
            ),
        },
      },
      {
        id: 'data-post-list',
        title: '文章列表',
        description: 'createDefineMock 统一了 /api 前缀。',
        request: {
          url: '/api/post/list',
          method: 'POST',
          json: { page: 1 },
        },
        expect: {
          body: (body) => assert(body.result?.list?.length === 11, 'expected the post list'),
        },
      },
      {
        id: 'data-post-delete',
        title: '删除文章',
        description: '删除后共享数据立即更新。',
        hint: '该请求会修改 defineMockData 共享数据；自动化测试会先重置再删除。',
        request: { url: '/api/post/delete/1', method: 'POST' },
        expect: {
          body: (body) =>
            assert(body.result?.list?.length === 10, 'expected the post to be deleted'),
        },
      },
      {
        id: 'data-post-reset',
        title: '重置文章',
        description: '使用 defineMockData 的 setter 恢复初始数据。',
        hint: '恢复共享数据到 11 条初始文章；多次运行其他文章场景后可点击重置。',
        request: { url: '/api/post/reset', method: 'POST' },
        expect: {
          body: (body) =>
            assert(body.result?.list?.length === 11, 'expected the post list to be reset'),
        },
      },
    ],
  },
  {
    id: 'compile',
    title: '编译期能力',
    description: 'Vite define 变量注入与 resolve.alias 别名解析。',
    scenarios: [
      {
        id: 'compile-constants',
        title: 'define + alias',
        description: 'mock 文件可以使用 Vite 的 define 变量与 alias 别名。',
        hint: 'define 在编译期注入 __IS_DEVELOPMENT__；alias @mock-shared 指向 mock/shared。',
        request: { url: '/api/compile/constants' },
        expect: {
          body: (body) =>
            assert(
              body.isDevelopment === true &&
                body.alias === 'resolved through the @mock-shared alias',
              'expected the injected constants',
            ),
        },
      },
    ],
  },
]

export const specialScenarios: SpecialScenario[] = [
  {
    id: 'sse',
    title: 'Server-sent Events',
    description: 'createSSEStream 输出 comment、id、retry、具名事件与结束事件。',
    kind: 'sse',
    mockFile: 'mock/sse.mock.ts',
  },
  {
    id: 'ws',
    title: 'WebSocket',
    description: '动态 URL、消息回显 / 广播、query / cookie、服务端推送与 onCleanup。',
    kind: 'ws',
    mockFile: 'mock/ws.mock.ts',
  },
  {
    id: 'upload',
    title: '文件上传',
    description: 'multipart/form-data 由 formidable 解析，上传目录由 formidableOptions 配置。',
    kind: 'upload',
    mockFile: 'mock/file-upload.mock.ts',
  },
  {
    id: 'download',
    title: '文件下载 / 静态资源',
    description: 'Readable 流式响应、Content-Disposition 与静态文件服务。',
    kind: 'download',
    mockFile: 'mock/file-download.mock.ts',
  },
  {
    id: 'cors',
    title: 'CORS',
    description: '预检请求、来源白名单与凭据响应头。',
    kind: 'cors',
    mockFile: 'mock/disabled-and-log.mock.ts',
  },
  {
    id: 'record',
    title: '录制 / 回放',
    description: '首次请求透传并录制上游响应，后续请求由录制数据回放。',
    kind: 'record',
    mockFile: 'plugins/record-upstream.ts',
  },
]

/**
 * Flatten all HTTP scenarios
 *
 * 展平全部 HTTP 场景
 */
export const httpScenarios: Scenario[] = scenarioGroups.flatMap((group) => group.scenarios)
