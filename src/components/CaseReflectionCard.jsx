import { useState } from 'react'
import { Area, Button, IconTrash } from './ui'
import { underlinedField } from '../lib/pdf'

/** The essay-only field set. Student, group, and case details are captured
 * once when the reflection is created from a Case Log Census entry and are
 * never editable afterward — only these fields are. */
export function CaseReflectionForm({ values, onChange }) {
  function set(key, val) {
    onChange({ ...values, [key]: val })
  }

  return (
    <div className="space-y-6">
      <Area label="Most common cases/conditions encountered" value={values.common_cases} onChange={(e) => set('common_cases', e.target.value)} minRows={3} />
      <Area label="Skills I was able to observe or practice" value={values.skills_practiced} onChange={(e) => set('skills_practiced', e.target.value)} minRows={3} />
      <Area label="One clinical lesson I learned from this rotation" value={values.clinical_lesson} onChange={(e) => set('clinical_lesson', e.target.value)} minRows={3} />
      <Area label="One area I need to improve before clerkship" value={values.improvement_area} onChange={(e) => set('improvement_area', e.target.value)} minRows={3} />
    </div>
  )
}

async function exportReflectionPdf(reflection) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 50
  const lineEndX = pageWidth - marginX
  let y = 60

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('STUDENT REFLECTION', pageWidth / 2, y, { align: 'center' })
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('USM College of Medicine', pageWidth / 2, y, { align: 'center' })
  y += 14
  doc.text('Clinical Rotation – SY 2026–2027', pageWidth / 2, y, { align: 'center' })
  y += 32

  doc.setFontSize(10)
  underlinedField(doc, 'Name of Student:', reflection.student_name, marginX, y, lineEndX)
  y += 22
  underlinedField(doc, 'Year Level / Section:', reflection.year_level_section, marginX, y, lineEndX)
  y += 22
  underlinedField(doc, 'Group:', reflection.group_name, marginX, y, lineEndX)
  y += 22
  underlinedField(doc, 'Rotation Block:', reflection.rotation_block, marginX, y, lineEndX)
  y += 22
  underlinedField(doc, 'Inclusive Dates:', reflection.inclusive_dates, marginX, y, lineEndX)
  y += 36

  const maxWidth = lineEndX - marginX
  const sections = [
    ['Most common cases/conditions encountered:', reflection.common_cases],
    ['Skills I was able to observe or practice:', reflection.skills_practiced],
    ['One clinical lesson I learned from this rotation:', reflection.clinical_lesson],
    ['One area I need to improve before clerkship:', reflection.improvement_area],
  ]

  sections.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(label, marginX, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(value || ' ', maxWidth)
    doc.text(lines, marginX, y)
    y += lines.length * 13 + 20
  })

  doc.save(`student_reflection_${reflection.reflection_no}.pdf`)
}

function LockedField({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      <p className="text-sm text-ink-500 mt-0.5">{value || <span className="text-ink-400 italic">—</span>}</p>
    </div>
  )
}

export default function CaseReflectionCard({ reflection, caseEntry, onSave, onDelete, defaultOpen = false, defaultEditing = false }) {
  const [open, setOpen] = useState(defaultOpen || defaultEditing)
  const [editing, setEditing] = useState(defaultEditing)
  const [draft, setDraft] = useState(reflection)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [exporting, setExporting] = useState(false)

  const summaryLine = [reflection.student_name, reflection.year_level_section].filter(Boolean).join(' · ')

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await onSave({
      common_cases: draft.common_cases,
      skills_practiced: draft.skills_practiced,
      clinical_lesson: draft.clinical_lesson,
      improvement_area: draft.improvement_area,
    })
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this reflection? This cannot be undone.')) {
      onDelete()
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportReflectionPdf(reflection)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-7 py-4 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Selected Case Reflection No. {reflection.reflection_no}
          </p>
          <p className="text-sm text-ink-500 mt-0.5">{summaryLine || 'Not yet filled in'}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            onClick={(e) => { e.stopPropagation(); handleDelete() }}
            role="button"
            aria-label="Delete this reflection"
            className="w-8 h-8 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <IconTrash />
          </span>
          <svg viewBox="0 0 24 24" className={`w-5 h-5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 sm:px-7 pb-7 pt-1 border-t border-ink-100 space-y-6">
          <div className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">
              Student &amp; case details — auto-filled, locked
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LockedField label="Name of Student" value={reflection.student_name} />
              <LockedField label="Year Level / Section" value={reflection.year_level_section} />
              <LockedField label="Group" value={reflection.group_name} />
              <LockedField label="Rotation Block" value={reflection.rotation_block} />
              <LockedField label="Inclusive Dates" value={reflection.inclusive_dates} />
            </div>
            {caseEntry && (
              <p className="text-sm text-ink-500 mt-3">
                Selected case: {[caseEntry.department, caseEntry.clinical_area, caseEntry.chief_complaint].filter(Boolean).join(' · ') || '—'}
              </p>
            )}
          </div>

          {editing ? (
            <div className="space-y-6">
              <CaseReflectionForm values={draft} onChange={setDraft} />
              {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="outline" onClick={() => { setDraft(reflection); setEditing(false) }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ReflectionReadout reflection={reflection} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setDraft(reflection); setEditing(true) }}>Edit Reflection</Button>
                <Button variant="outline" onClick={handleExport} disabled={exporting}>
                  {exporting ? 'Preparing PDF…' : 'Export to PDF'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReadField({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      <p className="text-sm text-ink-500 whitespace-pre-line mt-1">{value || <span className="text-ink-400 italic">Not provided</span>}</p>
    </div>
  )
}

function ReflectionReadout({ reflection: r }) {
  return (
    <div className="space-y-6">
      <ReadField label="Most common cases/conditions encountered" value={r.common_cases} />
      <ReadField label="Skills I was able to observe or practice" value={r.skills_practiced} />
      <ReadField label="One clinical lesson I learned from this rotation" value={r.clinical_lesson} />
      <ReadField label="One area I need to improve before clerkship" value={r.improvement_area} />
    </div>
  )
}
