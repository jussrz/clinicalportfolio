import { useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

/** Cases a student contributed to aren't stored on their contribution row —
 * they're read live off case_log_entries.student_assigned (a roster dropdown,
 * so this is an exact match) so the two can never drift out of sync. caseNo
 * is each row's position in the full Case Log Census listing (same order as
 * that page's "No." column), assigned before filtering so numbers still line
 * up with what's shown there. */
export function useIndividualCases(studentSurname) {
  const { rows, status, error } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })
  const cases = useMemo(() => {
    if (!studentSurname) return []
    return rows
      .map((row, i) => ({ ...row, caseNo: i + 1 }))
      .filter((row) => row.student_assigned === studentSurname)
  }, [rows, studentSurname])
  return { cases, status, error }
}
