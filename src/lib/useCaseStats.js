import { useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'
import { DEPARTMENT_OPTIONS } from '../data/options'

/** Aggregates case-log and reflection counts client-side from data the app
 * already fetches elsewhere (no new queries or schema). Powers the Home
 * stat tiles and the Case Log Census department breakdown. */
export function useCaseStats() {
  const { rows: caseLogRows, status: caseLogStatus } = useSupabaseTable('case_log_entries', {
    orderBy: 'date_seen',
    ascending: true,
  })
  const { rows: reflections, status: reflectionStatus } = useSupabaseTable('case_reflections', {
    orderBy: 'reflection_no',
    ascending: true,
  })

  return useMemo(() => {
    const departmentCounts = {}
    for (const row of caseLogRows) {
      if (!row.department) continue
      departmentCounts[row.department] = (departmentCounts[row.department] ?? 0) + 1
    }
    const departmentBreakdown = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])

    const dates = caseLogRows.map((r) => r.date_seen).filter(Boolean).sort()

    const status =
      caseLogStatus === 'error' || reflectionStatus === 'error'
        ? 'error'
        : caseLogStatus === 'loading' || reflectionStatus === 'loading'
          ? 'loading'
          : 'ready'

    return {
      status,
      totalCases: caseLogRows.length,
      totalReflections: reflections.length,
      departmentsCovered: departmentBreakdown.length,
      totalDepartments: DEPARTMENT_OPTIONS.length,
      departmentBreakdown,
      firstDate: dates[0] ?? null,
      lastDate: dates[dates.length - 1] ?? null,
    }
  }, [caseLogRows, reflections, caseLogStatus, reflectionStatus])
}
