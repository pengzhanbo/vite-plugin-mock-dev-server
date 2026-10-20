import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { cn } from '@/lib/utils.js'

/**
 * Navigation item of a scenario category
 *
 * 场景分类导航项
 */
export interface SectionNavItem {
  /** Section anchor id / 区块锚点 id */
  id: string
  /** Section title / 区块标题 */
  title: string
  /** Number of scenarios in the section / 区块内的场景数量 */
  count: number
}

/**
 * Shared link layout of both nav variants
 *
 * 两种导航形态的共享链接布局
 */
const baseLinkClass =
  'group flex items-center justify-between gap-3 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring'

/**
 * Desktop sidebar listing every scenario category
 *
 * 桌面端分类侧边栏
 *
 * @param props - Component props / 组件属性
 * @returns Sidebar navigation / 侧边栏导航
 */
export function DashboardSidebar({
  items,
  activeId,
  onNavigate,
}: {
  items: SectionNavItem[]
  activeId: string
  onNavigate: (id: string) => void
}): React.ReactNode {
  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-56 shrink-0 self-start overflow-y-auto pr-1 lg:block">
      <p className="px-3 pb-2 text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        分类
      </p>
      <nav aria-label="场景分类">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate(item.id)
                  }}
                  className={cn(
                    baseLinkClass,
                    'px-3 py-2 text-sm',
                    active
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  )}
                >
                  <span className="truncate">{item.title}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-mono tabular-nums',
                      active && 'bg-background/70 text-foreground',
                    )}
                  >
                    {item.count}
                  </Badge>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <Button
        variant="outline"
        size="sm"
        className="mt-6 w-full"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        回到顶部
      </Button>
    </aside>
  )
}

/**
 * Compact sticky category bar for small screens
 *
 * 小屏下的吸顶分类导航条
 *
 * @param props - Component props / 组件属性
 * @returns Horizontal navigation / 横向导航
 */
export function SectionNavBar({
  items,
  activeId,
  onNavigate,
}: {
  items: SectionNavItem[]
  activeId: string
  onNavigate: (id: string) => void
}): React.ReactNode {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-b border-border/60 bg-background/85 px-6 py-2 backdrop-blur lg:hidden">
      <nav aria-label="场景分类">
        <ul className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate(item.id)
                  }}
                  className={cn(
                    baseLinkClass,
                    'gap-1.5 border px-3 py-1 text-xs whitespace-nowrap',
                    active
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border/70 text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  )}
                >
                  {item.title}
                  <Badge
                    variant={active ? 'secondary' : 'outline'}
                    className="font-mono text-[10px] tabular-nums"
                  >
                    {item.count}
                  </Badge>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
