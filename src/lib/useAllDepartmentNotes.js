import { useCallback, useEffect, useId, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'

/**
 * Read-only counterpart to useDepartmentNotes.js: that hook is scoped to one
 * department at a time (for editing a single department's card), this one
 * reads department_notes across every department at once for the given
 * section keys — used by showcase pages that need to know, up front, which
 * departments have content worth rendering.
 */
export function useAllDepartmentNotes(sections) {
  const instanceId = useId()
  const [byDept, setByDept] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) { setStatus('error'); setError('Supabase is not configured.'); return }
    const { data, error: fetchError } = await supabase.from('department_notes').select('*').in('section', sections)
    if (fetchError) { setStatus('error'); setError(fetchError.message); return }
    const grouped = {}
    for (const row of data ?? []) {
      grouped[row.department] ??= {}
      grouped[row.department][row.section] = row.content
    }
    setByDept(grouped)
    setStatus('ready')
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections])

  useEffect(() => {
    refetch()
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel(`department_notes_all_${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'department_notes' }, () => refetch())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch, instanceId])

  return { byDept, status, error }
}
