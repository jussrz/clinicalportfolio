import { useState } from 'react'
import { Button, IconPlus, LoadState, Notice, PageHeader } from '../components/ui'
import CaseReflectionCard, { CaseReflectionForm, emptyReflection } from '../components/CaseReflectionCard'
import { useSupabaseTable } from '../lib/useSupabaseTable'

export default function CaseReflections() {
  const { rows, status, error, insert, update, remove } = useSupabaseTable('case_reflections', { orderBy: 'reflection_no', ascending: true })
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(emptyReflection)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleAddSave() {
    setSaving(true)
    setSaveError(null)
    // reflection_no is assigned server-side (see supabase/schema.sql) so
    // concurrent adds from different group members can never collide.
    const { error: insertError } = await insert(draft)
    setSaving(false)
    if (insertError) {
      setSaveError(insertError.message)
      return
    }
    setDraft(emptyReflection)
    setAdding(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Selected Case Reflections"
        title="Selected Case Reflections"
        description="From the case log census, the group selects important cases for deeper discussion. Aim for at least one selected case reflection per major department, or 3–5 per rotation cycle."
      />

      <div className="space-y-6">
        <Notice>
          Use patient codes only in every reflection below — never patient names, hospital
          numbers, or other identifying information.
        </Notice>

        <LoadState status={status} error={error}>
          <div className="space-y-6">
            {rows.map((r) => (
              <CaseReflectionCard
                key={r.id}
                reflection={r}
                onSave={(values) => update(r.id, values)}
                onDelete={() => remove(r.id)}
              />
            ))}

            {rows.length === 0 && !adding && (
              <div className="text-center py-10 border border-dashed border-ink-300 rounded-2xl">
                <p className="text-sm text-ink-500">No case reflections yet.</p>
              </div>
            )}
          </div>
        </LoadState>

        {adding ? (
          <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              New Case Reflection
            </p>
            <CaseReflectionForm values={draft} onChange={setDraft} />
            {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
            <div className="flex gap-2">
              <Button onClick={handleAddSave} disabled={saving}>{saving ? 'Saving…' : 'Save Reflection'}</Button>
              <Button variant="outline" onClick={() => { setDraft(emptyReflection); setAdding(false) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <IconPlus /> Add Case Reflection
          </Button>
        )}
      </div>
    </div>
  )
}
