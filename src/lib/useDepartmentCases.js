import { useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

/** "Cases Seen or Discussed" is no longer typed by hand — it's derived live
 * from the Group Case Log Census so the two can never drift out of sync.
 * Returns that department's case log entries (oldest first) that have a
 * working diagnosis recorded. */
export function useDepartmentCases(departmentName) {
  const { rows, status, error } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: true })
  const cases = useMemo(
    () => rows.filter((r) => r.department === departmentName && r.working_diagnosis),
    [rows, departmentName]
  )
  return { cases, status, error }
}
