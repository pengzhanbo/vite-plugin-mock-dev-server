/**
 * Response delay
 *
 * 响应延迟
 *
 * The delay is measured from the request start time and the time already spent on
 * request parsing is deducted, so the number form and the array form share the same
 * semantics.
 *
 * 延迟以「请求开始时间」为基准计时，并扣除请求解析已消耗的时间，
 * 使数值形式与数组形式语义一致。
 */

import type { MockHttpItem } from '../types/index.js'
import { isArray, random, sleep, timestamp } from '@pengzhanbo/utils'

/**
 * Apply real response delay
 *
 * 实际响应延迟
 *
 * 延迟统一以「请求开始时间」为基准计时，请求解析阶段已消耗的时间会从本次采样出的延迟中扣除，
 * 因此数值形式与数组形式语义一致：两者都不是在此前的基础上「额外再等一次」。
 * 需要注意的是，当请求解析耗时已经超过延迟（数组形式为范围上限）时，剩余等待时间为 0，
 * 即直接响应，不会为了凑满延迟而继续等待。
 *
 * The delay is always measured from the request start time, and the time already spent
 * on request parsing is deducted from the sampled delay, so the number form and the array
 * form share the same semantics: neither of them waits an extra round on top of it.
 * Note that when the request parsing time already exceeds the delay (the upper bound for
 * the array form), the remaining wait is 0 and the response is sent immediately, instead
 * of waiting longer to fulfill the configured delay.
 *
 * @param startTime - Request start time / 请求开始时间
 * @param delay - Delay configuration / 延迟配置
 */
export async function responseRealDelay(
  startTime: number,
  delay?: MockHttpItem['delay'],
): Promise<void> {
  if (
    !delay ||
    (typeof delay === 'number' && delay <= 0) ||
    (isArray(delay) && delay.length !== 2)
  ) {
    return
  }
  // 已经耗费的解析时间 / elapsed time already spent before responding
  const elapsed = timestamp() - startTime
  let realDelay = 0
  if (isArray(delay)) {
    const [min, max] = delay
    // 以「已耗时」与 `min` 中的较大者作为本次采样的下限，避免总耗时低于用户配置的下限；
    // 若已耗时已达上限，则不再等待
    // Take the larger of the elapsed time and `min` as the lower bound of the sampled
    // delay so the total elapsed never falls below `min`; wait nothing once the elapsed
    // time has already reached the upper bound
    const lowerBound = Math.min(Math.max(min, elapsed), max)
    realDelay = lowerBound >= max ? 0 : random(lowerBound, max, true) - elapsed
  } else {
    realDelay = delay - elapsed
  }
  if (realDelay > 0) {
    await sleep(realDelay)
  }
}
