import type { SectionNavItem } from '@/components/DashboardSidebar.js'
import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/DashboardHeader.js'
import { DashboardSidebar, SectionNavBar } from '@/components/DashboardSidebar.js'
import { ScenarioSection } from '@/components/ScenarioSection.js'
import { SPECIAL_SECTION_ID, SpecialSection } from '@/components/SpecialSection.js'
import { Separator } from '@/components/ui/separator.js'
import { scenarioGroups, specialScenarios } from '@/scenarios.js'
import { useActiveSection } from '@/useActiveSection.js'
import { useScenarioDashboard } from '@/useScenarioDashboard.js'
import { useTheme } from '@/useTheme.js'

/**
 * Feature playground of vite-plugin-mock-dev-server
 *
 * vite-plugin-mock-dev-server 功能演练场
 *
 * @returns Application / 应用
 */
export default function App(): React.ReactNode {
  const {
    scene,
    setScene,
    filter,
    setFilter,
    results,
    busy,
    visibleGroups,
    stats,
    total,
    runOne,
    runAll,
  } = useScenarioDashboard()
  const { theme, toggleTheme } = useTheme()

  const navItems = useMemo<SectionNavItem[]>(
    () => [
      ...scenarioGroups.map((group) => ({
        id: group.id,
        title: group.title,
        count: group.scenarios.length,
      })),
      { id: SPECIAL_SECTION_ID, title: '特殊通道', count: specialScenarios.length },
    ],
    [],
  )
  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems])
  const activeId = useActiveSection(sectionIds)
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)

  // 过滤条件隐藏了目标分类时，清空过滤后再滚动
  // Clear the filter first when it hides the target category, then scroll to it
  useEffect(() => {
    if (!pendingTarget) {
      return
    }
    const element = document.getElementById(pendingTarget)
    if (!element) {
      return
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${pendingTarget}`)
    setPendingTarget(null)
  }, [pendingTarget, visibleGroups])

  const navigateToSection = (id: string): void => {
    const element = document.getElementById(id)
    if (!element) {
      setFilter('')
      setPendingTarget(id)
      return
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        stats={stats}
        total={total}
        scene={scene}
        filter={filter}
        busy={busy}
        theme={theme}
        onSceneChange={setScene}
        onFilterChange={setFilter}
        onRunAll={() => void runAll()}
        onToggleTheme={toggleTheme}
      />

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <DashboardSidebar items={navItems} activeId={activeId} onNavigate={navigateToSection} />

        <main className="flex min-w-0 flex-1 flex-col gap-10">
          <SectionNavBar items={navItems} activeId={activeId} onNavigate={navigateToSection} />

          <ScenarioSection
            groups={visibleGroups}
            filter={filter}
            scene={scene}
            results={results}
            busy={busy}
            onRun={(scenario, option) => void runOne(scenario, option)}
          />

          <SpecialSection />

          <footer className="flex flex-col gap-4 py-6 text-xs text-muted-foreground">
            <Separator />
            <p>
              所有场景来自同一份 <code className="font-mono">src/scenarios.ts</code>
              ，顶部按钮与 E2E 用例共享断言。
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
