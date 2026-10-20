import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils.js'

/**
 * shadcn-style card container
 *
 * shadcn 风格卡片容器
 *
 * @param props - Div props / div 属性
 * @returns Card element / 卡片元素
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
}

/**
 * Card header
 *
 * 卡片头部
 *
 * @param props - Div props / div 属性
 * @returns Header element / 头部元素
 */
export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />
}

/**
 * Card title
 *
 * 卡片标题
 *
 * @param props - Heading props / 标题属性
 * @returns Title element / 标题元素
 */
export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3 className={cn('text-base font-semibold leading-none', className)} {...props}>
      {children}
    </h3>
  )
}

/**
 * Card description
 *
 * 卡片描述
 *
 * @param props - Paragraph props / 段落属性
 * @returns Description element / 描述元素
 */
export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />
}

/**
 * Card content
 *
 * 卡片内容
 *
 * @param props - Div props / div 属性
 * @returns Content element / 内容元素
 */
export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

/**
 * Card footer
 *
 * 卡片底部
 *
 * @param props - Div props / div 属性
 * @returns Footer element / 底部元素
 */
export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('flex items-center gap-2 px-5 pb-5', className)} {...props} />
}
