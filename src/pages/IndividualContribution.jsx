import { useState } from 'react'
import { Button, Field, IconPencil, IconTrash, LoadState, SelectField } from '../components/ui'
import PageHero from '../components/PageHero'
import { DepartmentReflectionCard, REFLECTION_PROMPTS, hasAnyReflection, hasDeptReflection } from '../components/DepartmentReflectionCard'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useCurrentMember } from '../lib/useCurrentMember'
import { useIndividualCases } from '../lib/useIndividualCases'
import { initials, uploadAvatar } from '../lib/avatar'
import { underlinedField } from '../lib/pdf'
import { formatDateRange } from '../lib/date'
import { supabase } from '../lib/supabase'
import { departments } from '../data/departments'
import { GROUP_MEMBERS, SCHOOL_NAME_SHORT, ROTATION_LABEL, studentFullName } from '../data/group'

// Same soft, identity-label-only gating as the rest of the app (see
// useCurrentMember.js) — not real access control, just keeps a member from
// casually editing someone else's card while they're the one in Edit Mode.
function isOwnRow(row, member) {
  if (!member || !row.student_name) return false
  return row.student_name.trim().toLowerCase() === member.trim().toLowerCase()
}

// One-page "STUDENT REFLECTION" form per student, matching the paper
// template this replaces: letterhead, underlined header fields, then each
// department's four reflection questions in full (only departments with an
// answer are included).
async function exportStudentReflectionPdf(row, groupInfo, reflections) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 54
  const maxWidth = pageWidth - marginX * 2
  let y = 56

  function ensureRoom(next) {
    if (y + next > pageHeight - 56) {
      doc.addPage()
      y = 56
    }
  }

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

  const answeredDepartments = departments
    .map((dept) => ({ dept, reflection: reflections.find((r) => r.department === dept.slug) }))
    .filter(({ reflection }) => hasDeptReflection(reflection))

  answeredDepartments.forEach(({ dept, reflection }) => {
    ensureRoom(30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.text(dept.name, marginX, y)
    y += 18

    REFLECTION_PROMPTS.forEach(([key, label]) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      const labelLines = doc.splitTextToSize(`${label}:`, maxWidth)
      ensureRoom(labelLines.length * 14 + 14)
      doc.text(labelLines, marginX, y)
      y += labelLines.length * 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(reflection[key] || '—', maxWidth)
      ensureRoom(lines.length * 14 + 10)
      doc.text(lines, marginX, y)
      y += lines.length * 14 + 14
    })
    y += 12
  })

  if (answeredDepartments.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.text('No department reflections recorded yet.', marginX, y)
  }

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

/** Year Level / Section doesn't vary by department, so it lives on the
 * student's own row and saves independently of any department card. */
function YearLevelField({ row, onUpdate }) {
  const [value, setValue] = useState(row.year_level_section || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const dirty = value !== (row.year_level_section || '')

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { error } = await onUpdate(row.id, { year_level_section: value })
    setSaving(false)
    if (error) setError(error.message)
  }

  return (
    <div>
      <Field label="Year Level / Section" value={value} onChange={(e) => setValue(e.target.value)} />
      {dirty && (
        <div className="flex items-center gap-2 mt-2">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          {error && <p className="text-sm text-red-600">Failed to save: {error}</p>}
        </div>
      )}
    </div>
  )
}

function StudentReflectionSection({ row, groupInfo, reflections, canEdit, openDept, setOpenDept, onSaveReflection, onUpdate }) {
  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-ink-100">
      <p className="text-sm font-semibold text-ink-900">Student Reflection</p>
      {canEdit && (
        <div className="text-sm text-ink-500 space-y-0.5">
          <p><span className="font-semibold text-ink-700">Name of Student:</span> {studentFullName(row.student_name)}</p>
          <p><span className="font-semibold text-ink-700">Group:</span> {groupInfo.group_name || '—'}</p>
          <p><span className="font-semibold text-ink-700">Rotation Block:</span> {groupInfo.rotation_block || '—'}</p>
          <p><span className="font-semibold text-ink-700">Inclusive Dates:</span> {formatDateRange(groupInfo.inclusive_date_start, groupInfo.inclusive_date_end) || '—'}</p>
        </div>
      )}
      {canEdit ? (
        <YearLevelField row={row} onUpdate={onUpdate} />
      ) : (
        row.year_level_section && (
          <p className="text-sm text-ink-700"><span className="font-semibold">Year Level / Section:</span> {row.year_level_section}</p>
        )
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Reflection by Department</p>
        <div className="space-y-2">
          {departments.map((dept) => (
            <DepartmentReflectionCard
              key={dept.slug}
              dept={dept}
              reflection={reflections.find((r) => r.department === dept.slug)}
              editable={canEdit}
              open={openDept === dept.slug}
              onToggle={() => setOpenDept(openDept === dept.slug ? null : dept.slug)}
              onSave={(department, patch) => onSaveReflection(row.id, department, patch)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ContributionRow({ row, groupInfo, reflections, onUpdate, onDelete, onSaveReflection, canEdit }) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(row.student_name)
  const [openDept, setOpenDept] = useState(null)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState(null)

  const answered = hasAnyReflection(reflections)

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
      await exportStudentReflectionPdf(row, groupInfo, reflections)
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
            {answered && (
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

      <StudentReflectionSection
        row={row}
        groupInfo={groupInfo}
        reflections={reflections}
        canEdit={canEdit}
        openDept={openDept}
        setOpenDept={setOpenDept}
        onSaveReflection={onSaveReflection}
        onUpdate={onUpdate}
      />
    </div>
  )
}

export default function IndividualContribution() {
  const { rows, status, error, update, remove } = useSupabaseTable('individual_contributions', { orderBy: 'student_name', ascending: true })
  const { rows: reflectionRows, refetch: refetchReflections } = useSupabaseTable('individual_contribution_reflections', { orderBy: 'department', ascending: true })
  const { record: groupInfo } = useSupabaseRecord('group_metadata', 1)
  const { member } = useCurrentMember()
  const [exporting, setExporting] = useState(false)

  // Only the currently-editing student's own row gets exported — same as
  // the per-row "Export PDF" action, just reachable from the page header
  // without hunting for your card.
  const ownRow = rows.find((row) => isOwnRow(row, member))
  const ownReflections = reflectionRows.filter((r) => r.contribution_id === ownRow?.id)

  async function handleSaveReflection(contributionId, department, patch) {
    const { error } = await supabase
      .from('individual_contribution_reflections')
      .upsert({ contribution_id: contributionId, department, ...patch }, { onConflict: 'contribution_id,department' })
    if (!error) await refetchReflections()
    return { error }
  }

  async function handleExport() {
    if (!ownRow) return
    setExporting(true)
    try {
      await exportStudentReflectionPdf(ownRow, groupInfo, ownReflections)
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
              <ContributionRow
                key={row.id}
                row={row}
                groupInfo={groupInfo}
                reflections={reflectionRows.filter((r) => r.contribution_id === row.id)}
                onUpdate={update}
                onDelete={remove}
                onSaveReflection={handleSaveReflection}
                canEdit={isOwnRow(row, member)}
              />
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
