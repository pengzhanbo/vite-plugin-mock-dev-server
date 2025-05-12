import type { Plugin } from 'vite'
import type { MockServerPluginOptions } from './types'
import pc from 'picocolors'
import { mockDevServerPlugin } from './plugin'

export * from './helper'

export * from './server'
export type {
  FormidableFile,
  MockHttpItem,
  MockOptions,
  MockRequest,
  MockServerPluginOptions,
  MockWebsocketItem,
} from './types'

export { mockDevServerPlugin }

/**
 * @deprecated use named export instead
 */
export default function mockDevServerPluginWithDefaultExportWasDeprecated(
  options: MockServerPluginOptions = {},
): Plugin[] {
  console.warn(`${pc.yellow('[vite-plugin-mock-dev-server]')} ${pc.yellow(pc.bold('WARNING:'))} The plugin default export is ${pc.bold('deprecated')}, it will be removed in next major version, use ${pc.bold('named export')} instead:\n\n    ${pc.green('import { mockDevServerPlugin } from "vite-plugin-mock-dev-server"')}\n`)

  return mockDevServerPlugin(options)
}
