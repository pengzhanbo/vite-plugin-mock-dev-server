import type { ScenarioResult } from '@/scenario-runner.js'
import type { Scenario, ScenarioVariant } from '@/scenarios.js'
import { useEffect, useMemo, useState } from 'react'
import { proxyRequest } from '@/lib/proxy.js'
import { getScenarioRequests, runScenario } from '@/scenario-runner.js'
import { scenarioGroups } from '@/scenarios.js'

type ScenarioResults = Record<string, ScenarioResult | string>

const ALL_SCENARIOS = scenarioGroups.flatMap((group) => group.scenarios)
const TOTAL_REQUESTS = ALL_SCENARIOS.reduce(
  (total, scenario) => total + getScenarioRequests(scenario).length,
  0,
)

/**
 * Count results by state
 *
 * 按状态统计结果
 *
 * @param results - Scenario results / 场景结果
 * @returns Counters / 计数器
 */
function countResults(results: ScenarioResults): {
  passed: number
  failed: number
  running: number
} {
  let passed = 0
  let failed = 0
  let running = 0
  for (const value of Object.values(results)) {
    if (value === 'running') {
      running += 1
    } else if (typeof value === 'string' || value.errors.length > 0) {
      failed += 1
    } else {
      passed += 1
    }
  }
  return { passed, failed, running }
}

/**
 * Dashboard controller
 *
 * 仪表盘控制器
 */
export interface ScenarioDashboard {
  scene: string
  setScene: (value: string) => void
  filter: string
  setFilter: (value: string) => void
  results: ScenarioResults
  busy: boolean
  visibleGroups: typeof scenarioGroups
  stats: { passed: number; failed: number; running: number }
  total: number
  runOne: (scenario: Scenario, option: ScenarioVariant) => Promise<void>
  runAll: () => Promise<void>
}

/**
 * Dashboard state and scenario execution
 *
 * 仪表盘状态与场景执行
 *
 * @returns Dashboard controller / 仪表盘控制器
 */
export function useScenarioDashboard(): ScenarioDashboard {
  const [scene, setScene] = useState('')
  const [filter, setFilter] = useState('')
  const [results, setResults] = useState<ScenarioResults>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // 种一个演示 cookie，让请求解析面板在浏览器中也能读到 cookie
    // Seed a demo cookie so the request parsing panel can read it in the browser too
    document.cookie = 'demo-cookie=allowed; path=/'
  }, [])

  const visibleGroups = useMemo(() => {
    const keyword = filter.trim().toLowerCase()
    return scenarioGroups
      .map((group) => ({
        id: group.id,
        title: group.title,
        description: group.description,
        scenarios: group.scenarios.filter((scenario) => {
          if (!keyword) {
            return true
          }
          const haystack = [
            scenario.title,
            scenario.description,
            ...getScenarioRequests(scenario).map(
              (option) => `${option.label} ${option.request.method ?? 'GET'} ${option.request.url}`,
            ),
          ]
            .join(' ')
            .toLowerCase()
          return haystack.includes(keyword)
        }),
      }))
      .filter((group) => group.scenarios.length > 0)
  }, [filter])

  const stats = useMemo(() => countResults(results), [results])

  const execute = async (scenario: Scenario, option: ScenarioVariant): Promise<void> => {
    const key = `${scenario.id}:${option.id}`
    setResults((previous) => ({ ...previous, [key]: 'running' }))
    try {
      const result = await runScenario(proxyRequest, scenario, scene || undefined, option)
      setResults((previous) => ({ ...previous, [key]: result }))
    } catch (error) {
      setResults((previous) => ({ ...previous, [key]: (error as Error).message }))
    }
  }

  const runOne = async (scenario: Scenario, option: ScenarioVariant): Promise<void> => {
    if (busy) {
      return
    }
    setBusy(true)
    try {
      await execute(scenario, option)
    } finally {
      setBusy(false)
    }
  }

  const runAll = async (): Promise<void> => {
    if (busy) {
      return
    }
    setBusy(true)
    try {
      for (const group of visibleGroups) {
        for (const scenario of group.scenarios) {
          for (const option of getScenarioRequests(scenario)) {
            await execute(scenario, option)
          }
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return {
    scene,
    setScene,
    filter,
    setFilter,
    results,
    busy,
    visibleGroups,
    stats,
    total: TOTAL_REQUESTS,
    runOne,
    runAll,
  }
}
