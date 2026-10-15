/**
 * Proxy configure helper
 *
 * 代理 configure 扩展工具
 *
 * Vite 允许通过 `server.proxy` 中每个代理的 `configure` 访问 http-proxy 实例。
 * 插件需要在同一个实例上挂载多个事件（请求流恢复、请求录制等）。
 * 这里提供统一的包装逻辑，避免多处独立改写 `configure` 造成的顺序敏感、
 * 重复改写以及 `this` 语义不一致。
 */

import type { ProxyOptions, UserConfig } from 'vite'
import { isString, objectKeys } from '@pengzhanbo/utils'

/**
 * Proxy configure callback
 *
 * http-proxy configure 回调
 */
export type ProxyConfigure = NonNullable<ProxyOptions['configure']>

/**
 * Proxy server instance
 *
 * http-proxy 实例
 */
export type ProxyServer = Parameters<ProxyConfigure>[0]

/**
 * Proxy extension callback, invoked after the original `configure`
 *
 * 代理扩展回调，在原始 `configure` 执行后调用
 */
export type ProxySetup = (proxy: ProxyServer, options: ProxyOptions) => void

/**
 * Setup the `configure` hook for every HTTP proxy in `config.server.proxy`.
 *
 * 统一为 `config.server.proxy` 中的所有 HTTP 代理设置 `configure` 钩子。
 *
 * All `setups` run in order after the original `configure`, sharing a single
 * proxy options replacement pass.
 * 所有 `setups` 在原始 `configure` 执行后按顺序运行，共用同一次代理配置替换。
 *
 * @param config - Vite user config / Vite 用户配置
 * @param setups - Proxy extension callbacks / 代理扩展回调
 */
export function setupProxyConfigure(config: UserConfig, setups: ProxySetup[]): void {
  const proxies = config.server?.proxy
  if (!proxies || setups.length === 0) {
    return
  }

  objectKeys(proxies).forEach((key) => {
    const target = proxies[key]
    const options: ProxyOptions = isString(target) ? { target } : target
    // websocket mock 由 mockWebsocket 单独处理
    if (options.ws) {
      return
    }

    const { configure, ...rest } = options

    proxies[key] = {
      ...rest,
      configure(proxy, proxyOptions) {
        configure?.call(this, proxy, proxyOptions)
        setups.forEach((setup) => setup(proxy, proxyOptions))
      },
    }
  })
}
