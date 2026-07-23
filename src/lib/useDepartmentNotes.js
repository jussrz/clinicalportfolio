import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'

const SAVE_DEBOUNCE_MS = 700

/**
 * Binds to the department_notes table for one department: fetches its
 * existing (department, section) rows, subscribes to realtime changes from
 * other clients, and debounce-upserts edited sections (rows may not exist
 * yet the first time a section is edited, hence upsert not update).
 */
export function useDepartmentNotes(department, sections) {
  const [values, setValues] = useState(() => Object.fromEntries(sections.map((s) => [s, ''])))
  const [status, setStatus] = useState('loading')
  const [saveState, setSaveState] = useState('idle')

  const pendingRef = useRef({})
  const timerRef = useRef(null)

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const patch = pendingRef.current
    const keys = Object.keys(patch)
    if (keys.length === 0) return
    pendingRef.current = {}
    setSaveState('saving')
    const rows = keys.map((section) => ({ department, section, content: patch[section] }))
    const { error } = await supabase.from('department_notes').upsert(rows, { onConflict: 'department,section' })
    if (error) {
      setSaveState('error')
      return
    }
    setSaveState('saved')
    setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2000)
  }, [department])

  const setSection = useCallback(
    (section, content) => {
      setValues((prev) => ({ ...prev, [section]: content }))
      pendingRef.current[section] = content
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS)
    },
    [flush]
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isSupabaseConfigured) {
        setStatus('error')
        return
      }
      const { data, error } = await supabase.from('department_notes').select('*').eq('department', department)
      if (cancelled) return
      if (error) {
        setStatus('error')
        return
      }
      setValues((prev) => {
        const next = { ...prev }
        for (const row of data ?? []) next[row.section] = row.content
        return next
      })
      setStatus('ready')
    }
    load()

    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(`department_notes_${department}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'department_notes', filter: `department=eq.${department}` },
        (payload) => {
          const row = payload.new
          if (!row) return
          setValues((prev) => ({ ...prev, [row.section]: pendingRef.current[row.section] ?? row.content }))
        }
      )
      .subscribe()

    function handleVisibility() {
      if (document.hidden) flush()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', flush)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', flush)
      supabase.removeChannel(channel)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department])

  return { values, status, saveState, setSection, flush }
}
