import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Path matching capabilities: optional parameters, wildcards, static / dynamic
 * priority and the `priority.special` option.
 *
 * 路径匹配能力：可选参数、通配符、静态 / 动态优先级，以及 `priority.special` 配置。
 */
export default defineMock([
  // /api/path/optional or /api/path/optional/123
  {
    url: '/api/path/optional{/:id}',
    body: ({ params }) => ({
      kind: 'optional',
      id: params.id ?? null,
    }),
  },
  // /api/path/wild/a/b/c -> params.segments = ['a', 'b', 'c']
  {
    url: '/api/path/wild/*segments',
    body: ({ params }) => ({
      kind: 'wildcard',
      segments: params.segments,
    }),
  },
  // /wildcard/zero or /wildcard/zero/a/b -> params.segments may be undefined
  // 该规则放在独立的 `/wildcard` 前缀下，避免与 `/api{/*rest}` 兜底规则
  // 在默认权重上打平后受加载顺序影响
  {
    url: '/wildcard/zero{/*segments}',
    body: ({ params }) => ({
      kind: 'zero-or-more',
      segments: params.segments ?? [],
    }),
  },
  // The static rule below always wins over this dynamic rule
  // 下方的静态规则优先级始终高于该动态规则
  {
    url: '/api/path/dynamic/:id',
    body: ({ params }) => ({
      kind: 'dynamic',
      id: params.id,
    }),
  },
  {
    url: '/api/path/static',
    body: { kind: 'static' },
  },

  // Default priority: the rule whose parameter appears later wins
  // 默认优先级：参数越靠后的规则优先级越高
  {
    url: '/api/priority/default/a/b/:third',
    body: { winner: '/api/priority/default/a/b/:third' },
  },
  {
    url: '/api/priority/default/a/:second/c',
    body: { winner: '/api/priority/default/a/:second/c' },
  },
  {
    url: '/api/priority/default/:first/b/c',
    body: { winner: '/api/priority/default/:first/b/c' },
  },

  // `priority.global` promotes the first rule over the default order
  // `priority.global` 使第一条规则优先于默认排序
  {
    url: '/api/priority/global/a/b/:third',
    body: { winner: '/api/priority/global/a/b/:third' },
  },
  {
    url: '/api/priority/global/a/:second/c',
    body: { winner: '/api/priority/global/a/:second/c' },
  },
  {
    url: '/api/priority/global/:first/b/c',
    body: { winner: '/api/priority/global/:first/b/c' },
  },

  // `priority.special` promotes the first rule when .../a/b/c is requested
  // `priority.special` 在请求 .../a/b/c 时提升第一条规则
  {
    url: '/api/priority/special/a/b/:third',
    body: { winner: '/api/priority/special/a/b/:third' },
  },
  {
    url: '/api/priority/special/a/:second/c',
    body: { winner: '/api/priority/special/a/:second/c' },
  },
  {
    url: '/api/priority/special/:first/b/c',
    body: { winner: '/api/priority/special/:first/b/c' },
  },

  // Static rule wins over the dynamic one
  // 静态规则优先于动态规则
  {
    url: '/api/priority/static',
    body: { kind: 'static', winner: '/api/priority/static' },
  },
  {
    url: '/api/priority/:id',
    body: ({ params }) => ({ kind: 'dynamic', winner: '/api/priority/:id', id: params.id }),
  },
])
