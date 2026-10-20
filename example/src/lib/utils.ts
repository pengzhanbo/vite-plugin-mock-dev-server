import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes while resolving conflicts
 *
 * 合并 Tailwind 类名并处理冲突
 *
 * @param inputs - Class values / 类名
 * @returns Merged class name / 合并后的类名
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
