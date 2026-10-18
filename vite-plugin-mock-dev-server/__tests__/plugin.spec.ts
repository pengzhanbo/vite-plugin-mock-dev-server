/**
 * Tests for the plugin entry and its `config` hook
 *
 * 插件入口与其 `config` 钩子的测试
 */
import type { UserConfig } from 'vite'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { buildPlugin, mockDevServerPlugin, serverPlugin } from '../src/core/plugin.js'

/**
 * Call the `config` hook of a plugin
 *
 * 调用插件的 `config` 钩子
 *
 * @param plugin - Plugin object / 插件对象
 * @param config - Vite user config / Vite 用户配置
 */
function callConfig(plugin: ReturnType<typeof serverPlugin>, config: UserConfig): void {
  ;(plugin.config as (config: UserConfig) => void).call({}, config)
}

describe('mockDevServerPlugin', () => {
  it('should return an empty array when disabled', () => {
    expect(mockDevServerPlugin({ enabled: false })).toEqual([])
  })

  it('should only return the server plugin by default', () => {
    const plugins = mockDevServerPlugin()

    expect(plugins).toHaveLength(1)
    expect(plugins[0].name).toBe('vite-plugin-mock-dev-server')
    expect(plugins[0].apply).toBe('serve')
    expect(plugins[0].enforce).toBe('pre')
  })

  it('should append the generator plugin when build is enabled', () => {
    const plugins = mockDevServerPlugin({ build: true })

    expect(plugins).toHaveLength(2)
    expect(plugins[1].name).toBe('vite-plugin-mock-dev-server-generator')
    expect(plugins[1].apply).toBe('build')
    expect(plugins[1].enforce).toBe('post')
  })
})

describe('serverPlugin config hook', () => {
  it('should remove the websocket prefixes from server.proxy', () => {
    const config: UserConfig = {
      server: {
        proxy: {
          '/api': { target: 'http://localhost:3000' },
          '/ws': { target: 'ws://localhost:3000', ws: true },
          '/socket': { target: 'ws://localhost:3000', ws: true },
        },
      },
    }

    callConfig(serverPlugin({ wsPrefix: ['/ws', '/socket'] }, {}), config)

    // wsPrefix 对应的代理会与插件的 upgrade 处理冲突，必须从 server.proxy 移除
    // The proxies matching wsPrefix conflict with the plugin upgrade handler and
    // must be removed from server.proxy
    expect(Object.keys(config.server!.proxy!)).toEqual(['/api'])
  })

  it('should keep every proxy when wsPrefix is not configured', () => {
    const config: UserConfig = {
      server: {
        proxy: {
          '/api': { target: 'http://localhost:3000' },
          '/ws': { target: 'ws://localhost:3000', ws: true },
        },
      },
    }

    callConfig(serverPlugin({}, {}), config)

    expect(Object.keys(config.server!.proxy!)).toEqual(['/api', '/ws'])
  })

  it('should add a configure hook to http proxies only', () => {
    const config: UserConfig = {
      server: {
        proxy: {
          '/api': { target: 'http://localhost:3000' },
          '/ws': { target: 'ws://localhost:3000', ws: true },
        },
      },
    }

    callConfig(serverPlugin({}, {}), config)

    expect(typeof (config.server!.proxy!['/api'] as any).configure).toBe('function')
    // websocket 代理由 mockWebsocket 单独处理，不应被改写
    // Websocket proxies are handled by mockWebsocket and must not be rewritten
    expect((config.server!.proxy!['/ws'] as any).configure).toBeUndefined()
  })

  it('should preserve the original configure hook of a proxy', async () => {
    const calls: string[] = []
    const config: UserConfig = {
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            configure(proxy) {
              calls.push('original')
              proxy.on?.('error', () => {})
            },
          },
        },
      },
    }

    callConfig(serverPlugin({}, {}), config)

    const options = config.server!.proxy!['/api'] as any
    const proxy = { on: () => {} }
    options.configure(proxy, options)

    // 原始 configure 仍需执行，且插件在其之后挂载自己的监听
    // The original configure still runs, and the plugin attaches its listeners after it
    expect(calls).toEqual(['original'])
  })

  it('should not throw when server config is absent', () => {
    expect(() => callConfig(serverPlugin({}, {}), {})).not.toThrow()
  })

  it('should create the recorder when recording is enabled', () => {
    const config: UserConfig = {
      server: {
        proxy: { '/api': { target: 'http://localhost:3000' } },
      },
    }

    callConfig(
      serverPlugin({ cwd: tmpdir(), record: { enabled: true, gitignore: false } }, {}),
      config,
    )

    expect(typeof (config.server!.proxy!['/api'] as any).configure).toBe('function')
  })
})

describe('buildPlugin', () => {
  it('should be named as the generator plugin', () => {
    expect(buildPlugin({}, {}).name).toBe('vite-plugin-mock-dev-server-generator')
  })
})
