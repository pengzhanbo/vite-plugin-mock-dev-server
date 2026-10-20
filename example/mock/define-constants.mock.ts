import { sharedLabel } from '@mock-shared/labels.js'
import { defineMock } from 'vite-plugin-mock-dev-server'

/**
 * Compile-time injection: `__IS_DEVELOPMENT__` comes from the Vite `define`
 * option and `@mock-shared` comes from `resolve.alias`.
 *
 * 编译期注入：`__IS_DEVELOPMENT__` 来自 Vite 的 `define` 配置，
 * `@mock-shared` 来自 `resolve.alias`。
 */
export default defineMock({
  url: '/api/compile/constants',
  body: {
    isDevelopment: __IS_DEVELOPMENT__,
    alias: sharedLabel,
    // The mock file itself is compiled, so this value is evaluated at compile time
    // mock 文件本身会被编译，因此该值在编译期确定
    compiledAt: new Date(0).toISOString(),
  },
})
