import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'

const SAVE_DEBOUNCE_MS = 700

/**
 * Binds to a single-row "settings" table (id = fixed primary key). Reads it
 * once, subscribes to realtime UPDATEs from other clients, and debounces
 * field writes into one .update() call per pause in typing.
 *
 * Returns { record, status, saveState, setField, flush }
 *   status:    'loading' | 'ready' | 'error'
 *   saveState: 'idle' | 'saving' | 'saved' | 'error'
 */
export function useSupabaseRecord(table, id = 1) {
  const [record, setRecord] = useState(null)
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
    if (Object.keys(patch).length === 0) return
    pendingRef.current = {}
    setSaveState('saving')
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) {
      setSaveState('error')
      return
    }
    setSaveState('saved')
    setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2000)
  }, [table, id])

  const setField = useCallback(
    (key, value) => {
      setRecord((prev) => ({ ...prev, [key]: value }))
      pendingRef.current[key] = value
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
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
      if (cancelled) return
      if (error) {
        setStatus('error')
        return
      }
      setRecord(data)
      setStatus('ready')
    }
    load()

    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(`${table}_${id}_record`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table, filter: `id=eq.${id}` },
        (payload) => {
          setRecord((prev) => ({ ...prev, ...payload.new, ...pendingRef.current }))
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
  }, [table, id])

  return { record: record ?? {}, status, saveState, setField, flush }
}
