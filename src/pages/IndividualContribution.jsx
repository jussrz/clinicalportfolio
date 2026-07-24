import { useState } from 'react'
import { Area, Button, Field, IconPlus, IconTrash, LoadState, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { exportPromptsPdf } from '../lib/pdf'
import { GROUP_NAME } from '../data/group'

const emptyRow = { student_name: '', contribution_summary: '' }

function ContributionRow({ row, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(row)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await onUpdate(row.id, draft)
    setSaving(false)
    if (!error) setEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Remove ${row.student_name || 'this student'} from the contributions list?`)) {
      onDelete(row.id)
    }
  }

  if (editing) {
    return (
      <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7 space-y-4">
        <Field label="Student Name" value={draft.student_name} onChange={(e) => setDraft({ ...draft, student_name: e.target.value })} />
        <Area label="Contribution Summary" value={draft.contribution_summary} onChange={(e) => setDraft({ ...draft, contribution_summary: e.target.value })} minRows={3} />
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</Button>
          <Button variant="outline" onClick={() => { setDraft(row); setEditing(false) }}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[15px] font-semibold text-ink-800">{row.student_name || 'Unnamed student'}</p>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => { setDraft(row); setEditing(true) }} className="text-xs font-medium text-brand-700 hover:text-brand-800 px-2 py-1">
            Edit
          </button>
          <button type="button" onClick={handleDelete} aria-label="Remove student" className="w-7 h-7 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors">
            <IconTrash />
          </button>
        </div>
      </div>
      <p className="text-[15px] text-ink-700 mt-2 whitespace-pre-line">
        {row.contribution_summary || <span className="text-ink-400 italic">No contribution summary yet.</span>}
      </p>
    </div>
  )
}

export default function IndividualContribution() {
  const { rows, status, error, insert, update, remove } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(emptyRow)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function handleAdd() {
    setSaving(true)
    const { error: insertError } = await insert(draft)
    setSaving(false)
    if (!insertError) {
      setDraft(emptyRow)
      setAdding(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: `${GROUP_NAME} Individual Contribution`,
        prompts: rows.map((row) => ({ label: row.student_name || 'Unnamed student', value: row.contribution_summary })),
        filename: 'group_individual_contribution.pdf',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Individual Contribution"
        title="Individual Contribution"
        description="Although the portfolio is submitted as a group, each student's contributions are documented here."
        actions={
          <Button variant="outline" onClick={handleExport} disabled={rows.length === 0 || exporting}>
            {exporting ? 'Preparing PDF…' : 'Export to PDF'}
          </Button>
        }
      />

      <div className="space-y-6">
        {adding ? (
          <Section title="Add Student">
            <div className="space-y-4">
              <Field label="Student Name" value={draft.student_name} onChange={(e) => setDraft({ ...draft, student_name: e.target.value })} />
              <Area label="Contribution Summary" value={draft.contribution_summary} onChange={(e) => setDraft({ ...draft, contribution_summary: e.target.value })} minRows={3} />
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</Button>
                <Button variant="outline" onClick={() => { setDraft(emptyRow); setAdding(false) }}>Cancel</Button>
              </div>
            </div>
          </Section>
        ) : (
          <Button onClick={() => setAdding(true)}>
            <IconPlus /> Add Student
          </Button>
        )}

        <LoadState status={status} error={error}>
          <div className="space-y-4">
            {rows.map((row) => (
              <ContributionRow key={row.id} row={row} onUpdate={update} onDelete={remove} />
            ))}
            {rows.length === 0 && !adding && (
              <div className="text-center py-10 border border-dashed border-ink-300 rounded-2xl">
                <p className="text-sm text-ink-500">No students added yet.</p>
              </div>
            )}
          </div>
        </LoadState>
      </div>
    </div>
  )
}
