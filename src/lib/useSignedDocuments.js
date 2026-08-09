import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from './supabase'
import { listSignedDocuments } from './signedDocuments'

/**
 * Fetches the list of scanned signed Case Log Census PDFs.
 *
 * Returns { documents, status, error, refetch }
 *   status: 'loading' | 'ready' | 'error'
 */
export function useSignedDocuments() {
  const [documents, setDocuments] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus('error')
      setError('Supabase is not configured.')
      return
    }
    const { data, error: fetchError } = await listSignedDocuments()
    if (fetchError) {
      setStatus('error')
      setError(fetchError.message)
      return
    }
    setDocuments(data)
    setStatus('ready')
    setError(null)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { documents, status, error, refetch }
}
