import type { ThemeMode } from '@/useTheme.js'
import { Moon, Play, Search, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent } from '@/components/ui/card.js'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.js'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.js'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.js'
import { Spinner } from '@/components/ui/spinner.js'

/**
 * Scene options of the select
 *
 * 场景下拉选项
 */
const SCENE_ITEMS: { value: string; label: string }[] = [
  { value: '', label: 'Scene: auto (test)' },
  { value: 'test', label: 'Scene: test' },
  { value: 'demo', label: 'Scene: demo' },
  { value: 'admin', label: 'Scene: admin' },
  { value: 'unknown', label: 'Scene: unknown' },
]

/**
 * Dashboard counters
 *
 * 仪表盘统计
 */
export interface DashboardStats {
  passed: number
  failed: number
  running: number
}

/**
 * Summary badges
 *
 * 统计徽标
 *
 * @param props - Component props / 组件属性
 * @returns Summary badges / 统计徽标
 */
function StatsBadges({ stats, total }: { stats: DashboardStats; total: number }): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">总计 {total} 请求</Badge>
      <Badge variant="success">通过 {stats.passed}</Badge>
      <Badge variant="destructive">失败 {stats.failed}</Badge>
      <Badge variant="outline">运行中 {stats.running}</Badge>
    </div>
  )
}

/**
 * Scene, filter and run-all controls
 *
 * 场景、过滤与全部运行控制
 *
 * @param props - Component props / 组件属性
 * @returns Toolbar card / 工具栏卡片
 */
function DashboardToolbar({
  scene,
  filter,
  busy,
  onSceneChange,
  onFilterChange,
  onRunAll,
}: {
  scene: string
  filter: string
  busy: boolean
  onSceneChange: (value: string) => void
  onFilterChange: (value: string) => void
  onRunAll: () => void
}): React.ReactNode {
  return (
    <Card className="border-border/70 bg-card/60 backdrop-blur">
      <CardContent className="pt-5">
        <FieldGroup className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
          <Field>
            <FieldLabel htmlFor="scene-select">Active scene</FieldLabel>
            <Select
              items={SCENE_ITEMS}
              value={scene}
              onValueChange={(value) => onSceneChange(value ?? '')}
            >
              <SelectTrigger id="scene-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SCENE_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="scenario-filter">Filter scenarios</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="scenario-filter"
                value={filter}
                onChange={(event) => onFilterChange(event.target.value)}
                placeholder="GET, validator, SSE, 404…"
              />
            </InputGroup>
          </Field>

          <div className="flex lg:justify-end">
            <Button disabled={busy} onClick={onRunAll}>
              {busy ? <Spinner data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {busy ? 'Running…' : 'Run all visible'}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

/**
 * Light / dark theme switch
 *
 * 亮色 / 暗色主题切换
 *
 * @param props - Component props / 组件属性
 * @returns Theme toggle button / 主题切换按钮
 */
function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: ThemeMode
  onToggle: () => void
}): React.ReactNode {
  const dark = theme === 'dark'
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={dark ? '切换到亮色主题' : '切换到暗色主题'}
      aria-pressed={dark}
      title={dark ? '切换到亮色主题' : '切换到暗色主题'}
      onClick={onToggle}
    >
      {dark ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
      {dark ? '亮色' : '暗色'}
    </Button>
  )
}

/**
 * Dashboard hero and toolbar
 *
 * 仪表盘头部与工具栏
 *
 * @param props - Component props / 组件属性
 * @returns Header / 头部
 */
export function DashboardHeader({
  stats,
  total,
  scene,
  filter,
  busy,
  theme,
  onSceneChange,
  onFilterChange,
  onRunAll,
  onToggleTheme,
}: {
  stats: DashboardStats
  total: number
  scene: string
  filter: string
  busy: boolean
  theme: ThemeMode
  onSceneChange: (value: string) => void
  onFilterChange: (value: string) => void
  onRunAll: () => void
  onToggleTheme: () => void
}): React.ReactNode {
  return (
    <header className="border-b border-border/60 bg-gradient-to-b from-card to-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex max-w-3xl flex-col gap-3">
            <div>
              <Badge variant="outline" className="gap-2">
                <span aria-hidden className="size-2 rounded-full bg-primary" />
                live mock playground
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mock Dev Server</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              vite-plugin-mock-dev-server
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <StatsBadges stats={stats} total={total} />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <DashboardToolbar
          scene={scene}
          filter={filter}
          busy={busy}
          onSceneChange={onSceneChange}
          onFilterChange={onFilterChange}
          onRunAll={onRunAll}
        />
      </div>
    </header>
  )
}
