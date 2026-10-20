import { useEffect, useState } from 'react'

/**
 * Track which section is currently in view
 *
 * 跟踪当前滚动到视口顶部的区块
 *
 * @param ids - Section anchor ids in document order / 按文档顺序排列的区块锚点 id
 * @param offset - Distance from the viewport top that marks a section as active / 判定区块激活的视口顶部偏移
 * @returns Active section id / 当前激活的区块 id
 */
export function useActiveSection(ids: string[], offset = 120): string {
  const key = ids.join('|')
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const sectionIds = key.split('|').filter(Boolean)
    let frame = 0

    const compute = (): void => {
      frame = 0
      let current = sectionIds[0] ?? ''
      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top - offset <= 0) {
          current = id
        }
      }
      const reachedBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
      if (reachedBottom) {
        current = sectionIds[sectionIds.length - 1] ?? current
      }
      setActiveId(current)
    }

    const schedule = (): void => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(compute)
      }
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [key, offset])

  return activeId
}
