import { useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

/** Joins case_reflections with their linked case_log_entries — the same
 * join CaseReflections.jsx performs for the Studio, reused here so the
 * public Case Studies gallery/detail pages and Home's "Featured Case
 * Studies" all read from one place. Most recent reflection first. */
export function useCaseStudies() {
  const { rows: caseLogRows, status: caseLogStatus, error: caseLogError } = useSupabaseTable('case_log_entries', {
    orderBy: 'date_seen',
    ascending: false,
  })
  const { rows: reflections, status: reflectionStatus, error: reflectionError } = useSupabaseTable('case_reflections', {
    orderBy: 'reflection_no',
    ascending: false,
  })

  const caseLogById = useMemo(() => Object.fromEntries(caseLogRows.map((e) => [e.id, e])), [caseLogRows])

  const caseStudies = useMemo(
    () => reflections.map((reflection) => ({ reflection, caseEntry: caseLogById[reflection.case_log_entry_id] ?? null })),
    [reflections, caseLogById]
  )

  const status =
    caseLogStatus === 'error' || reflectionStatus === 'error'
      ? 'error'
      : caseLogStatus === 'loading' || reflectionStatus === 'loading'
        ? 'loading'
        : 'ready'

  return { caseStudies, status, error: caseLogError || reflectionError }
}
