import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'

/**
 * Binds to a list-style table: fetches all rows, subscribes to realtime
 * changes from other clients, and exposes insert/update/remove helpers that
 * refetch on success so the local view stays authoritative.
 *
 * Returns { rows, status, error, refetch, insert, update, remove }
 *   status: 'loading' | 'ready' | 'error'
 */
export function useSupabaseTable(table, { orderBy = 'created_at', ascending = true } = {}) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus('error')
      setError('Supabase is not configured.')
      return
    }
    const { data, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending })
    if (fetchError) {
      setStatus('error')
      setError(fetchError.message)
      return
    }
    setRows(data ?? [])
    setStatus('ready')
    setError(null)
  }, [table, orderBy, ascending])

  useEffect(() => {
    refetch()
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(`${table}_list`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => refetch())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [table, refetch])

  const insert = useCallback(
    async (row) => {
      const { error: insertError } = await supabase.from(table).insert(row)
      if (insertError) return { error: insertError }
      await refetch()
      return {}
    },
    [table, refetch]
  )

  const update = useCallback(
    async (id, patch) => {
      const { error: updateError } = await supabase.from(table).update(patch).eq('id', id)
      if (updateError) return { error: updateError }
      await refetch()
      return {}
    },
    [table, refetch]
  )

  const remove = useCallback(
    async (id) => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id)
      if (deleteError) return { error: deleteError }
      await refetch()
      return {}
    },
    [table, refetch]
  )

  return { rows, status, error, refetch, insert, update, remove }
}
