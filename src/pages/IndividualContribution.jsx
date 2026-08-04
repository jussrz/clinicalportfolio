import { useState } from 'react'
import { Area, Button, Field, IconPencil, IconTrash, LoadState, SelectField } from '../components/ui'
import PageHero from '../components/PageHero'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useCurrentMember } from '../lib/useCurrentMember'
import { useIndividualCases } from '../lib/useIndividualCases'
import { initials, uploadAvatar } from '../lib/avatar'
import { underlinedField } from '../lib/pdf'
import { formatDateRange } from '../lib/date'
import { GROUP_MEMBERS, SCHOOL_NAME_SHORT, ROTATION_LABEL, studentFullName } from '../data/group'

const REFLECTION_PROMPTS = [
  ['common_cases', 'Most common cases/conditions encountered'],
  ['skills_observed', 'Skills I was able to observe or practice'],
  ['lesson_learned', 'One clinical lesson I learned from this rotation'],
  ['area_to_improve', 'One area I need to improve before clerkship'],
]

// Same soft, identity-label-only gating as the rest of the app (see
// useCurrentMember.js) — not real access control, just keeps a member from
// casually editing someone else's card while they're the one in Edit Mode.
function isOwnRow(row, member) {
  if (!member || !row.student_name) return false
  return row.student_name.trim().toLowerCase() === member.trim().toLowerCase()
}

function hasReflection(row) {
  return Boolean(row.year_level_section || row.common_cases || row.skills_observed || row.lesson_learned || row.area_to_improve)
}

// One-page "STUDENT REFLECTION" form per student, matching the paper
// template this replaces: letterhead, underlined header fields, then the
// four reflection questions in full.
async function exportStudentReflectionPdf(row, groupInfo) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 54
  const maxWidth = pageWidth - marginX * 2
  let y = 56

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('STUDENT REFLECTION', pageWidth / 2, y, { align: 'center' })
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(SCHOOL_NAME_SHORT, pageWidth / 2, y, { align: 'center' })
  y += 14
  doc.text(ROTATION_LABEL, pageWidth / 2, y, { align: 'center' })
  y += 30

  doc.setFontSize(10)
  underlinedField(doc, 'Name of Student:', studentFullName(row.student_name), marginX, y, pageWidth - marginX - 40)
  y += 22
  underlinedField(doc, 'Year Level / Section:', row.year_level_section || '', marginX, y, pageWidth - marginX - 40)
  y += 22
  underlinedField(doc, 'Group:', groupInfo.group_name || '', marginX, y, 280)
  y += 22
  underlinedField(doc, 'Rotation Block:', groupInfo.rotation_block || '', marginX, y, 280)
  y += 22
  underlinedField(doc, 'Inclusive Dates:', formatDateRange(groupInfo.inclusive_date_start, groupInfo.inclusive_date_end), marginX, y, 320)
  y += 36

  REFLECTION_PROMPTS.forEach(([key, label]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.text(`${label}:`, marginX, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(row[key] || '—', maxWidth)
    doc.text(lines, marginX, y)
    y += lines.length * 14 + 24
  })

  doc.save(`${(row.student_name || 'student').toLowerCase()}_reflection.pdf`)
}

/** Cases a student contributed to aren't typed by hand — they're read live
 * off the Group Case Log Census via student_assigned, keyed by the same
 * roster dropdown value as this row's student_name. */
function CasesLoggedList({ studentName }) {
  const { cases } = useIndividualCases(studentName)
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">Cases Logged</p>
      {cases.length > 0 ? (
        <ul className="text-sm text-ink-700 space-y-1">
          {cases.map((c) => (
            <li key={c.id}>No. {c.caseNo} — {c.patient_code || '—'}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-300 italic">No cases logged yet.</p>
      )}
    </div>
  )
}

function ReflectionReadout({ row }) {
  return (
    <div className="space-y-3 pt-4 mt-4 border-t border-ink-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Student Reflection</p>
      {row.year_level_section && (
        <p className="text-sm text-ink-700"><span className="font-semibold">Year Level / Section:</span> {row.year_level_section}</p>
      )}
      {REFLECTION_PROMPTS.map(([key, label]) => row[key] && (
        <div key={key}>
          <p className="text-sm font-semibold text-ink-800">{label}</p>
          <p className="text-sm text-ink-600 whitespace-pre-line mt-0.5">{row[key]}</p>
        </div>
      ))}
    </div>
  )
}

function ReflectionForm({ row, groupInfo, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    year_level_section: row.year_level_section || '',
    common_cases: row.common_cases || '',
    skills_observed: row.skills_observed || '',
    lesson_learned: row.lesson_learned || '',
    area_to_improve: row.area_to_improve || '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await onSave(draft)
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    onCancel()
  }

  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-ink-100">
      <p className="text-sm font-semibold text-ink-900">Student Reflection</p>
      <div className="text-sm text-ink-500 space-y-0.5">
        <p><span className="font-semibold text-ink-700">Name of Student:</span> {studentFullName(row.student_name)}</p>
        <p><span className="font-semibold text-ink-700">Group:</span> {groupInfo.group_name || '—'}</p>
        <p><span className="font-semibold text-ink-700">Rotation Block:</span> {groupInfo.rotation_block || '—'}</p>
        <p><span className="font-semibold text-ink-700">Inclusive Dates:</span> {formatDateRange(groupInfo.inclusive_date_start, groupInfo.inclusive_date_end) || '—'}</p>
      </div>
      <Field label="Year Level / Section" value={draft.year_level_section} onChange={(e) => setDraft({ ...draft, year_level_section: e.target.value })} />
      {REFLECTION_PROMPTS.map(([key, label]) => (
        <Area
          key={key}
          label={label}
          value={draft[key]}
          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          minRows={2}
        />
      ))}
      {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Reflection'}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

function ContributionRow({ row, groupInfo, onUpdate, onDelete, canEdit }) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(row.student_name)
  const [reflecting, setReflecting] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState(null)

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !row.student_name) return
    setUploadingPhoto(true)
    setPhotoError(null)
    const { url, error } = await uploadAvatar(file, row.student_name)
    if (error) {
      setUploadingPhoto(false)
      setPhotoError(error.message)
      return
    }
    const { error: updateError } = await onUpdate(row.id, { photo_url: url })
    setUploadingPhoto(false)
    if (updateError) setPhotoError(updateError.message)
  }

  async function handleSaveName() {
    setSavingName(true)
    setNameError(null)
    const { error } = await onUpdate(row.id, { student_name: nameDraft })
    setSavingName(false)
    if (error) {
      setNameError(error.message)
      return
    }
    setEditingName(false)
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportStudentReflectionPdf(row, groupInfo)
    } finally {
      setExporting(false)
    }
  }

  function handleDelete() {
    if (window.confirm(`Remove ${row.student_name ? studentFullName(row.student_name) : 'this student'} from the contributions list?`)) {
      onDelete(row.id)
    }
  }

  if (editingName) {
    return (
      <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7 space-y-4">
        <SelectField label="Student" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}>
          <option value="" disabled>Select student</option>
          {GROUP_MEMBERS.map((m) => <option key={m} value={m}>{studentFullName(m)}</option>)}
        </SelectField>
        {nameError && <p className="text-sm text-red-600">Failed to save: {nameError}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSaveName} disabled={savingName}>{savingName ? 'Saving…' : 'Save'}</Button>
          <Button variant="outline" onClick={() => { setNameDraft(row.student_name); setEditingName(false) }}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {row.photo_url ? (
              <img src={row.photo_url} alt="" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-semibold">
                {initials(row.student_name ? studentFullName(row.student_name) : '?')}
              </div>
            )}
            {canEdit && (
              <label className="absolute -bottom-1 -right-1 w-5 h-5 grid place-items-center rounded-full bg-white border border-ink-200 text-ink-500 hover:text-brand-700 cursor-pointer shadow-sm">
                <IconPencil className="w-3 h-3" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploadingPhoto} />
              </label>
            )}
          </div>
          <p className="font-display text-[15px] font-semibold text-ink-800">
            {row.student_name ? studentFullName(row.student_name) : 'Unnamed student'}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => setReflecting((v) => !v)} className="text-xs font-medium text-brand-700 hover:text-brand-800 px-2 py-1">
              {hasReflection(row) ? 'Edit Reflection' : 'Add Reflection'}
            </button>
            {hasReflection(row) && (
              <button type="button" onClick={handleExport} disabled={exporting} className="text-xs font-medium text-brand-700 hover:text-brand-800 px-2 py-1">
                {exporting ? 'Exporting…' : 'Export PDF'}
              </button>
            )}
            <button type="button" onClick={() => { setNameDraft(row.student_name); setEditingName(true) }} className="text-xs font-medium text-brand-700 hover:text-brand-800 px-2 py-1">
              Edit
            </button>
            <button type="button" onClick={handleDelete} aria-label="Remove student" className="w-7 h-7 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors">
              <IconTrash />
            </button>
          </div>
        )}
      </div>
      {uploadingPhoto && <p className="text-xs text-ink-400 mt-2">Uploading photo…</p>}
      {photoError && <p className="text-xs text-red-600 mt-2">Failed to upload photo: {photoError}</p>}

      <div className="mt-3">
        <CasesLoggedList studentName={row.student_name} />
      </div>

      {reflecting ? (
        <ReflectionForm row={row} groupInfo={groupInfo} onSave={(patch) => onUpdate(row.id, patch)} onCancel={() => setReflecting(false)} />
      ) : (
        hasReflection(row) && <ReflectionReadout row={row} />
      )}
    </div>
  )
}

export default function IndividualContribution() {
  const { rows, status, error, update, remove } = useSupabaseTable('individual_contributions', { orderBy: 'student_name', ascending: true })
  const { record: groupInfo } = useSupabaseRecord('group_metadata', 1)
  const { member } = useCurrentMember()
  const [exporting, setExporting] = useState(false)

  // Only the currently-editing student's own row gets exported — same as
  // the per-row "Export PDF" action, just reachable from the page header
  // without hunting for your card.
  const ownRow = rows.find((row) => isOwnRow(row, member))

  async function handleExport() {
    if (!ownRow) return
    setExporting(true)
    try {
      await exportStudentReflectionPdf(ownRow, groupInfo)
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
          <Button variant="outline" onClick={handleExport} disabled={!ownRow || exporting}>
            {exporting ? 'Preparing PDF…' : 'Export to PDF'}
          </Button>
        }
      />

      <div className="space-y-6">
        <LoadState status={status} error={error}>
          <div className="space-y-4">
            {rows.map((row) => (
              <ContributionRow key={row.id} row={row} groupInfo={groupInfo} onUpdate={update} onDelete={remove} canEdit={isOwnRow(row, member)} />
            ))}
            {rows.length === 0 && (
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
