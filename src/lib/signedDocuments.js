import { supabase } from './supabase'

const BUCKET = 'signed-case-logs'
const MAX_SIGNED_DOC_BYTES = 15 * 1024 * 1024

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/** Uploads a scanned, hand-signed Case Log Census PDF to the public
 * `signed-case-logs` bucket. Unlike avatars (one file per student, upsert
 * overwrites), there's no natural unique key here, so every upload gets a
 * timestamp-prefixed path — guarantees no collisions and gives free
 * chronological ordering when listed. */
export async function uploadSignedDocument(file) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    return { error: { message: 'Please choose a PDF file.' } }
  }
  if (file.size > MAX_SIGNED_DOC_BYTES) {
    return { error: { message: 'File must be smaller than 15MB.' } }
  }
  const path = `${Date.now()}-${sanitizeFilename(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600' })
  if (error) return { error }
  return {}
}

/** Lists every scanned signed copy uploaded so far, newest first. */
export async function listSignedDocuments() {
  const { data, error } = await supabase.storage.from(BUCKET).list('', { sortBy: { column: 'created_at', order: 'desc' } })
  if (error) return { data: [], error }
  const documents = (data ?? [])
    .filter((item) => !item.name.startsWith('.'))
    .map((item) => ({
      name: item.name,
      path: item.name,
      url: supabase.storage.from(BUCKET).getPublicUrl(item.name).data.publicUrl,
      size: item.metadata?.size,
      createdAt: item.created_at,
    }))
  return { data: documents }
}

/** Deletes a scanned signed copy by its storage path. */
export async function deleteSignedDocument(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) return { error }
  return {}
}
