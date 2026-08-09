import { useState } from 'react'
import { Section, LoadState, IconPlus, IconTrash } from './ui'
import { useSignedDocuments } from '../lib/useSignedDocuments'
import { uploadSignedDocument, deleteSignedDocument } from '../lib/signedDocuments'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Lists scanned copies of the hand-signed Case Log Census PDF, stored in
 * the public `signed-case-logs` Supabase Storage bucket. In `editable`
 * mode (the studio page) students can upload and delete files; the public
 * showcase page renders the same list read-only. */
export default function SignedCopiesSection({ editable = false }) {
  const { documents, status, error, refetch } = useSignedDocuments()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [deletingPath, setDeletingPath] = useState(null)

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const { error: uploadErr } = await uploadSignedDocument(file)
    setUploading(false)
    if (uploadErr) {
      setUploadError(uploadErr.message)
      return
    }
    await refetch()
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return
    setDeletingPath(doc.path)
    const { error: deleteErr } = await deleteSignedDocument(doc.path)
    setDeletingPath(null)
    if (deleteErr) {
      setUploadError(deleteErr.message)
      return
    }
    await refetch()
  }

  return (
    <div id="signed-copies" className="scroll-mt-20">
      <Section
        title="Signed Copies (Scanned PDFs)"
        subtitle="Scanned copies of the faculty/preceptor-signed case log, uploaded after hand-signing the exported PDF."
        actions={
          editable && (
            <label className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 cursor-pointer disabled:opacity-50">
              <IconPlus /> {uploading ? 'Uploading…' : 'Upload Signed PDF'}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          )
        }
      >
        <LoadState status={status} error={error}>
          {uploadError && <p className="text-sm text-red-600 mb-3">Failed to upload: {uploadError}</p>}
          {documents.length === 0 ? (
            <p className="text-sm text-ink-400 italic">
              {editable ? 'No signed copies uploaded yet.' : 'No signed copies have been uploaded yet.'}
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {documents.map((doc) => (
                <li key={doc.path} className="flex items-center justify-between gap-3 py-3">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    {doc.name}
                  </a>
                  <span className="shrink-0 text-xs text-ink-400">{formatFileSize(doc.size)}</span>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingPath === doc.path}
                      aria-label={`Delete ${doc.name}`}
                      className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <IconTrash />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </LoadState>
      </Section>
    </div>
  )
}
