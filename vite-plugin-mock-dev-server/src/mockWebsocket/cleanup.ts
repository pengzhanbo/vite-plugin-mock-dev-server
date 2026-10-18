/**
 * Resource cleanup of the mock websocket server
 *
 * Mock WebSocket 服务的资源清理
 */
import type { WSSContext } from './types.js'

/**
 * 取消空闲回收定时器
 *
 * @param wssContext - Context of the websocket server / websocket 服务的上下文
 */
export function clearIdleTimer(wssContext: WSSContext): void {
  if (wssContext.idleTimer) {
    clearTimeout(wssContext.idleTimer)
    wssContext.idleTimer = undefined
  }
}

/**
 * 执行清理函数
 *
 * 每个清理回调相互隔离：它抛出的异常会通过 `onError` 上报，其余回调照常执行，
 * 避免一个错误的清理让 mock 的资源只被回收一半，或中断被删除 mock 文件的回收流程。
 *
 * Run a group of cleanup callbacks.
 *
 * Every cleanup is isolated: a throwing cleanup is reported through `onError` while the
 * remaining ones still run, so that a single failure neither reclaims only half of the
 * resources of a mock nor interrupts the recycling of a deleted mock file.
 *
 * @param cleanupList - Array of cleanup functions / 清理函数数组
 * @param onError - Reports the exception of a cleanup / 上报清理回调抛出的异常
 */
export function runCleanups(
  cleanupList: WSSContext['cleanupList'],
  onError: (error: any) => void,
): void {
  while (cleanupList.length > 0) {
    const cleanup = cleanupList.shift()
    try {
      cleanup?.()
    } catch (error) {
      onError(error)
    }
  }
}
