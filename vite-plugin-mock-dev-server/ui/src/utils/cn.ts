import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: (ClassValue | undefined)[]) {
  return twMerge(clsx(...inputs))
}
